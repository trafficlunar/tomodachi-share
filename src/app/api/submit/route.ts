import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import fs from "fs/promises";
import path from "path";
import sharp from "sharp";

import qrcode from "qrcode-generator";
import { profanity } from "@2toad/profanity";
import { MiiGender } from "@prisma/client";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { nameSchema, tagsSchema } from "@/lib/schemas";
import { RateLimit } from "@/lib/rate-limit";

import { validateImage } from "@/lib/images";
import { convertQrCode } from "@/lib/qr-codes";
import Mii from "@/lib/mii.js/mii";
import { TomodachiLifeMii } from "@/lib/tomodachi-life-mii";

const uploadsDirectory = path.join(process.cwd(), "uploads");

const submitSchema = z.object({
	name: nameSchema,
	tags: tagsSchema,
	description: z.string().trim().max(256).optional(),
	qrBytesRaw: z
		.array(z.number(), { required_error: "A QR code is required" })
		.length(372, { message: "QR code size is not a valid Tomodachi Life QR code" }),
	image1: z.union([z.instanceof(File), z.any()]).optional(),
	image2: z.union([z.instanceof(File), z.any()]).optional(),
	image3: z.union([z.instanceof(File), z.any()]).optional(),
});

export async function POST(request: NextRequest) {
	const session = await auth();
	if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const rateLimit = new RateLimit(request, 2);
	const check = await rateLimit.handle();
	if (check) return check;

	const response = await fetch(`${process.env.BASE_URL}/api/admin/can-submit`);
	const { value } = await response.json();
	if (!value) return rateLimit.sendResponse({ error: "Submissions are disabled" }, 409);

	// Parse data
	const formData = await request.formData();

	let rawTags: string[];
	let rawQrBytesRaw: string[]; // raw raw
	try {
		rawTags = JSON.parse(formData.get("tags") as string);
		rawQrBytesRaw = JSON.parse(formData.get("qrBytesRaw") as string);
	} catch {
		return rateLimit.sendResponse({ error: "Invalid JSON in tags or QR bytes" }, 400);
	}

	const parsed = submitSchema.safeParse({
		name: formData.get("name"),
		tags: rawTags,
		description: formData.get("description"),
		qrBytesRaw: rawQrBytesRaw,
		image1: formData.get("image1"),
		image2: formData.get("image2"),
		image3: formData.get("image3"),
	});

	if (!parsed.success) return rateLimit.sendResponse({ error: parsed.error.errors[0].message }, 400);
	const { name: uncensoredName, tags: uncensoredTags, description: uncensoredDescription, qrBytesRaw, image1, image2, image3 } = parsed.data;

	// Censor potential inappropriate words
	const name = profanity.censor(uncensoredName);
	const tags = uncensoredTags.map((t) => profanity.censor(t));
	const description = uncensoredDescription && profanity.censor(uncensoredDescription);

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

	const qrBytes = new Uint8Array(qrBytesRaw);

	// Convert QR code to JS
	let conversion: { mii: Mii; tomodachiLifeMii: TomodachiLifeMii };
	try {
		conversion = convertQrCode(qrBytes);
	} catch (error) {
		return rateLimit.sendResponse({ error }, 400);
	}

	// Create Mii in database
	const miiRecord = await prisma.mii.create({
		data: {
			userId: Number(session.user.id),
			name,
			tags,
			description,

			firstName: conversion.tomodachiLifeMii.firstName,
			lastName: conversion.tomodachiLifeMii.lastName,
			gender: conversion.mii.gender == 0 ? MiiGender.MALE : MiiGender.FEMALE,
			islandName: conversion.tomodachiLifeMii.islandName,
			allowedCopying: conversion.mii.allowCopying,
		},
	});

	// Ensure directories exist
	const miiUploadsDirectory = path.join(uploadsDirectory, miiRecord.id.toString());
	await fs.mkdir(miiUploadsDirectory, { recursive: true });

	// Download the image of the Mii
	let studioBuffer: Buffer;
	try {
		const studioUrl = conversion.mii.studioUrl({ width: 512 });
		const studioResponse = await fetch(studioUrl);

		if (!studioResponse.ok) {
			throw new Error(`Failed to fetch Mii image ${studioResponse.status}`);
		}

		const studioArrayBuffer = await studioResponse.arrayBuffer();
		studioBuffer = Buffer.from(studioArrayBuffer);
	} catch (error) {
		// Clean up if something went wrong
		await prisma.mii.delete({ where: { id: miiRecord.id } });

		console.error("Failed to download Mii image:", error);
		return rateLimit.sendResponse({ error: "Failed to download Mii image" }, 500);
	}

	try {
		// Compress and upload
		const studioWebpBuffer = await sharp(studioBuffer).webp({ quality: 85 }).toBuffer();
		const studioFileLocation = path.join(miiUploadsDirectory, "mii.webp");

		await fs.writeFile(studioFileLocation, studioWebpBuffer);

		// Generate a new QR code for aesthetic reasons
		const byteString = String.fromCharCode(...qrBytes);
		const generatedCode = qrcode(0, "L");
		generatedCode.addData(byteString, "Byte");
		generatedCode.make();

		// Upload QR code
		const codeDataUrl = generatedCode.createDataURL();
		const codeBase64 = codeDataUrl.replace(/^data:image\/gif;base64,/, "");
		const codeBuffer = Buffer.from(codeBase64, "base64");

		// Compress and upload
		const codeWebpBuffer = await sharp(codeBuffer).webp({ quality: 85 }).toBuffer();
		const codeFileLocation = path.join(miiUploadsDirectory, "qr-code.webp");

		await fs.writeFile(codeFileLocation, codeWebpBuffer);
	} catch (error) {
		// Clean up if something went wrong
		await prisma.mii.delete({ where: { id: miiRecord.id } });

		console.error("Error processing Mii files:", error);
		return rateLimit.sendResponse({ error: "Failed to process and store Mii files" }, 500);
	}

	// Compress and upload user images
	try {
		await Promise.all(
			images.map(async (image, index) => {
				const buffer = Buffer.from(await image.arrayBuffer());
				const webpBuffer = await sharp(buffer).webp({ quality: 85 }).toBuffer();
				const fileLocation = path.join(miiUploadsDirectory, `image${index}.webp`);

				await fs.writeFile(fileLocation, webpBuffer);
			})
		);

		// Update database to tell it how many images exist
		await prisma.mii.update({
			where: {
				id: miiRecord.id,
			},
			data: {
				imageCount: images.length,
			},
		});
	} catch (error) {
		console.error("Error uploading user images:", error);
		return rateLimit.sendResponse({ error: "Failed to store user images" }, 500);
	}

	return rateLimit.sendResponse({ success: true, id: miiRecord.id });
}
