import { Prisma } from "@prisma/client";
import { DefaultSession } from "next-auth";

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

type MiiWithUsername = Prisma.MiiGetPayload<{
	include: {
		user: {
			select: {
				username: true;
			};
		};
	};
}>;
