import NextAuth from "next-auth";
import Discord from "next-auth/providers/discord";
import Github from "next-auth/providers/github";

const handler = NextAuth({
	pages: {
		signIn: "/login",
	},
	providers: [
		Discord({
			clientId: process.env.DISCORD_ID!,
			clientSecret: process.env.DISCORD_SECRET!,
		}),
		Github({
			clientId: process.env.GITHUB_ID!,
			clientSecret: process.env.GITHUB_SECRET!,
		}),
	],
});

export { handler as GET, handler as POST };
