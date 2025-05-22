// Enhanced client-side code with better error handling and user state
interface ChatResponse {
  message: string;
  conversationId: string;
  userCredits?: number;
}

interface ChatError {
  error: string;
  code?: string;
}

async function sendMessage(
  message: string, 
  conversationId?: string,
  onChunk?: (content: string) => void
): Promise<ChatResponse> {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        conversationId,
        model: 'gpt-3.5-turbo'
      }),
    });

    if (!response.ok) {
      const error: ChatError = await response.json();
      
      // Handle specific error cases
      if (response.status === 402) {
        throw new Error('Insufficient credits. Please wait for credits to refill or upgrade your account.');
      }
      
      throw new Error(error.error || 'Failed to send message');
    }

    // Get conversation ID and user credits from headers
    const newConversationId = response.headers.get('x-conversation-id');
    const userCredits = response.headers.get('x-user-credits');
    
    // Handle streaming response
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let assistantMessage = '';

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            if (data === '[DONE]') {
              // Stream finished
              console.log('Stream completed');
              return {
                message: assistantMessage,
                conversationId: newConversationId || conversationId || '',
                userCredits: userCredits ? parseInt(userCredits) : undefined
              };
            }
            
            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                assistantMessage += parsed.content;
                // Call the chunk callback if provided
                if (onChunk) {
                  onChunk(assistantMessage);
                }
              }
            } catch (e) {
              // Ignore parsing errors for malformed chunks
            }
          }
        }
      }
    }
    
    return {
      message: assistantMessage,
      conversationId: newConversationId || conversationId || '',
      userCredits: userCredits ? parseInt(userCredits) : undefined
    };
    
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}

// Function to get user's current credit balance
async function getUserCredits(): Promise<number> {
  try {
    const response = await fetch('/api/user/credits');
    if (!response.ok) {
      throw new Error('Failed to fetch user credits');
    }
    const data = await response.json();
    return data.credits;
  } catch (error) {
    console.error('Error fetching user credits:', error);
    return 0;
  }
}

// Function to get user's conversations
async function getUserConversations(limit = 20): Promise<any[]> {
  try {
    const response = await fetch(`/api/conversations?limit=${limit}`);
    if (!response.ok) {
      throw new Error('Failed to fetch conversations');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return [];
  }
}

export { sendMessage, getUserCredits, getUserConversations };