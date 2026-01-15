import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { AuthOptions } from "next-auth";
import connectToDatabase from "./mongodb";
import User from "@/models/User";

export const authOptions: AuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID ?? "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                // Mock and always allow for now, but in real use, find the user in DB
                if (credentials?.email && credentials?.password) {
                    return { id: "1", name: "SYNAPSE AI User", email: credentials.email };
                }
                return null;
            }
        })
    ],
    pages: {
        signIn: "/sign-in",
    },
    secret: process.env.NEXTAUTH_SECRET || "fallback_secret_for_dev_only",
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    debug: process.env.NODE_ENV === "development",
    cookies: {
        callbackUrl: {
            name: `next-auth.callback-url`,
            options: {
                sameSite: 'lax',
                path: '/',
                secure: process.env.NODE_ENV === 'production'
            }
        },
        state: {
            name: `next-auth.state`,
            options: {
                sameSite: 'lax',
                path: '/',
                secure: process.env.NODE_ENV === 'production'
            }
        },
    },
    callbacks: {
        async signIn({ user, account }) {
            try {
                console.log(`[AUTH] Sign-in (${account?.provider}): ${user.email} (${user.name})`);
                await connectToDatabase();
                const savedUser = await User.findOneAndUpdate(
                    { email: user.email },
                    {
                        name: user.name || user.email.split('@')[0],
                        image: user.image,
                        lastLogin: new Date()
                    },
                    { upsert: true, new: true }
                );
                console.log(`[AUTH] Profile Sync OK: ${savedUser.email}`);
                return true;
            } catch (error) {
                console.error("[AUTH] Profile Sync Failed:", error);
                return true;
            }
        },
        async session({ session }: any) {
            return session;
        },
    },
};
