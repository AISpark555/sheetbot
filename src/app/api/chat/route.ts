import { NextRequest, NextResponse } from 'next/server';
import { createConversation, addMessage, getConversationMessages } from '@/lib/services/conversation-service';
import { OpenAI } from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    // Get user ID from middleware
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'User ID not found' }, { status: 401 });
    }
    
    // Parse the request body
    const { message, conversationId, model = 'gpt-3.5-turbo' } = await req.json();
    
    if (!message || typeof message !== 'string' || message.trim() === '') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Get or create conversation
    let currentConversationId = conversationId;
    if (!currentConversationId) {
      const newConversation = await createConversation(userId, message);
      currentConversationId = newConversation.id;
    }
    
    // Add user message to the conversation
    await addMessage(userId, currentConversationId, message, 'user', model);
    
    // Get conversation history for context
    const messages = await getConversationMessages(currentConversationId);
    
    // Format messages for OpenAI API
    const formattedMessages = messages.map(msg => ({
      role: msg.role as 'user' | 'assistant' | 'system',
      content: msg.content,
    }));
    
    // Call OpenAI API with streaming
    const response = await openai.chat.completions.create({
      model: model,
      messages: formattedMessages,
      stream: true,
    });
    
    // Create a readable stream to handle the OpenAI response
    const encoder = new TextEncoder();
    let fullResponse = '';
    
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of response) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              fullResponse += content;
              // Send the chunk to the client
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
            }
          }
          
          // Save the complete response to the database
          if (fullResponse) {
            await addMessage(
              userId,
              currentConversationId,
              fullResponse,
              'assistant',
              model
            );
          }
          
          // Send done signal
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          console.error('Stream error:', error);
          controller.error(error);
        }
      },
    });

    // Return streaming response
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'x-conversation-id': currentConversationId,
      },
    });
    
  } catch (error: any) {
    console.error('Chat API error:', error);
    
    // Handle credit-related errors
    if (error.message === 'Insufficient credits') {
      return NextResponse.json(
        { error: 'Insufficient credits to send message' },
        { status: 402 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
}