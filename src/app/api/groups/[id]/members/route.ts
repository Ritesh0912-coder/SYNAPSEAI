import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectToDatabase from '@/lib/mongodb';
import Group from '@/models/Group';
import { authOptions } from '@/lib/auth';

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

        const { userId: targetUserId } = await req.json();

        if (!targetUserId) {
            return NextResponse.json({ error: 'User ID to remove is required' }, { status: 400 });
        }

        await connectToDatabase();

        const group = await Group.findById(id);
        if (!group) {
            return NextResponse.json({ error: 'Group not found' }, { status: 404 });
        }

        const isRemovingSelf = targetUserId === session.user.email;

        // 1. Verify permissions
        const isAdmin = group.createdBy === session.user.email ||
            group.members.some((m: any) => m.userId === session.user?.email && m.role === 'admin');

        if (!isRemovingSelf && !isAdmin) {
            return NextResponse.json({ error: 'Forbidden: Admin access required to remove members' }, { status: 403 });
        }

        // 2. Cannot remove the creator, and creator cannot leave their own group (must delete group or transfer ownership)
        if (targetUserId === group.createdBy) {
            return NextResponse.json({ error: 'The group creator cannot leave or be removed. Decommission the unit instead.' }, { status: 400 });
        }

        // 3. Remove from members
        group.members = group.members.filter((m: any) => m.userId !== targetUserId);

        // 4. Also remove from pending if exists
        group.pendingMembers = group.pendingMembers.filter((p: any) => p.userId !== targetUserId);

        // 5. Log Action
        group.auditLog.push({
            action: 'REMOVE_MEMBER',
            performedBy: session.user.email,
            target: targetUserId,
            details: `Removed user from group`,
            timestamp: new Date()
        });

        await group.save();

        return NextResponse.json({ message: 'Member removed successfully', members: group.members });

    } catch (error) {
        console.error("Error removing member:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
