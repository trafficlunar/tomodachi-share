import { z } from "zod";

// profanity censoring bypasses the regex in some of these but I think it's funny

export const querySchema = z
	.string()
	.trim()
	.min(2, { message: "Search query must be at least 2 characters long" })
	.max(64, { message: "Search query cannot be more than 64 characters long" })
	.regex(/^[a-zA-Z0-9-_. ']+$/, {
		message: "Search query can only contain letters, numbers, dashes, underscores, apostrophes, and spaces.",
	});

// Miis
export const nameSchema = z
	.string()
	.trim()
	.min(2, { message: "Name must be at least 2 characters long" })
	.max(64, { message: "Name cannot be more than 64 characters long" })
	.regex(/^[a-zA-Z0-9-_. ']+$/, {
		message: "Name can only contain letters, numbers, dashes, underscores, apostrophes, and spaces.",
	});

export const tagsSchema = z
	.array(
		z
			.string()
			.min(2, { message: "Tags must be at least 2 characters long" })
			.max(64, { message: "Tags cannot be more than 20 characters long" })
			.regex(/^[a-z0-9-_]+$/, {
				message: "Tags can only contain lowercase letters, numbers, dashes, and underscores.",
			})
	)
	.min(1, { message: "There must be at least 1 tag" })
	.max(8, { message: "There cannot be more than 8 tags" });

export const idSchema = z.coerce
	.number({ message: "Mii ID must be a number" })
	.int({ message: "Mii ID must be an integer" })
	.positive({ message: "Mii ID must be valid" });

// Account Info
export const usernameSchema = z
	.string()
	.trim()
	.min(3, "Username must be at least 3 characters long")
	.max(20, "Username cannot be more than 20 characters long")
	.regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores");

export const displayNameSchema = z
	.string()
	.trim()
	.min(2, { message: "Display name must be at least 2 characters long" })
	.max(64, { message: "Display name cannot be more than 64 characters long" })
	.regex(/^[a-zA-Z0-9-_. ']+$/, {
		message: "Display name can only contain letters, numbers, dashes, underscores, apostrophes, and spaces.",
	});
