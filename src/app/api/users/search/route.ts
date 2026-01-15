import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const query = searchParams.get('q');

        if (!query || query.length < 2) {
            return NextResponse.json([]);
        }

        await connectToDatabase();
        console.log(`[SEARCH] Query: "${query}"`);

        // Search for users by name or email
        const users = await User.find({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { email: { $regex: query, $options: 'i' } }
            ]
        }).select('name email image').limit(10);

        console.log(`[SEARCH] Found ${users.length} results`);

        return NextResponse.json(users);

    } catch (error) {
        console.error("Error searching users:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
