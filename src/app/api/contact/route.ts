import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Contact from '@/models/Contact';

export async function POST(req: Request) {
    try {
        await connectToDatabase();
        const { name, email, message } = await req.json();

        if (!name || !email || !message) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const newContact = await Contact.create({
            name,
            email,
            message,
        });

        return NextResponse.json(
            { message: 'Message sent successfully', data: newContact },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error submitting contact form:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
