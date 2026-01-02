import { MiiGender, MiiPlatform } from "@prisma/client";
import { z } from "zod";

// profanity censoring bypasses the regex in some of these but I think it's funny

export const querySchema = z
	.string()
	.trim()
	.min(2, { error: "Search query must be at least 2 characters long" })
	.max(64, { error: "Search query cannot be more than 64 characters long" })
	.regex(/^[a-zA-Z0-9-_. ']+$/, {
		error: "Search query can only contain letters, numbers, dashes, underscores, apostrophes, and spaces.",
	});

// Miis
export const nameSchema = z
	.string()
	.trim()
	.min(2, { error: "Name must be at least 2 characters long" })
	.max(64, { error: "Name cannot be more than 64 characters long" })
	.regex(/^[a-zA-Z0-9-_. ']+$/, {
		error: "Name can only contain letters, numbers, dashes, underscores, apostrophes, and spaces.",
	});

export const tagsSchema = z
	.array(
		z
			.string()
			.min(2, { error: "Tags must be at least 2 characters long" })
			.max(20, { error: "Tags cannot be more than 20 characters long" })
			.regex(/^[a-z0-9-_]+$/, {
				error: "Tags can only contain lowercase letters, numbers, dashes, and underscores.",
			})
	)
	.min(1, { error: "There must be at least 1 tag" })
	.max(8, { error: "There cannot be more than 8 tags" });

export const idSchema = z.coerce.number({ error: "ID must be a number" }).int({ error: "ID must be an integer" }).positive({ error: "ID must be valid" });

export const searchSchema = z.object({
	q: querySchema.optional(),
	sort: z.enum(["likes", "newest", "oldest", "random"], { error: "Sort must be either 'likes', 'newest', 'oldest', or 'random'" }).default("newest"),
	tags: z
		.string()
		.optional()
		.transform((value) =>
			value
				?.split(",")
				.map((tag) => tag.trim())
				.filter((tag) => tag.length > 0)
		),
	platform: z.enum(MiiPlatform, { error: "Platform must be either 'THREE_DS', or 'SWITCH'" }).optional(),
	gender: z.enum(MiiGender, { error: "Gender must be either 'MALE', or 'FEMALE'" }).optional(),
	// todo: incorporate tagsSchema
	// Pages
	limit: z.coerce
		.number({ error: "Limit must be a number" })
		.int({ error: "Limit must be an integer" })
		.min(1, { error: "Limit must be at least 1" })
		.max(100, { error: "Limit cannot be more than 100" })
		.optional(),
	page: z.coerce.number({ error: "Page must be a number" }).int({ error: "Page must be an integer" }).min(1, { error: "Page must be at least 1" }).optional(),
	// Random sort
	seed: z.coerce.number({ error: "Seed must be a number" }).int({ error: "Seed must be an integer" }).optional(),
});

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
	.min(2, { error: "Display name must be at least 2 characters long" })
	.max(64, { error: "Display name cannot be more than 64 characters long" })
	.regex(/^[a-zA-Z0-9-_. ']+$/, {
		error: "Display name can only contain letters, numbers, dashes, underscores, apostrophes, and spaces.",
	});
