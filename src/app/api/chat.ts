// pages/api/chat.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { OpenAI } from 'openai';
import { collection, addDoc, Timestamp, doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { message, sessionId } = req.body;

  try {
    // 1. Call OpenAI
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: message }],
    });

    // Firestore accessibility test
    try {
      await setDoc(doc(db, "test_collection", "test_document"), {
        message: "Firestore is accessible!"
      });
      console.log("Firestore test document written successfully!");
    } catch (firestoreError) {
      console.error("Error writing test document to Firestore:", firestoreError);
    }

    const reply = response.choices[0].message?.content || 'No response';

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
