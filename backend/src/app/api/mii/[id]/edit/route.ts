import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { MiiGender, MiiMakeup, Prisma } from "@prisma/client";

import fs from "fs/promises";
import path from "path";
import sharp from "sharp";

import { profanity } from "@2toad/profanity";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { idSchema, nameSchema, switchMiiInstructionsSchema, tagsSchema } from "@tomodachi-share/shared/schemas";
import { generateMetadataImage, validateImage } from "@/lib/images";
import { RateLimit } from "@/lib/rate-limit";
import { minifyInstructions, SwitchMiiInstructions } from "@tomodachi-share/shared";
import { settings } from "../../../../../lib/settings";

const uploadsDirectory = path.join(process.cwd(), "uploads", "mii");

const editSchema = z.object({
	name: nameSchema.optional(),
	tags: tagsSchema.optional(),
	description: z.string().trim().max(512).optional(),
	quarantined: z
		.enum(["true", "false"])
		.transform((v) => v === "true")
		.optional(),
	needsFixingReason: z
		.string()
		.max(256)
		.optional()
		.transform((val) => (val === "" ? null : val)),
	gender: z.enum(MiiGender).optional(),
	makeup: z.enum(MiiMakeup).optional(),
	miiPortraitImage: z.union([z.instanceof(File), z.any()]).optional(),
	miiFeaturesImage: z.union([z.instanceof(File), z.any()]).optional(),
	youtubeId: z
		.string()
		.regex(/^[a-zA-Z0-9_-]{11}$/, "Invalid YouTube video ID")
		.or(z.literal(""))
		.optional(),
	instructions: switchMiiInstructionsSchema,
	image1: z.union([z.instanceof(File), z.any()]).optional(),
	image2: z.union([z.instanceof(File), z.any()]).optional(),
	image3: z.union([z.instanceof(File), z.any()]).optional(),
});

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	const session = await auth();
	if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const rateLimit = new RateLimit(request, 6); // no grouped pathname; edit each mii 2 times a minute
	const check = await rateLimit.handle();
	if (check) return check;

	// Get Mii ID
	const { id: slugId } = await params;
	const parsedId = idSchema.safeParse(slugId);
	if (!parsedId.success) return rateLimit.sendResponse({ error: parsedId.error.issues[0].message }, 400);
	const miiId = parsedId.data;

	// Check ownership of Mii
	const mii = await prisma.mii.findUnique({
		where: {
			id: miiId,
		},
	});

	if (!mii) return rateLimit.sendResponse({ error: "Mii not found" }, 404);
	if (!(Number(session.user?.id) === mii.userId || Number(session.user?.id) === Number(process.env.NEXT_PUBLIC_ADMIN_USER_ID)))
		return rateLimit.sendResponse({ error: "You don't have ownership of that Mii" }, 403);

	// Parse form data
	const formData = await request.formData();

	let rawTags: string[] | undefined = undefined;
	try {
		const value = formData.get("tags");
		if (value) rawTags = JSON.parse(value as string);
	} catch {
		return rateLimit.sendResponse({ error: "Invalid JSON in tags" }, 400);
	}

	let minifiedInstructions: Partial<SwitchMiiInstructions> | undefined;
	if (mii.platform === "SWITCH")
		minifiedInstructions = minifyInstructions(JSON.parse((formData.get("instructions") as string) ?? "{}") as SwitchMiiInstructions);

	const parsed = editSchema.safeParse({
		name: formData.get("name") ?? undefined,
		tags: rawTags,
		description: formData.get("description") ?? undefined,
		quarantined: formData.get("quarantined") ?? undefined,
		needsFixingReason: formData.get("needsFixingReason") ?? undefined,
		gender: formData.get("gender") ?? undefined,
		makeup: formData.get("makeup") ?? undefined,
		miiPortraitImage: formData.get("miiPortraitImage"),
		miiFeaturesImage: formData.get("miiFeaturesImage"),
		youtubeId: formData.get("youtubeId") ?? undefined,
		instructions: minifiedInstructions,
		image1: formData.get("image1"),
		image2: formData.get("image2"),
		image3: formData.get("image3"),
	});

	if (!parsed.success) {
		const firstIssue = parsed.error.issues[0];
		const path = firstIssue.path.length ? firstIssue.path.join(".") : "root";
		const error = `${path}: ${firstIssue.message}`;
		return rateLimit.sendResponse({ error }, 400);
	}
	const {
		name,
		tags,
		description,
		quarantined,
		needsFixingReason,
		gender,
		makeup,
		miiPortraitImage,
		miiFeaturesImage,
		youtubeId,
		instructions,
		image1,
		image2,
		image3,
	} = parsed.data;

	// Validate image files
	const customImages: File[] = [];

	for (const img of [image1, image2, image3]) {
		if (!img) continue;

		const validation = await validateImage(img);
		if (validation.valid) {
			customImages.push(img);
		} else {
			return rateLimit.sendResponse({ error: `Failed to verify custom image: ${validation.error}` }, validation.status ?? 400);
		}
	}

	// Check Mii portrait & features image (Switch)
	if (mii.platform === "SWITCH") {
		if (miiPortraitImage) {
			const validation = await validateImage(miiPortraitImage);
			if (!validation.valid) return rateLimit.sendResponse({ error: `Failed to verify portrait: ${validation.error}` }, validation.status ?? 400);
		}
		if (miiFeaturesImage) {
			const validation = await validateImage(miiFeaturesImage);
			if (!validation.valid) return rateLimit.sendResponse({ error: `Failed to verify features: ${validation.error}` }, validation.status ?? 400);
		}
	}

	// Prevent non-admins from quarantining Miis
	if (quarantined && needsFixingReason && session.user?.id?.toString() !== process.env.NEXT_PUBLIC_ADMIN_USER_ID)
		return rateLimit.sendResponse({ error: `You're not an admin!` }, 401);

	// Edit Mii in database
	const updateData: Prisma.MiiUpdateInput = {};
	if (name !== undefined) updateData.name = profanity.censor(name); // Censor potentially inappropriate words
	if (tags !== undefined) updateData.tags = tags.map((t) => profanity.censor(t));
	if (description !== undefined) updateData.description = profanity.censor(description);
	if (quarantined !== undefined) updateData.quarantined = quarantined;
	if (needsFixingReason !== undefined) updateData.needsFixing = needsFixingReason;
	if (mii.platform === "SWITCH" && gender !== undefined) updateData.gender = gender;
	if (makeup !== undefined) updateData.makeup = makeup;
	if (youtubeId !== undefined) updateData.youtubeId = youtubeId;
	if (instructions !== undefined) updateData.instructions = instructions;
	if (customImages.length > 0) updateData.imageCount = customImages.length;

	const imagesChanged = customImages.length > 0 || miiPortraitImage || miiFeaturesImage;
	if (settings.queueEnabled && imagesChanged) updateData.in_queue = true;

	if (Object.keys(updateData).length === 0) return rateLimit.sendResponse({ error: "Nothing was changed" }, 400);
	const updatedMii = await prisma.mii.update({
		where: {
			id: miiId,
		},
		data: updateData,
		include: {
			user: {
				select: {
					name: true,
				},
			},
		},
	});

	// Ensure directories exist
	const miiUploadsDirectory = path.join(uploadsDirectory, miiId.toString());
	await fs.mkdir(miiUploadsDirectory, { recursive: true });

	// Only touch files if new images were uploaded
	if (customImages.length > 0) {
		// Delete all custom images
		const files = await fs.readdir(miiUploadsDirectory);
		await Promise.all(files.filter((file) => file.startsWith("image")).map((file) => fs.unlink(path.join(miiUploadsDirectory, file))));

		// Compress and upload new images
		try {
			await Promise.all(
				customImages.map(async (image, index) => {
					const buffer = Buffer.from(await image.arrayBuffer());
					const pngBuffer = await sharp(buffer).resize({ height: 800, fit: "inside", withoutEnlargement: true }).png({ quality: 85 }).toBuffer();
					const fileLocation = path.join(miiUploadsDirectory, `image${index}.png`);

					await fs.writeFile(fileLocation, pngBuffer);
				}),
			);
		} catch (error) {
			console.error("Error uploading user images:", error);
			return rateLimit.sendResponse({ error: "Failed to store user images" }, 500);
		}
	}

	// Only save portrait & features for Switch Miis when they are provided
	if (mii.platform === "SWITCH" && (miiPortraitImage || miiFeaturesImage)) {
		try {
			await Promise.all(
				[
					miiPortraitImage &&
						(async () => {
							const portraitBuffer = Buffer.from(await miiPortraitImage.arrayBuffer());
							const pngBuffer = await sharp(portraitBuffer)
								.resize({
									height: 500,
									fit: "inside",
									withoutEnlargement: true,
								})
								.png({ quality: 85 })
								.toBuffer();
							await fs.writeFile(path.join(miiUploadsDirectory, "mii.png"), pngBuffer);
						})(),
					miiFeaturesImage &&
						(async () => {
							const featuresBuffer = Buffer.from(await miiFeaturesImage.arrayBuffer());
							const pngBuffer = await sharp(featuresBuffer)
								.resize({
									height: 800,
									fit: "inside",
									withoutEnlargement: true,
								})
								.png({ quality: 85 })
								.toBuffer();
							await fs.writeFile(path.join(miiUploadsDirectory, "features.png"), pngBuffer);
						})(),
				].filter(Boolean),
			);
		} catch (error) {
			console.error("Error uploading portrait/features images:", error);
			return rateLimit.sendResponse({ error: "Failed to store portrait/features images" }, 500);
		}
	}

	try {
		await generateMetadataImage(updatedMii, updatedMii.user.name!);
	} catch (error) {
		console.error(error);
		return rateLimit.sendResponse({ error: `Failed to generate 'metadata' type image for mii ${miiId}` }, 500);
	}

	// Tell Cloudflare to purge cache for the changed pages
	fetch(`https://api.cloudflare.com/client/v4/zones/${process.env.CLOUDFLARE_ZONE_ID}/purge_cache`, {
		method: "POST",
		headers: { Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`, "Content-Type": "application/json" },
		body: JSON.stringify({
			files: [
				`${process.env.NEXT_PUBLIC_BASE_URL}/mii/${miiId}`,
				`${process.env.NEXT_PUBLIC_BASE_URL}/mii/${miiId}/image?type=mii`,
				`${process.env.NEXT_PUBLIC_BASE_URL}/mii/${miiId}/image?type=features`,
			],
		}),
	}).catch((err) => {
		console.error("Cloudflare cache purge failed:", err);
	});

	return rateLimit.sendResponse({ success: true });
}
