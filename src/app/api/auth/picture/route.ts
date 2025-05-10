import { NextRequest, NextResponse } from "next/server";
import dayjs from "dayjs";
import { z } from "zod";

import fs from "fs/promises";
import path from "path";
import sharp from "sharp";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { RateLimit } from "@/lib/rate-limit";
import { validateImage } from "@/lib/images";

const uploadsDirectory = path.join(process.cwd(), "uploads", "user");

const formDataSchema = z.object({
	image: z.union([z.instanceof(File), z.any()]).optional(),
});

export async function PATCH(request: NextRequest) {
	const session = await auth();
	if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const rateLimit = new RateLimit(request, 3);
	const check = await rateLimit.handle();
	if (check) return check;

	// Check if profile picture was updated in the last 7 days
	const user = await prisma.user.findUnique({ where: { id: Number(session.user.id) } });
	if (user && user.imageUpdatedAt) {
		const timePeriod = dayjs().subtract(7, "days");
		const lastUpdate = dayjs(user.imageUpdatedAt);

		if (lastUpdate.isAfter(timePeriod)) return rateLimit.sendResponse({ error: "Profile picture was changed in the last 7 days" }, 400);
	}

	// Parse data
	const formData = await request.formData();
	const parsed = formDataSchema.safeParse({
		image: formData.get("image"),
	});

	if (!parsed.success) return rateLimit.sendResponse({ error: parsed.error.errors[0].message }, 400);
	const { image } = parsed.data;

	// If there is no image, set the profile picture to the guest image
	if (!image) {
		await prisma.user.update({
			where: { id: Number(session.user.id) },
			data: { image: `/guest.webp`, imageUpdatedAt: new Date() },
		});

		return rateLimit.sendResponse({ success: true });
	}

	// Validate image contents
	const imageValidation = await validateImage(image);
	if (!imageValidation.valid) return rateLimit.sendResponse({ error: imageValidation.error }, imageValidation.status ?? 400);

	// Ensure directories exist
	await fs.mkdir(uploadsDirectory, { recursive: true });

	try {
		const buffer = Buffer.from(await image.arrayBuffer());
		const webpBuffer = await sharp(buffer, { animated: true }).resize({ width: 128, height: 128 }).webp({ quality: 85 }).toBuffer();
		const fileLocation = path.join(uploadsDirectory, `${session.user.id}.webp`);

		await fs.writeFile(fileLocation, webpBuffer);
	} catch (error) {
		console.error("Error uploading profile picture:", error);
		return rateLimit.sendResponse({ error: "Failed to store profile picture" }, 500);
	}

	try {
		await prisma.user.update({
			where: { id: Number(session.user.id) },
			data: { image: `/profile/${session.user.id}/picture`, imageUpdatedAt: new Date() },
		});
	} catch (error) {
		console.error("Failed to update profile picture:", error);
		return rateLimit.sendResponse({ error: "Failed to update profile picture" }, 500);
	}

	return rateLimit.sendResponse({ success: true });
}
