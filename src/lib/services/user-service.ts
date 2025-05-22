import { db } from '../firebase';
import { Timestamp } from 'firebase-admin/firestore';
import { getDeviceFingerprint } from '../utils/device-fingerPrint';
import { hashIp } from '../utils/hash-ip';

const INITIAL_CREDITS = 20;

export interface UserData {
  createdAt: FirebaseFirestore.Timestamp;
  lastActive: FirebaseFirestore.Timestamp;
  totalQueries: number;
  creditsRemaining: number;
  isAnonymous: boolean;
  deviceInfo: {
    fingerprint: string;
    userAgent: string;
    ipHash: string;
  };
}

export async function getOrCreateUser(req: Request): Promise<{ userId: string; isNewUser: boolean; credits: number }> {
  // Generate a unique identifier based on device information
  const fingerprint = await getDeviceFingerprint(req);
  const userAgent = req.headers.get('user-agent') || 'unknown';
  const ipAddress = (req.headers.get('x-forwarded-for') || 'unknown').split(',')[0];
  const ipHash = await hashIp(ipAddress);
  
  // Check if a user with this fingerprint already exists
  const usersRef = db.collection('users');
  const userQuery = await usersRef
    .where('deviceInfo.fingerprint', '==', fingerprint)
    .limit(1)
    .get();

  // User exists
  if (!userQuery.empty) {
    const userDoc = userQuery.docs[0];
    const userData = userDoc.data() as UserData;
    
    // Update last active time
    await userDoc.ref.update({
      lastActive: Timestamp.now(),
    });
    
    return { 
      userId: userDoc.id, 
      isNewUser: false, 
      credits: userData.creditsRemaining 
    };
  }
  
  // User doesn't exist, create a new one
  const newUserRef = usersRef.doc();
  const now = Timestamp.now();
  
  const newUserData: UserData = {
    createdAt: now,
    lastActive: now,
    totalQueries: 0,
    creditsRemaining: INITIAL_CREDITS,
    isAnonymous: true,
    deviceInfo: {
      fingerprint,
      userAgent,
      ipHash,
    }
  };
  
  await newUserRef.set(newUserData);
  
  // Record the initial credit grant transaction
  await recordCreditTransaction(newUserRef.id, INITIAL_CREDITS, 'initial_grant');
  
  return { 
    userId: newUserRef.id, 
    isNewUser: true, 
    credits: INITIAL_CREDITS 
  };
}

export async function updateUserCredits(userId: string, creditChange: number, reason: string, messageId?: string): Promise<number> {
  const userRef = db.collection('users').doc(userId);
  
  // Run as a transaction to ensure credit amounts stay accurate
  return db.runTransaction(async (transaction) => {
    const userDoc = await transaction.get(userRef);
    
    if (!userDoc.exists) {
      throw new Error(`User ${userId} not found`);
    }
    
    const userData = userDoc.data() as UserData;
    const newCreditBalance = userData.creditsRemaining + creditChange;
    
    if (newCreditBalance < 0) {
      throw new Error('Insufficient credits');
    }
    
    transaction.update(userRef, { 
      creditsRemaining: newCreditBalance,
      totalQueries: reason === 'message_sent' ? userData.totalQueries + 1 : userData.totalQueries,
      lastActive: Timestamp.now(),
    });
    
    // Record the transaction
    await recordCreditTransaction(userId, creditChange, reason, messageId);
    
    return newCreditBalance;
  });
}

async function recordCreditTransaction(
  userId: string, 
  amount: number, 
  reason: string, 
  messageId?: string
) {
  return db.collection('creditTransactions').add({
    userId,
    amount,
    reason,
    timestamp: Timestamp.now(),
    messageId: messageId || null,
  });
}