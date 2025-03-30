import NextAuth from "next-auth";
import Discord from "next-auth/providers/discord";
import Github from "next-auth/providers/github";

import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
	adapter: PrismaAdapter(prisma),
	providers: [Discord, Github],
	pages: {
		signIn: "/login",
	},
	callbacks: {
		async session({ session, user }) {
			if (user) {
				session.user.id = user.id;
				session.user.username = user.username;
				session.user.email = user.email;
			}
			return session;
		},
	},
});
