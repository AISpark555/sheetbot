// pages/api/chat.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { Configuration, OpenAIApi } from 'openai';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const openai = new OpenAIApi(
  new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  })
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { message, sessionId } = req.body;

  try {
    // 1. Call OpenAI
    const response = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: [{ role: 'user', content: message }],
    });

    const reply = response.data.choices[0].message?.content || 'No response';

    // 2. Store in Firestore
    const chatRef = collection(db, 'chats');
    await addDoc(chatRef, {
      sessionId,
      user: message,
      assistant: reply,
      timestamp: Timestamp.now(),
    });

    // 3. Return response
    res.status(200).json({ reply });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Chat error' });
  }
}
