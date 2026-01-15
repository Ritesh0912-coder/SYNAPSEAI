import mongoose, { Schema, Document } from 'mongoose';

export interface IGroup extends Document {
    name: string;
    description?: string;
    industry?: string;
    createdBy: string;
    createdAt: Date;
    members: {
        userId: string;
        userName: string;
        role: 'admin' | 'member' | 'viewer';
        joinedAt: Date;
    }[];
    pendingMembers: {
        userId: string;
        userName: string;
        role: 'admin' | 'member' | 'viewer';
        requestedAt: Date;
    }[];
    invites: {
        token: string;
        method: 'link' | 'email' | 'username';
        recipient?: string; // email or username
        role: 'admin' | 'member' | 'viewer';
        status: 'sent' | 'joined' | 'pending_approval' | 'expired' | 'cancelled' | 'denied';
        invitedBy: string;
        expiresAt: Date;
        isActive: boolean;
    }[];
    memory: {
        key: string;
        value: any;
        timestamp: Date;
    }[];
    isArchived: boolean;
    type: 'public' | 'private';
    inviteMethod: 'link' | 'username' | 'email' | 'approval';
    settings: {
        approvalRequired: boolean;
        canSendMessages: 'all' | 'admin';
        canInviteMembers: 'all' | 'admin';
        adminPowers: string[]; // ['remove', 'assign', 'mute']
    };
}

const GroupSchema: Schema = new Schema({
    name: { type: String, required: true },
    description: { type: String },
    industry: { type: String },
    type: { type: String, enum: ['public', 'private'], default: 'private' },
    inviteMethod: { type: String, enum: ['link', 'username', 'email', 'approval'], default: 'link' },
    settings: {
        approvalRequired: { type: Boolean, default: false },
        canSendMessages: { type: String, enum: ['all', 'admin'], default: 'all' },
        canInviteMembers: { type: String, enum: ['all', 'admin'], default: 'admin' },
        adminPowers: { type: [String], default: ['remove', 'assign', 'mute'] }
    },
    createdBy: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    members: [
        {
            userId: { type: String, required: true },
            userName: { type: String, required: true },
            role: { type: String, enum: ['admin', 'member', 'viewer'], default: 'member' },
            joinedAt: { type: Date, default: Date.now }
        }
    ],
    pendingMembers: [
        {
            userId: { type: String, required: true },
            userName: { type: String, required: true },
            role: { type: String, enum: ['admin', 'member', 'viewer'], default: 'member' },
            requestedAt: { type: Date, default: Date.now }
        }
    ],
    invites: [
        {
            token: { type: String, required: true, unique: true, sparse: true },
            method: { type: String, enum: ['link', 'email', 'username'], default: 'link' },
            recipient: { type: String },
            role: { type: String, enum: ['admin', 'member', 'viewer'], default: 'member' },
            status: { type: String, enum: ['sent', 'joined', 'pending_approval', 'expired', 'cancelled', 'denied'], default: 'sent' },
            invitedBy: { type: String, required: true },
            expiresAt: { type: Date },
            isActive: { type: Boolean, default: true }
        }
    ],
    auditLog: [
        {
            action: { type: String, required: true },
            performedBy: { type: String, required: true },
            target: { type: String }, // User or setting name
            details: { type: String },
            timestamp: { type: Date, default: Date.now }
        }
    ],
    memory: [
        {
            key: { type: String, required: true },
            value: { type: Schema.Types.Mixed, required: true },
            timestamp: { type: Date, default: Date.now }
        }
    ],
    isArchived: { type: Boolean, default: false }
});

export default mongoose.models.Group || mongoose.model<IGroup>('Group', GroupSchema);
