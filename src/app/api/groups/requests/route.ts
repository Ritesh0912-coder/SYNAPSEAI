import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectToDatabase from '@/lib/mongodb';
import Group from '@/models/Group';
import Notification from '@/models/Notification';
import { authOptions } from '@/lib/auth';

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { userId, action } = await req.json(); // action = 'approve' | 'reject'

        if (!userId || !action) {
            return NextResponse.json({ error: 'User ID and action are required' }, { status: 400 });
        }

        await connectToDatabase();

        const group = await Group.findById(id);
        if (!group) {
            return NextResponse.json({ error: 'Group not found' }, { status: 404 });
        }

        // Verify admin
        const isAdmin = group.createdBy === session.user.email ||
            group.members.some((m: any) => m.userId === session.user?.email && m.role === 'admin');

        if (!isAdmin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Find pending member
        const pendingMember = group.pendingMembers.find((p: any) => p.userId === userId);
        if (!pendingMember) {
            return NextResponse.json({ error: 'Request not found' }, { status: 404 });
        }

        if (action === 'approve') {
            // Move to members
            group.members.push({
                userId: pendingMember.userId,
                userName: pendingMember.userName,
                role: 'member',
                joinedAt: new Date()
            });

            // Log Action
            group.auditLog.push({
                action: 'APPROVE_MEMBER',
                performedBy: session.user.email,
                target: pendingMember.userName,
                details: `Approved join request`,
                timestamp: new Date()
            });

            // Notify User
            await Notification.create({
                recipient: pendingMember.userId,
                sender: 'System',
                type: 'system',
                title: 'Join Request Approved',
                message: `You have been accepted into "${group.name}".`,
                link: '/chat' // Open chat
            });

        } else if (action === 'reject') {
            // Log Action
            group.auditLog.push({
                action: 'REJECT_MEMBER',
                performedBy: session.user.email,
                target: pendingMember.userName,
                details: `Rejected join request`,
                timestamp: new Date()
            });
        }

        // Remove from pending
        group.pendingMembers = group.pendingMembers.filter((p: any) => p.userId !== userId);

        await group.save();

        return NextResponse.json({ success: true, message: `Request ${action}ed` });

    } catch (error) {
        console.error("Error processing request:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
