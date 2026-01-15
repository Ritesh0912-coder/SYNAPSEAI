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

        const { name, description, industry, type, inviteMethod, settings } = await req.json();

        if (!name) {
            return NextResponse.json({ error: 'Group name is required' }, { status: 400 });
        }

        await connectToDatabase();

        const newGroup = await Group.create({
            name,
            description,
            industry,
            type: type || 'private',
            inviteMethod: inviteMethod || 'link',
            settings: settings || {
                canSendMessages: 'all',
                canInviteMembers: 'admin',
                adminPowers: ['remove', 'assign', 'mute']
            },
            createdBy: session.user.email,
            members: [
                {
                    userId: session.user.email,
                    userName: session.user.name || session.user.email.split('@')[0],
                    role: 'admin',
                    joinedAt: new Date()
                }
            ]
        });

        return NextResponse.json(newGroup, { status: 201 });

    } catch (error) {
        console.error("Error creating group:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectToDatabase();

        // Fetch groups where the user is a member
        const groups = await Group.find({
            "members.userId": session.user.email,
            isArchived: false
        }).sort({ createdAt: -1 });

        return NextResponse.json(groups);

    } catch (error) {
        console.error("Error fetching groups:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
