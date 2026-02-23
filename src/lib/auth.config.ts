import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";

export const authConfig = {
    session: { strategy: "jwt" },
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
        Credentials({
            name: "Development Login",
            credentials: {
                email: { label: "Email", type: "email", placeholder: "ankit@example.com" },
            },
            async authorize(credentials) {
                if (!credentials?.email) return null;

                // Return object matching NextAuth user shape.
                // We do the actual DB lookup in jwt callback or omit it here if we assume dev mode trusts the email.
                return { id: "dev-user-id", email: credentials.email as string, name: "Dev User" };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user && token.id) {
                session.user.id = token.id as string;
            }
            return session;
        },
    },
    pages: {
        signIn: "/login",
    },
} satisfies NextAuthConfig;
