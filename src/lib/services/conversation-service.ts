import { db } from '../firebase';
import { Timestamp } from 'firebase-admin/firestore';
import { calculateTokenCount } from '../utils/token-calculator';
import { updateUserCredits } from './user-service';

const CREDIT_COST_PER_MESSAGE = 1; // You might want to adjust based on token count or model used

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
  isArchived: boolean;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: FirebaseFirestore.Timestamp;
  tokenCount: number;
  creditCost: number;
  modelId: string;
}

export async function createConversation(userId: string, initialMessage: string): Promise<Conversation> {
  const title = generateTitle(initialMessage);
  const now = Timestamp.now();
  
  const conversationRef = db.collection('conversations').doc();
  const newConversation = {
    userId,
    title,
    createdAt: now,
    updatedAt: now,
    isArchived: false,
  };
  
  await conversationRef.set(newConversation);
  
  return {
    id: conversationRef.id,
    ...newConversation,
  };
}

export async function getUserConversations(userId: string, limit = 20): Promise<Conversation[]> {
  const conversationsRef = db.collection('conversations');
  const query = await conversationsRef
    .where('userId', '==', userId)
    .orderBy('updatedAt', 'desc')
    .limit(limit)
    .get();
    
  return query.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  } as Conversation));
}

export async function addMessage(
  userId: string,
  conversationId: string,
  content: string,
  role: 'user' | 'assistant',
  modelId: string
): Promise<Message> {
  // Calculate token count
  const tokenCount = calculateTokenCount(content);
  const creditCost = role === 'user' ? CREDIT_COST_PER_MESSAGE : 0;
  
  // Check if user has enough credits when it's a user message
  if (role === 'user') {
    try {
      await updateUserCredits(userId, -creditCost, 'message_sent');
    } catch (error) {
      throw new Error('Insufficient credits to send message');
    }
  }
  
  const conversationRef = db.collection('conversations').doc(conversationId);
  const messagesRef = conversationRef.collection('messages');
  
  // Update conversation timestamp
  await conversationRef.update({
    updatedAt: Timestamp.now(),
  });
  
  // Add the message
  const messageRef = messagesRef.doc();
  const now = Timestamp.now();
  
  const message = {
    role,
    content,
    timestamp: now,
    tokenCount,
    creditCost,
    modelId,
  };
  
  await messageRef.set(message);
  
  return {
    id: messageRef.id,
    ...message,
  };
}

export async function getConversationMessages(
  conversationId: string,
  limit = 50
): Promise<Message[]> {
  const messagesRef = db
    .collection('conversations')
    .doc(conversationId)
    .collection('messages');
    
  const query = await messagesRef
    .orderBy('timestamp', 'asc')
    .limit(limit)
    .get();
    
  return query.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  } as Message));
}

// Helper function to generate a title from the first message
function generateTitle(message: string): string {
  // Truncate message to first 40 chars and remove newlines
  const truncated = message.replace(/\n/g, ' ').slice(0, 40).trim();
  return truncated.length === 40 ? `${truncated}...` : truncated;
}