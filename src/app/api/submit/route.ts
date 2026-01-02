import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import fs from "fs/promises";
import path from "path";
import sharp from "sharp";

import qrcode from "qrcode-generator";
import { profanity } from "@2toad/profanity";
import { MiiGender, MiiPlatform } from "@prisma/client";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { nameSchema, tagsSchema } from "@/lib/schemas";
import { RateLimit } from "@/lib/rate-limit";

import { generateMetadataImage, validateImage } from "@/lib/images";
import { convertQrCode } from "@/lib/qr-codes";
import Mii from "@/lib/mii.js/mii";
import { TomodachiLifeMii } from "@/lib/tomodachi-life-mii";

const uploadsDirectory = path.join(process.cwd(), "uploads", "mii");

const submitSchema = z
	.object({
		platform: z.enum(MiiPlatform).default("THREE_DS"),
		name: nameSchema,
		tags: tagsSchema,
		description: z.string().trim().max(256).optional(),

		// Switch
		gender: z.enum(MiiGender).default("MALE"),
		miiPortraitImage: z.union([z.instanceof(File), z.any()]).optional(),

		// QR code
		qrBytesRaw: z.array(z.number(), { error: "A QR code is required" }).length(372, {
			error: "QR code size is not a valid Tomodachi Life QR code",
		}),

		// Custom images
		image1: z.union([z.instanceof(File), z.any()]).optional(),
		image2: z.union([z.instanceof(File), z.any()]).optional(),
		image3: z.union([z.instanceof(File), z.any()]).optional(),
	})
	// This refine function is probably useless
	.refine(
		(data) => {
			// If platform is Switch, gender and miiPortraitImage must be present
			if (data.platform === "SWITCH") {
				return data.gender !== undefined && data.miiPortraitImage !== undefined;
			}
			return true;
		},
		{
			message: "Gender and Mii portrait image are required for Switch platform",
			path: ["gender", "miiPortraitImage"],
		}
	);

export async function POST(request: NextRequest) {
	const session = await auth();
	if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const rateLimit = new RateLimit(request, 3);
	const check = await rateLimit.handle();
	if (check) return check;

	const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/can-submit`);
	const { value } = await response.json();
	if (!value) return rateLimit.sendResponse({ error: "Submissions are temporarily disabled" }, 503);

	// Parse tags and QR code as JSON
	const formData = await request.formData();

	let rawTags: string[];
	let rawQrBytesRaw: string[]; // raw raw
	try {
		rawTags = JSON.parse(formData.get("tags") as string);
		rawQrBytesRaw = JSON.parse(formData.get("qrBytesRaw") as string);
	} catch {
		return rateLimit.sendResponse({ error: "Invalid JSON in tags or QR code data" }, 400);
	}

	// Parse and check all submission info
	const parsed = submitSchema.safeParse({
		platform: formData.get("platform"),
		name: formData.get("name"),
		tags: rawTags,
		description: formData.get("description"),

		gender: formData.get("gender") ?? undefined, // ZOD MOMENT
		miiPortraitImage: formData.get("miiPortraitImage"),

		qrBytesRaw: rawQrBytesRaw,

		image1: formData.get("image1"),
		image2: formData.get("image2"),
		image3: formData.get("image3"),
	});

	if (!parsed.success) return rateLimit.sendResponse({ error: parsed.error.issues[0].message }, 400);
	const data = parsed.data;

	// Censor potential inappropriate words
	const name = profanity.censor(data.name);
	const tags = data.tags.map((t) => profanity.censor(t));
	const description = data.description && profanity.censor(data.description);

	// Validate image files
	const customImages: File[] = [];

	for (const img of [data.image1, data.image2, data.image3]) {
		if (!img) continue;

		const imageValidation = await validateImage(img);
		if (imageValidation.valid) {
			customImages.push(img);
		} else {
			return rateLimit.sendResponse({ error: imageValidation.error }, imageValidation.status ?? 400);
		}
	}

	console.log(data.miiPortraitImage);

	// Check Mii portrait image as well (Switch)
	if (data.platform === "SWITCH") {
		if (data.miiPortraitImage.length === 0) return rateLimit.sendResponse({ error: "No mii portrait found!" }, 400);

		const imageValidation = await validateImage(data.miiPortraitImage);
		if (!imageValidation.valid) return rateLimit.sendResponse({ error: imageValidation.error }, imageValidation.status ?? 400);
	}

	const qrBytes = new Uint8Array(data.qrBytesRaw);

	// Convert QR code to JS (3DS)
	let conversion: { mii: Mii; tomodachiLifeMii: TomodachiLifeMii } | undefined;
	if (data.platform === "THREE_DS") {
		try {
			conversion = convertQrCode(qrBytes);
		} catch (error) {
			return rateLimit.sendResponse({ error }, 400);
		}
	}

	// Create Mii in database
	const miiRecord = await prisma.mii.create({
		data: {
			userId: Number(session.user.id),
			platform: data.platform,
			name,
			tags,
			description,
			gender: data.gender ?? "MALE",

			// Automatically detect certain information if on 3DS
			...(data.platform === "THREE_DS" &&
				conversion && {
					firstName: conversion.tomodachiLifeMii.firstName,
					lastName: conversion.tomodachiLifeMii.lastName,
					gender: conversion.mii.gender == 0 ? MiiGender.MALE : MiiGender.FEMALE,
					islandName: conversion.tomodachiLifeMii.islandName,
					allowedCopying: conversion.mii.allowCopying,
				}),
		},
	});

	// Ensure directories exist
	const miiUploadsDirectory = path.join(uploadsDirectory, miiRecord.id.toString());
	await fs.mkdir(miiUploadsDirectory, { recursive: true });

	try {
		let portraitBuffer: Buffer | undefined;

		// Download the image of the Mii (3DS)
		if (data.platform === "THREE_DS") {
			const studioUrl = conversion?.mii.studioUrl({ width: 512 });
			const studioResponse = await fetch(studioUrl!);

			if (!studioResponse.ok) {
				throw new Error(`Failed to fetch Mii image ${studioResponse.status}`);
			}

			portraitBuffer = Buffer.from(await studioResponse.arrayBuffer());
		} else if (data.platform === "SWITCH") {
			portraitBuffer = Buffer.from(await data.miiPortraitImage.arrayBuffer());
		}

		if (!portraitBuffer) throw Error("Mii portrait buffer not initialised");
		const webpBuffer = await sharp(portraitBuffer).webp({ quality: 85 }).toBuffer();
		const fileLocation = path.join(miiUploadsDirectory, "mii.webp");

		await fs.writeFile(fileLocation, webpBuffer);
	} catch (error) {
		// Clean up if something went wrong
		await prisma.mii.delete({ where: { id: miiRecord.id } });

		console.error("Failed to download/store Mii portrait:", error);
		return rateLimit.sendResponse({ error: "Failed to download/store Mii portrait" }, 500);
	}

	try {
		// Generate a new QR code for aesthetic reasons
		const byteString = String.fromCharCode(...qrBytes);
		const generatedCode = qrcode(0, "L");
		generatedCode.addData(byteString, "Byte");
		generatedCode.make();

		// Store QR code
		const codeDataUrl = generatedCode.createDataURL();
		const codeBase64 = codeDataUrl.replace(/^data:image\/gif;base64,/, "");
		const codeBuffer = Buffer.from(codeBase64, "base64");

		// Compress and store
		const codeWebpBuffer = await sharp(codeBuffer).webp({ quality: 85 }).toBuffer();
		const codeFileLocation = path.join(miiUploadsDirectory, "qr-code.webp");

		await fs.writeFile(codeFileLocation, codeWebpBuffer);
	} catch (error) {
		// Clean up if something went wrong
		await prisma.mii.delete({ where: { id: miiRecord.id } });

		console.error("Error generating QR code:", error);
		return rateLimit.sendResponse({ error: "Failed to generate QR code" }, 500);
	}

	try {
		await generateMetadataImage(miiRecord, session.user.name!);
	} catch (error) {
		console.error(error);
		return rateLimit.sendResponse(
			{
				error: `Failed to generate 'metadata' type image for mii ${miiRecord.id}`,
			},
			500
		);
	}

	// Compress and store user images
	try {
		await Promise.all(
			customImages.map(async (image, index) => {
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
				imageCount: customImages.length,
			},
		});
	} catch (error) {
		console.error("Error storing user images:", error);
		return rateLimit.sendResponse({ error: "Failed to store user images" }, 500);
	}

	return rateLimit.sendResponse({ success: true, id: miiRecord.id });
}
