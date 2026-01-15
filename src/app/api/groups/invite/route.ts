import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectToDatabase from '@/lib/mongodb';
import Group from '@/models/Group';
import crypto from 'crypto';
import { Resend } from 'resend';
import { authOptions } from '@/lib/auth';
import Notification from '@/models/Notification';
import User from '@/models/User';

// Initialize lazily to avoid crash if key is missing
let resend: Resend | null = null;
try {
    if (process.env.RESEND_API_KEY) {
        resend = new Resend(process.env.RESEND_API_KEY);
    }
} catch (e) {
    console.warn("Resend initialization failed:", e);
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { groupId, method = 'link', recipients, role = 'member', expiresDays = 7, personalMessage } = await req.json();

        if (!groupId) {
            return NextResponse.json({ error: 'Group ID is required' }, { status: 400 });
        }

        await connectToDatabase();

        const group = await Group.findById(groupId);
        if (!group) {
            return NextResponse.json({ error: 'Group not found' }, { status: 404 });
        }

        // Verify user is admin of the group or the creator
        const isAllowed = group.createdBy === session.user.email ||
            group.members.some((m: any) => m.userId === session.user?.email && m.role === 'admin');

        if (!isAllowed) {
            return NextResponse.json({ error: 'Forbidden: Admin clearance required to initiate unit invitations' }, { status: 403 });
        }

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + expiresDays);

        const inviteResults = [];

        // Collect all new invites in a local array
        const newInvites: any[] = [];

        if (method === 'link') {
            const token = crypto.randomBytes(16).toString('hex');
            const inviteObj = {
                token,
                method: 'link',
                role,
                status: 'sent',
                invitedBy: session.user.email,
                expiresAt,
                isActive: true
            };
            newInvites.push(inviteObj);
            const inviteLink = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/invite/${token}`;
            inviteResults.push({ method: 'link', inviteLink, token });
        } else if (method === 'email' || method === 'username') {
            if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
                return NextResponse.json({ error: 'Recipients array is required' }, { status: 400 });
            }

            for (const recipient of recipients) {
                const token = crypto.randomBytes(16).toString('hex');
                const inviteObj = {
                    token,
                    method,
                    recipient,
                    role,
                    status: 'sent',
                    invitedBy: session.user.email,
                    expiresAt,
                    isActive: true
                };
                newInvites.push(inviteObj);
                const inviteLink = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/invite/${token}`;

                // Email sending logic...
                if (method === 'email' && process.env.RESEND_API_KEY) {
                    try {
                        await resend.emails.send({
                            from: 'OMNI Intelligence <onboarding@resend.dev>',
                            to: recipient,
                            subject: `You’re invited to join ${group.name} on OMNI`,
                            html: `
                                <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                                    <h2 style="color: #3b82f6;">OMNI INTELLIGENCE UNIT INVITATION</h2>
                                    <p>Hello,</p>
                                    <p><strong>${session.user.name || session.user.email}</strong> has invited you to join the intelligence unit <strong>${group.name}</strong>.</p>
                                    ${personalMessage ? `<p style="padding: 10px; background: #f9f9f9; border-left: 4px solid #3b82f6;">${personalMessage}</p>` : ''}
                                    <div style="margin-top: 30px; text-align: center;">
                                        <a href="${inviteLink}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">JOIN UNIT</a>
                                    </div>
                                    <p style="margin-top: 30px; font-size: 12px; color: #666;">If you weren't expecting this, you can safely ignore this email.</p>
                                </div>
                            `
                        });
                        console.log(`Invite email sent to ${recipient}`);
                    } catch (emailError) {
                        console.error(`Failed to send email to ${recipient}:`, emailError);
                    }
                } else if (method === 'username') {
                    // Internal notification for username invite
                    try {
                        let targetEmail = recipient;

                        // Try to resolve username to email if it looks like a name (no @)
                        if (!recipient.includes('@')) {
                            const user = await User.findOne({
                                $or: [
                                    { name: recipient },
                                    { name: { $regex: new RegExp(`^${recipient}$`, 'i') } }
                                ]
                            });

                            if (user) {
                                targetEmail = user.email;
                                console.log(`[RESOLVE] Username "${recipient}" -> Email "${targetEmail}"`);
                            }
                        }

                        await Notification.create({
                            recipient: targetEmail,
                            sender: session.user.email,
                            type: 'invite',
                            title: 'New Unit Invitation',
                            message: `${session.user.name || session.user.email} invited you to join "${group.name}".`,
                            link: `/invite/${token}`,
                            metadata: { groupId, token }
                        });
                    } catch (notificationError) {
                        console.error(`Failed to create notification for ${recipient}:`, notificationError);
                    }
                }

                inviteResults.push({ recipient, method, token, inviteLink });
            }
        }

        // Atomic push all new invites
        await Group.findByIdAndUpdate(groupId, {
            $push: { invites: { $each: newInvites } }
        });

        return NextResponse.json({
            success: true,
            results: inviteResults,
            message: method === 'link' ? 'Invite link generated' : `Invites sent to ${recipients?.length} recipients`
        });

    } catch (error) {
        console.error("Error generating invites:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
