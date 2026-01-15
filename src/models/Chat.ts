import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage {
    role: 'user' | 'ai' | 'tool' | 'system' | 'function';
    content: string;
    senderName?: string; // Name of the person who sent it
    senderImage?: string; // Avatar URL of the sender
    image?: string; // Optional embedded image
    tool_call_id?: string;
    name?: string;
    tool_calls?: any;
    timestamp: Date;
}

export interface IChat extends Document {
    userId?: string; // Optional for shared group chats
    groupId?: string; // Optional: Link to a group
    title: string;
    messages: IMessage[];
    createdAt: Date;
    updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>({
    role: { type: String, enum: ['user', 'ai', 'tool', 'system', 'function'], required: true },
    content: { type: String, default: "" },
    senderName: { type: String },
    senderImage: { type: String },
    image: { type: String },
    tool_call_id: { type: String },
    name: { type: String },
    tool_calls: { type: Schema.Types.Mixed }, // Basic support for storing tool calls
    timestamp: { type: Date, default: Date.now }
});

const ChatSchema = new Schema<IChat>({
    userId: { type: String, required: false, index: { sparse: true }, default: null }, // Explicitly optional
    groupId: { type: String, required: false, index: true, default: null },
    title: { type: String, default: 'New Conversation' },
    messages: [MessageSchema]
}, { timestamps: true });

// Bypass model cache to ensure schema updates are applied
if (mongoose.models.Chat) {
    delete mongoose.models.Chat;
}

export default mongoose.model<IChat>('Chat', ChatSchema);
