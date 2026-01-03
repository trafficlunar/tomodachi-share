import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Mii } from "@prisma/client";

import fs from "fs/promises";
import path from "path";
import sharp from "sharp";

import { profanity } from "@2toad/profanity";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { idSchema, nameSchema, tagsSchema } from "@/lib/schemas";
import { generateMetadataImage, validateImage } from "@/lib/images";
import { RateLimit } from "@/lib/rate-limit";

const uploadsDirectory = path.join(process.cwd(), "uploads", "mii");

const editSchema = z.object({
	name: nameSchema.optional(),
	tags: tagsSchema.optional(),
	description: z.string().trim().max(256).optional(),
	image1: z.union([z.instanceof(File), z.any()]).optional(),
	image2: z.union([z.instanceof(File), z.any()]).optional(),
	image3: z.union([z.instanceof(File), z.any()]).optional(),
});

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	const session = await auth();
	if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const rateLimit = new RateLimit(request, 1); // no grouped pathname; edit each mii 1 time a minute
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
	if (!(Number(session.user.id) === mii.userId || Number(session.user.id) === Number(process.env.NEXT_PUBLIC_ADMIN_USER_ID)))
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

	const parsed = editSchema.safeParse({
		name: formData.get("name") ?? undefined,
		tags: rawTags,
		description: formData.get("description") ?? undefined,
		image1: formData.get("image1"),
		image2: formData.get("image2"),
		image3: formData.get("image3"),
	});

	if (!parsed.success) return rateLimit.sendResponse({ error: parsed.error.issues[0].message }, 400);
	const { name, tags, description, image1, image2, image3 } = parsed.data;

	// Validate image files
	const images: File[] = [];

	for (const img of [image1, image2, image3]) {
		if (!img) continue;

		const imageValidation = await validateImage(img);
		if (imageValidation.valid) {
			images.push(img);
		} else {
			return rateLimit.sendResponse({ error: imageValidation.error }, imageValidation.status ?? 400);
		}
	}

	// Edit Mii in database
	const updateData: Partial<Mii> = {};
	if (name !== undefined) updateData.name = profanity.censor(name); // Censor potential inappropriate words
	if (tags !== undefined) updateData.tags = tags.map((t) => profanity.censor(t)); // Same here
	if (description !== undefined) updateData.description = profanity.censor(description);
	if (images.length > 0) updateData.imageCount = images.length;

	if (Object.keys(updateData).length == 0) return rateLimit.sendResponse({ error: "Nothing was changed" }, 400);
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

	// Only touch files if new images were uploaded
	if (images.length > 0) {
		// Ensure directories exist
		const miiUploadsDirectory = path.join(uploadsDirectory, miiId.toString());
		await fs.mkdir(miiUploadsDirectory, { recursive: true });

		// Delete all custom images
		const files = await fs.readdir(miiUploadsDirectory);
		await Promise.all(files.filter((file) => file.startsWith("image")).map((file) => fs.unlink(path.join(miiUploadsDirectory, file))));

		// Compress and upload new images
		try {
			await Promise.all(
				images.map(async (image, index) => {
					const buffer = Buffer.from(await image.arrayBuffer());
					const webpBuffer = await sharp(buffer).webp({ quality: 85 }).toBuffer();
					const fileLocation = path.join(miiUploadsDirectory, `image${index}.webp`);

					await fs.writeFile(fileLocation, webpBuffer);
				})
			);
		} catch (error) {
			console.error("Error uploading user images:", error);
			return rateLimit.sendResponse({ error: "Failed to store user images" }, 500);
		}
	} else if (description === undefined) {
		// If images or description were not changed, regenerate the metadata image
		try {
			await generateMetadataImage(updatedMii, updatedMii.user.name!);
		} catch (error) {
			console.error(error);
			return rateLimit.sendResponse({ error: `Failed to generate 'metadata' type image for mii ${miiId}` }, 500);
		}
	}

	return rateLimit.sendResponse({ success: true });
}
