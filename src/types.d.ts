import { DefaultSession, User } from "next-auth";
import { User as PrismaUser } from "@prisma/client";

declare module "next-auth" {
	interface Session {
		user: {
			username?: string;
		} & DefaultSession["user"];
	}

	interface User {
		username?: string;
	}
}
