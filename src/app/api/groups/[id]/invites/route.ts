import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectToDatabase from '@/lib/mongodb';
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

        const group = await Group.findById(id);
        if (!group) {
            return NextResponse.json({ error: 'Group not found' }, { status: 404 });
        }

        // Verify user is admin of the group
        const isAdmin = group.createdBy === session.user.email ||
            group.members.some((m: any) => m.userId === session.user?.email && m.role === 'admin');

        if (!isAdmin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        return NextResponse.json(group.invites);

    } catch (error) {
        console.error("Error fetching invites:", error);
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

        const { token, action } = await req.json(); // action: 'cancel' | 'resend'

        await connectToDatabase();

        const group = await Group.findById(id);
        if (!group) {
            return NextResponse.json({ error: 'Group not found' }, { status: 404 });
        }

        const isAdmin = group.createdBy === session.user.email ||
            group.members.some((m: any) => m.userId === session.user?.email && m.role === 'admin');

        if (!isAdmin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const invite = group.invites.find((i: any) => i.token === token);
        if (!invite) {
            return NextResponse.json({ error: 'Invite not found' }, { status: 404 });
        }

        if (action === 'cancel') {
            invite.isActive = false;
            invite.status = 'cancelled';
        } else if (action === 'resend') {
            // Logic to extension expiry or just log
            invite.isActive = true;
            invite.status = 'sent';
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 7);
            invite.expiresAt = expiresAt;

            console.log(`[RESEND] Resending invite ${token} to ${invite.recipient || 'Link'}`);
        }

        await group.save();

        return NextResponse.json({ success: true, invites: group.invites });

    } catch (error) {
        console.error("Error updating invite:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
