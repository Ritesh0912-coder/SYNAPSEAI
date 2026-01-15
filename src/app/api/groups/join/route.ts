import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectToDatabase from '@/lib/mongodb';
import Group from '@/models/Group';
import { authOptions } from '@/lib/auth';

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { token } = await req.json();

        if (!token) {
            return NextResponse.json({ error: 'Invite token is required' }, { status: 400 });
        }

        await connectToDatabase();

        // 1. Find the group that has this token
        const group = await Group.findOne({ "invites.token": token });

        if (!group) {
            return NextResponse.json({ error: 'Invalid invite link' }, { status: 404 });
        }

        // 2. Find the specific invite
        const invite = group.invites.find((i: any) => i.token === token);

        if (!invite || !invite.isActive) {
            return NextResponse.json({ error: 'This invite is no longer active' }, { status: 400 });
        }

        // 3. Check for expiration
        if (invite.expiresAt && new Date() > new Date(invite.expiresAt)) {
            return NextResponse.json({ error: 'This invite has expired' }, { status: 400 });
        }

        // 4. Check if user is already a member
        const isAlreadyMember = group.members.some((m: any) => m.userId === session.user.email);
        if (isAlreadyMember) {
            return NextResponse.json({ message: 'You are already a member of this group', groupId: group._id, alreadyMember: true });
        }

        // 5. Check for approval requirement
        const approvalRequired = group.settings?.approvalRequired === true;

        if (approvalRequired) {
            // Check if already pending
            const isAlreadyPending = group.pendingMembers.some((p: any) => p.userId === session.user.email);
            if (isAlreadyPending) {
                return NextResponse.json({
                    message: 'Your request to join is pending approval.',
                    groupId: group._id,
                    pending: true
                });
            }

            // Atomic push to pendingMembers and update invite status
            const updatedGroup = await Group.findOneAndUpdate(
                { _id: group._id, "invites.token": token },
                {
                    $push: {
                        pendingMembers: {
                            userId: session.user.email,
                            userName: session.user.name || session.user.email.split('@')[0],
                            role: invite.role || 'member',
                            requestedAt: new Date()
                        }
                    },
                    $set: { "invites.$.status": 'pending_approval' }
                },
                { new: true }
            );

            if (!updatedGroup) throw new Error("Failed to process approval request.");

            return NextResponse.json({
                message: 'Request sent. Administrator approval required.',
                groupId: updatedGroup._id,
                groupName: updatedGroup.name,
                pending: true
            });
        }

        // 6. Add user to group instantly (Atomic)
        const updatedGroup = await Group.findOneAndUpdate(
            {
                _id: group._id,
                "invites.token": token,
                "members.userId": { $ne: session.user.email } // Extra safety check
            },
            {
                $push: {
                    members: {
                        userId: session.user.email,
                        userName: session.user.name || session.user.email.split('@')[0],
                        role: invite.role || 'member',
                        joinedAt: new Date()
                    }
                },
                $set: { "invites.$.status": 'joined' }
            },
            { new: true }
        );

        if (!updatedGroup) {
            // This might happen if they joined in the split second between findOne and findOneAndUpdate
            return NextResponse.json({
                message: 'Successfully joined the group',
                groupId: group._id,
                groupName: group.name,
                joined: true
            });
        }

        return NextResponse.json({
            message: 'Successfully joined the group',
            groupId: updatedGroup._id,
            groupName: updatedGroup.name,
            joined: true
        });

    } catch (error) {
        console.error("Error joining group:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
