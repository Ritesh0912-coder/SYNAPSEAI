import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectToDatabase from '@/lib/mongodb';
import Notification from '@/models/Notification';
import User from '@/models/User';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectToDatabase();

        const notifications = await Notification.find({
            recipient: session.user.email,
        }).sort({ createdAt: -1 }).lean();

        // Enrich with sender details
        const senderEmails = notifications.map((n: any) => n.sender).filter(Boolean);
        const uniqueSenders = [...new Set(senderEmails)];

        const users = await User.find({ email: { $in: uniqueSenders } }).select('email name image').lean();
        const userMap = new Map(users.map((u: any) => [u.email, u]));

        const enrichedNotifications = notifications.map((n: any) => ({
            ...n,
            senderName: userMap.get(n.sender)?.name || 'Unknown',
            senderImage: userMap.get(n.sender)?.image
        }));

        return NextResponse.json(enrichedNotifications);

    } catch (error) {
        console.error("Error fetching notifications:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { notificationId, action } = await req.json();

        await connectToDatabase();

        if (action === 'read') {
            await Notification.findOneAndUpdate(
                { _id: notificationId, recipient: session.user.email },
                { read: true }
            );
        } else if (action === 'read_all') {
            await Notification.updateMany(
                { recipient: session.user.email, read: false },
                { read: true }
            );
        } else if (action === 'delete') {
            await Notification.findOneAndDelete({ _id: notificationId, recipient: session.user.email });
        } else if (action === 'delete_all') {
            await Notification.deleteMany({ recipient: session.user.email });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Error updating notification:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
