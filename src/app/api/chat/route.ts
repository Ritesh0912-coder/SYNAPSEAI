import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectToDatabase from '@/lib/mongodb';
import Chat from '@/models/Chat';
import OpenAI from 'openai';

const isOpenRouter = !!process.env.OPENROUTER_API_KEY;

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY || 'missing_key',
  baseURL: isOpenRouter ? "https://openrouter.ai/api/v1" : undefined,
  defaultHeaders: isOpenRouter ? {
    "HTTP-Referer": "https://omni-ai.com",
    "X-Title": "OMNI AI",
  } : undefined,
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message, chatId } = await req.json();
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    await connectToDatabase();

    // 1. Get or Create Chat Session
    let currentChat;
    if (chatId) {
      currentChat = await Chat.findOne({ _id: chatId, userId: session.user.email });
    }

    if (!currentChat) {
      currentChat = new Chat({
        userId: session.user.email,
        title: message.substring(0, 30) + (message.length > 30 ? '...' : ''),
        messages: []
      });
    }

    // 2. Add User Message
    currentChat.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date()
    });

    // 3. Call OMNI LLM (OpenAI or OpenRouter)
    const model = isOpenRouter ? "openai/gpt-3.5-turbo" : "gpt-3.5-turbo";

    const completion = await openai.chat.completions.create({
      model: model,
      messages: [
        {
          role: "system",
          content: "You are OMNI Intelligence, a world-class AI authority specializing in global business strategy, corporate deals, and entrepreneurial leadership. You possess vast knowledge of global markets, economic trends, and business management, comparable to a master researcher but optimized for high-stakes business decisions. You provide quick, precise, and actionable insights. Your goal is to help users master business games, negotiate complex deals, and execute world-class strategies. Your tone is professional, strategic, and highly intelligent. Always identify as OMNI Intelligence and maintain your focus on business excellence."
        },
        ...currentChat.messages.map((m: any) => ({
          role: m.role === 'ai' ? 'assistant' : 'user',
          content: m.content
        }))
      ],
    });

    const aiResponse = completion.choices[0].message.content;

    // 4. Add AI Message
    currentChat.messages.push({
      role: 'ai',
      content: aiResponse,
      timestamp: new Date()
    });

    await currentChat.save();

    return NextResponse.json({
      response: aiResponse,
      chatId: currentChat._id,
      messages: currentChat.messages
    });

  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
