import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./db";
import { authConfig } from "./auth.config";

import type { Adapter } from "next-auth/adapters";

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(prisma) as Adapter,
    providers: [
        // Override Credentials Provider locally if we want actual DB lookup for Dev login
        // because auth.config.ts can't access Prisma in Edge middleware
        ...authConfig.providers.map(p => {
            if (typeof p === "function") return p;
            if (p.id === "credentials") {
                return {
                    ...p,
                    async authorize(credentials: any) {
                        if (!credentials?.email) return null;
                        const user = await prisma.user.findUnique({
                            where: { email: credentials.email as string },
                        });
                        if (user) {
                            return { id: user.id, name: user.name, email: user.email, image: user.avatarUrl };
                        }
                        return null;
                    }
                }
            }
            return p;
        })
    ]
});
