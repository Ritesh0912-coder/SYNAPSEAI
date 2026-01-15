import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectToDatabase from '@/lib/mongodb';
import Chat from '@/models/Chat';
import Group from '@/models/Group';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const groupId = searchParams.get('groupId');

        await connectToDatabase();

        const query: any = {};
        if (groupId) {
            // SHARED GROUP CONTEXT:
            // 1. Verify user is in this group
            const group = await Group.findById(groupId);
            const isMember = group?.members.some((m: any) => m.userId === session.user.email);

            if (!isMember) {
                return NextResponse.json({ error: 'Denied access to this group intelligence.' }, { status: 403 });
            }

            // 2. Query all chats for this group (shared)
            query.groupId = groupId;
        } else {
            // PERSONAL CONTEXT: Only show chats owned by user
            query.userId = session.user.email;
            query.groupId = { $in: [null, undefined] };
        }

        const chats = await Chat.find(query)
            .select('title createdAt updatedAt')
            .sort({ updatedAt: -1 });

        return NextResponse.json({ chats });

    } catch (error) {
        console.error('Fetch Chats Error:', error);
        return NextResponse.json({ error: (error as Error).message || 'Internal Server Error' }, { status: 500 });
    }
}
