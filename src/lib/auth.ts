import NextAuth from "next-auth";
import Discord from "next-auth/providers/discord";
import Github from "next-auth/providers/github";
import Google from "next-auth/providers/google";

import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
	adapter: PrismaAdapter(prisma),
	providers: [Discord, Github, Google],
	pages: {
		signIn: "/login",
	},
	callbacks: {
		async signIn({ user }) {
			const blacklist = process.env.BLACKLISTED_EMAILS ? process.env.BLACKLISTED_EMAILS.split(",").map((item) => item.trim().toLowerCase()) : [];
			const email = user?.email?.toLowerCase();
			if (!email) return false;
			if (blacklist?.some((blocked) => email.endsWith(blocked))) return false;
			return true;
		},

		async session({ session, user }) {
			if (user) {
				session.user.id = user.id;
				session.user.email = user.email;
			}
			return session;
		},
	},
});
