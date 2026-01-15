import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectToDatabase from '@/lib/mongodb';
import Group from '@/models/Group';
import Chat from '@/models/Chat';
import { authOptions } from '@/lib/auth';

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        await connectToDatabase();

        const group = await Group.findById(id);
        if (!group) {
            return NextResponse.json({ error: 'Group not found' }, { status: 404 });
        }

        // Verify user is the creator or an admin of the group
        const isAdmin = group.createdBy === session.user.email ||
            group.members.some((m: any) => m.userId === session.user?.email && m.role === 'admin');

        if (!isAdmin) {
            return NextResponse.json({ error: 'Forbidden: Admin access required to delete group' }, { status: 403 });
        }

        // 1. Delete all chats associated with this group
        await Chat.deleteMany({ groupId: id });

        // 2. Delete the group itself
        await Group.findByIdAndDelete(id);

        return NextResponse.json({ message: 'Group and associated data deleted successfully' });

    } catch (error) {
        console.error("Error deleting group:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
