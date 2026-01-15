import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectToDatabase from '@/lib/mongodb';
import Group from '@/models/Group';
import { authOptions } from '@/lib/auth';

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

        const { userId: targetUserId, role } = await req.json(); // role = 'admin' | 'member'

        if (!targetUserId || !role) {
            return NextResponse.json({ error: 'User ID and role are required' }, { status: 400 });
        }

        if (!['admin', 'member', 'viewer'].includes(role)) {
            return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
        }

        await connectToDatabase();

        const group = await Group.findById(id);
        if (!group) {
            return NextResponse.json({ error: 'Group not found' }, { status: 404 });
        }

        // 1. Verify user is the creator or an admin of the group
        const isAdmin = group.createdBy === session.user.email ||
            group.members.some((m: any) => m.userId === session.user?.email && m.role === 'admin');

        if (!isAdmin) {
            return NextResponse.json({ error: 'Forbidden: Admin access required to change roles' }, { status: 403 });
        }

        // 2. Find member
        const member = group.members.find((m: any) => m.userId === targetUserId);
        if (!member) {
            return NextResponse.json({ error: 'Member not found' }, { status: 404 });
        }

        // 3. Prevent demoting the Creator
        if (targetUserId === group.createdBy && role !== 'admin') {
            return NextResponse.json({ error: 'Cannot demote the group creator' }, { status: 400 });
        }

        // 4. Update Role
        member.role = role;

        // 5. Log Action
        group.auditLog.push({
            action: 'UPDATE_ROLE',
            performedBy: session.user.email,
            target: targetUserId,
            details: `Changed role to ${role}`,
            timestamp: new Date()
        });

        await group.save();

        return NextResponse.json({ success: true, message: `Role updated to ${role}` });

    } catch (error) {
        console.error("Error updating role:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
