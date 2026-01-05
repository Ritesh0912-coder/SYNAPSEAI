import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectToDatabase from '@/lib/mongodb';
import Chat from '@/models/Chat';

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session || !session.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectToDatabase();

        const chats = await Chat.find({ userId: session.user.email })
            .select('title createdAt updatedAt')
            .sort({ updatedAt: -1 });

        return NextResponse.json({ chats });

    } catch (error: any) {
        console.error('Fetch Chats Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
