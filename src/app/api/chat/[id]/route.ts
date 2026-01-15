import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectToDatabase from '@/lib/mongodb';
import Chat from '@/models/Chat';
import Group from '@/models/Group';
import { authOptions } from '@/lib/auth';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectToDatabase();

        const chat = await Chat.findById(id);

        if (chat && chat.groupId) {
            // Shared Group Chat: Verify membership
            const group = await Group.findById(chat.groupId);
            const isMember = group?.members.some((m: any) => m.userId === session.user.email);
            if (!isMember) return NextResponse.json({ error: 'Denied access to this group intelligence.' }, { status: 403 });
        } else if (chat && chat.userId !== session.user.email) {
            // Personal Chat: Verify ownership
            return NextResponse.json({ error: 'Unauthorized access to personal transmission.' }, { status: 401 });
        }

        if (!chat) {
            return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
        }

        return NextResponse.json({
            messages: chat.messages,
            chatId: chat._id,
            title: chat.title
        });

    } catch (error) {
        console.error('Fetch Chat Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectToDatabase();

        const chat = await Chat.findById(id);
        if (!chat) return NextResponse.json({ error: 'Chat not found' }, { status: 404 });

        if (chat.groupId) {
            // Shared Group Chat: Only admin can delete? Or any member? 
            // For now, let's allow members but verify membership
            const group = await Group.findById(chat.groupId);
            const isMember = group?.members.some((m: any) => m.userId === session.user.email);
            if (!isMember) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        } else if (chat.userId !== session.user.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await Chat.deleteOne({ _id: id });

        return NextResponse.json({ message: 'Chat deleted successfully' });

    } catch (error) {
        console.error('Delete Chat Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { messages } = await req.json();
        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json({ error: 'Messages array is required' }, { status: 400 });
        }

        await connectToDatabase();

        const chat = await Chat.findById(id);
        if (!chat) return NextResponse.json({ error: 'Chat not found' }, { status: 404 });

        if (chat.groupId) {
            const group = await Group.findById(chat.groupId);
            const isMember = group?.members.some((m: any) => m.userId === session.user.email);
            if (!isMember) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

            // Viewers cannot update (save) shared history
            const userRole = group.members.find((m: any) => m.userId === session.user.email)?.role;
            if (userRole === 'viewer') return NextResponse.json({ error: 'Read-only access' }, { status: 403 });
        } else if (chat.userId !== session.user.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        chat.messages = messages;
        await chat.save();

        if (!chat) {
            return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Chat updated successfully', messages: chat.messages });

    } catch (error) {
        console.error('Update Chat Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
