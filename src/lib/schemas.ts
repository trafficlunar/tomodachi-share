import { MiiGender, MiiMakeup, MiiPlatform } from "@prisma/client";
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
			}),
	)
	.min(1, { error: "There must be at least 1 tag" })
	.max(8, { error: "There cannot be more than 8 tags" });

export const idSchema = z.coerce.number({ error: "ID must be a number" }).int({ error: "ID must be an integer" }).positive({ error: "ID must be valid" });

export const searchSchema = z.object({
	q: querySchema.optional(),
	sort: z.enum(["likes", "newest", "oldest"], { error: "Sort must be either 'likes', 'newest', or 'oldest'" }).default("newest"),
	tags: z
		.string()
		.optional()
		.transform((value) =>
			value
				?.split(",")
				.map((tag) => tag.trim())
				.filter((tag) => tag.length > 0),
		),
	exclude: z
		.string()
		.optional()
		.transform((value) =>
			value
				?.split(",")
				.map((tag) => tag.trim())
				.filter((tag) => tag.length > 0),
		),
	platform: z.enum(MiiPlatform, { error: "Platform must be either 'THREE_DS', or 'SWITCH'" }).optional(),
	gender: z.enum(MiiGender, { error: "Gender must be either 'MALE', 'FEMALE', or 'NONBINARY' if on Switch platform" }).optional(),
	makeup: z.enum(MiiMakeup, { error: "Makeup must be either 'FULL', 'PARTIAL', or 'NONE'" }).optional(),
	allowCopying: z.coerce.boolean({ error: "Allow Copying must be either true or false" }).optional(),
	quarantined: z.coerce.boolean({ error: "Quarantined must be either true or false" }).optional(),
	// todo: incorporate tagsSchema
	// Pages
	limit: z.coerce
		.number({ error: "Limit must be a number" })
		.int({ error: "Limit must be an integer" })
		.min(1, { error: "Limit must be at least 1" })
		.max(100, { error: "Limit cannot be more than 100" })
		.optional(),
	page: z.coerce.number({ error: "Page must be a number" }).int({ error: "Page must be an integer" }).min(1, { error: "Page must be at least 1" }).optional(),
	// Time range filter
	timeRange: z.enum(["day", "week", "month", "year"], { error: "Time range must be either 'day', 'week', 'month', or 'year'" }).optional(),
});

export const userNameSchema = z
	.string()
	.trim()
	.min(2, { error: "Name must be at least 2 characters long" })
	.max(64, { error: "Name cannot be more than 64 characters long" })
	.regex(/^[a-zA-Z0-9-_. ']+$/, {
		error: "Name can only contain letters, numbers, dashes, underscores, apostrophes, and spaces.",
	});

const colorSchema = z.number().int().min(0).max(152).optional();
const geometrySchema = z.number().int().min(-100).max(100).optional();

export const switchMiiInstructionsSchema = z
	.object({
		head: z.object({ skinColor: colorSchema }).optional(),
		hair: z
			.object({
				color: colorSchema,
				subColor: colorSchema,
				style: z.number().int().min(1).max(3).optional(),
				isFlipped: z.boolean().optional(),
			})
			.optional(),
		eyebrows: z
			.object({
				color: colorSchema,
				height: geometrySchema,
				distance: geometrySchema,
				rotation: geometrySchema,
				size: geometrySchema,
				stretch: geometrySchema,
			})
			.optional(),
		eyes: z
			.object({
				main: z
					.object({
						color: colorSchema,
						height: geometrySchema,
						distance: geometrySchema,
						rotation: geometrySchema,
						size: geometrySchema,
						stretch: geometrySchema,
					})
					.optional(),
				eyelashesTop: z
					.object({
						height: geometrySchema,
						distance: geometrySchema,
						rotation: geometrySchema,
						size: geometrySchema,
						stretch: geometrySchema,
					})
					.optional(),
				eyelashesBottom: z
					.object({
						height: geometrySchema,
						distance: geometrySchema,
						rotation: geometrySchema,
						size: geometrySchema,
						stretch: geometrySchema,
					})
					.optional(),
				eyelidTop: z
					.object({
						height: geometrySchema,
						distance: geometrySchema,
						rotation: geometrySchema,
						size: geometrySchema,
						stretch: geometrySchema,
					})
					.optional(),
				eyelidBottom: z
					.object({
						height: geometrySchema,
						distance: geometrySchema,
						rotation: geometrySchema,
						size: geometrySchema,
						stretch: geometrySchema,
					})
					.optional(),
				eyeliner: z
					.object({
						color: colorSchema,
					})
					.optional(),
				pupil: z
					.object({
						height: geometrySchema,
						distance: geometrySchema,
						rotation: geometrySchema,
						size: geometrySchema,
						stretch: geometrySchema,
					})
					.optional(),
			})
			.optional(),
		nose: z
			.object({
				height: geometrySchema,
				size: geometrySchema,
			})
			.optional(),
		lips: z
			.object({
				color: colorSchema,
				height: geometrySchema,
				rotation: geometrySchema,
				size: geometrySchema,
				stretch: geometrySchema,
				hasLipstick: z.boolean().optional(),
			})
			.optional(),
		ears: z
			.object({
				height: geometrySchema,
				size: geometrySchema,
			})
			.optional(),
		glasses: z
			.object({
				ringColor: colorSchema,
				shadesColor: colorSchema,
				height: geometrySchema,
				size: geometrySchema,
				stretch: geometrySchema,
			})
			.optional(),
		other: z
			.object({
				wrinkles1: z
					.object({
						color: colorSchema,
						height: geometrySchema,
						distance: geometrySchema,
						size: geometrySchema,
						stretch: geometrySchema,
					})
					.optional(),
				wrinkles2: z
					.object({
						color: colorSchema,
						height: geometrySchema,
						distance: geometrySchema,
						size: geometrySchema,
						stretch: geometrySchema,
					})
					.optional(),
				beard: z
					.object({
						color: colorSchema,
						height: geometrySchema,
						distance: geometrySchema,
						size: geometrySchema,
						stretch: geometrySchema,
					})
					.optional(),
				moustache: z
					.object({
						color: colorSchema,
						height: geometrySchema,
						distance: geometrySchema,
						size: geometrySchema,
						stretch: geometrySchema,
						isFlipped: z.boolean().optional(),
					})
					.optional(),
				goatee: z
					.object({
						color: colorSchema,
						height: geometrySchema,
						distance: geometrySchema,
						size: geometrySchema,
						stretch: geometrySchema,
					})
					.optional(),
				mole: z
					.object({
						color: colorSchema,
						height: geometrySchema,
						distance: geometrySchema,
						size: geometrySchema,
						stretch: geometrySchema,
					})
					.optional(),
				eyeShadow: z
					.object({
						color: colorSchema,
						height: geometrySchema,
						distance: geometrySchema,
						size: geometrySchema,
						stretch: geometrySchema,
					})
					.optional(),
				blush: z
					.object({
						color: colorSchema,
						height: geometrySchema,
						distance: geometrySchema,
						size: geometrySchema,
						stretch: geometrySchema,
					})
					.optional(),
			})
			.optional(),
		height: z.number().int().min(0).max(128).optional(),
		weight: z.number().int().min(0).max(128).optional(),
		datingPreferences: z.array(z.enum(MiiGender)).optional(),
		birthday: z
			.object({
				day: z.number().int().min(1).max(31).optional(),
				month: z.number().int().min(1).max(12).optional(),
				age: z.number().int().min(1).max(1000).optional(),
				dontAge: z.boolean().optional(),
			})
			.optional(),
		voice: z
			.object({
				speed: z.number().int().min(0).max(50).optional(),
				pitch: z.number().int().min(0).max(50).optional(),
				depth: z.number().int().min(0).max(50).optional(),
				delivery: z.number().int().min(0).max(50).optional(),
				tone: z.number().int().min(1).max(6).optional(),
			})
			.optional(),
		personality: z
			.object({
				movement: z.number().int().min(0).max(7).optional(),
				speech: z.number().int().min(0).max(7).optional(),
				energy: z.number().int().min(0).max(7).optional(),
				thinking: z.number().int().min(0).max(7).optional(),
				overall: z.number().int().min(0).max(7).optional(),
			})
			.optional(),
	})
	.optional();
