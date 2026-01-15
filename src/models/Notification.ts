import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
    recipient: string; // User email
    sender: string; // User email
    type: 'invite' | 'system' | 'message';
    title: string;
    message: string;
    link?: string;
    metadata?: any;
    read: boolean;
    createdAt: Date;
}

const NotificationSchema: Schema = new Schema({
    recipient: { type: String, required: true, index: true },
    sender: { type: String, required: true },
    type: { type: String, enum: ['invite', 'system', 'message'], default: 'system' },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: { type: String },
    metadata: { type: Schema.Types.Mixed },
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);
