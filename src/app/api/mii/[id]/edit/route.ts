import { NextResponse } from "next/server";
import { z } from "zod";
import { Mii } from "@prisma/client";

import fs from "fs/promises";
import path from "path";
import sharp from "sharp";

import { profanity } from "@2toad/profanity";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { idSchema, nameSchema, tagsSchema } from "@/lib/schemas";

import { validateImage } from "@/lib/images";

const uploadsDirectory = path.join(process.cwd(), "public", "mii");

const editSchema = z.object({
	name: nameSchema.optional(),
	tags: tagsSchema.optional(),
	image1: z.union([z.instanceof(File), z.any()]).optional(),
	image2: z.union([z.instanceof(File), z.any()]).optional(),
	image3: z.union([z.instanceof(File), z.any()]).optional(),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
	const session = await auth();
	if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	// Get Mii ID
	const { id: slugId } = await params;
	const parsedId = idSchema.safeParse(slugId);

	if (!parsedId.success) return NextResponse.json({ error: parsedId.error.errors[0].message }, { status: 400 });
	const miiId = parsedId.data;

	// Check ownership of Mii
	const mii = await prisma.mii.findUnique({
		where: {
			id: miiId,
		},
	});

	if (!mii) return NextResponse.json({ error: "Mii not found" }, { status: 404 });
	if (Number(session.user.id) !== mii.userId) return NextResponse.json({ error: "You don't have ownership of that Mii" }, { status: 403 });

	// Parse form data
	const formData = await request.formData();

	let rawTags: string[] | undefined = undefined;
	try {
		const value = formData.get("tags");
		if (value) rawTags = JSON.parse(value as string);
	} catch {
		return NextResponse.json({ error: "Invalid JSON in tags" }, { status: 400 });
	}

	const parsed = editSchema.safeParse({
		name: formData.get("name") ?? undefined,
		tags: rawTags,
		image1: formData.get("image1"),
		image2: formData.get("image2"),
		image3: formData.get("image3"),
	});

	if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
	const { name, tags, image1, image2, image3 } = parsed.data;

	// Validate image files
	const images: File[] = [];

	for (const img of [image1, image2, image3]) {
		if (!img) continue;

		const imageValidation = await validateImage(img);
		if (imageValidation.valid) {
			images.push(img);
		} else {
			return NextResponse.json({ error: imageValidation.error }, { status: imageValidation.status ?? 400 });
		}
	}

	// Edit Mii in database
	const updateData: Partial<Mii> = {};
	if (name !== undefined) updateData.name = profanity.censor(name); // Censor potential inappropriate words
	if (tags !== undefined) updateData.tags = tags.map((t) => profanity.censor(t)); // Same here
	if (images.length > 0) updateData.imageCount = images.length;

	if (Object.keys(updateData).length == 0) return NextResponse.json({ error: "Nothing was changed" }, { status: 400 });
	await prisma.mii.update({
		where: {
			id: miiId,
		},
		data: updateData,
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
			return NextResponse.json({ error: "Failed to store user images" }, { status: 500 });
		}
	}

	return NextResponse.json({ success: true });
}
