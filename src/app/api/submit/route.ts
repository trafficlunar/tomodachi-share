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
		accessKey: z
			.string()
			.length(7, { error: "Access key must be 7 characters in length" })
			.regex(/^[a-zA-Z0-9]+$/, "Access key must be alphanumeric"),
		gender: z.enum(MiiGender).default("MALE"),
		miiPortraitImage: z.union([z.instanceof(File), z.any()]).optional(),

		// QR code
		qrBytesRaw: z.array(z.number(), { error: "A QR code is required" }).length(372, { error: "QR code size is not a valid Tomodachi Life QR code" }).optional(),

		// Custom images
		image1: z.union([z.instanceof(File), z.any()]).optional(),
		image2: z.union([z.instanceof(File), z.any()]).optional(),
		image3: z.union([z.instanceof(File), z.any()]).optional(),
	})
	// This refine function is probably useless
	.refine(
		(data) => {
			// If platform is Switch, accessKey, gender, and miiPortraitImage must be present
			if (data.platform === "SWITCH") {
				return data.accessKey !== undefined && data.gender !== undefined && data.miiPortraitImage !== undefined;
			}
			return true;
		},
		{
			message: "Access key, gender, and Mii portrait image is required for Switch",
			path: ["accessKey", "gender", "miiPortraitImage"],
		},
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
	let rawQrBytesRaw: string[] | undefined = undefined; // good variable name - raw raw; is undefined for zod to ignore it if platform is Switch
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

		accessKey: formData.get("accessKey"),
		gender: formData.get("gender"),
		miiPortraitImage: formData.get("miiPortraitImage"),

		qrBytesRaw: rawQrBytesRaw ?? undefined,

		image1: formData.get("image1"),
		image2: formData.get("image2"),
		image3: formData.get("image3"),
	});

	if (!parsed.success) return rateLimit.sendResponse({ error: parsed.error.issues[0].message }, 400);
	const {
		platform,
		name: uncensoredName,
		tags: uncensoredTags,
		description: uncensoredDescription,
		qrBytesRaw,
		accessKey,
		gender,
		miiPortraitImage,
		image1,
		image2,
		image3,
	} = parsed.data;

	// Censor potential inappropriate words
	const name = profanity.censor(uncensoredName);
	const tags = uncensoredTags.map((t) => profanity.censor(t));
	const description = uncensoredDescription && profanity.censor(uncensoredDescription);

	// Validate image files
	const customImages: File[] = [];

	for (const img of [image1, image2, image3]) {
		if (!img) continue;

		const imageValidation = await validateImage(img);
		if (imageValidation.valid) {
			customImages.push(img);
		} else {
			return rateLimit.sendResponse({ error: imageValidation.error }, imageValidation.status ?? 400);
		}
	}

	// Check Mii portrait image as well (Switch)
	if (platform === "SWITCH") {
		const imageValidation = await validateImage(miiPortraitImage);
		if (!imageValidation.valid) return rateLimit.sendResponse({ error: imageValidation.error }, imageValidation.status ?? 400);
	}

	const qrBytes = new Uint8Array(qrBytesRaw ?? []);

	// Convert QR code to JS (3DS)
	let conversion: { mii: Mii; tomodachiLifeMii: TomodachiLifeMii } | undefined;
	if (platform === "THREE_DS") {
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
			platform,
			name,
			tags,
			description,
			gender: gender ?? "MALE",

			// Access key only for Switch
			accessKey: platform === "SWITCH" ? accessKey : null,

			// Automatically detect certain information if on 3DS
			...(platform === "THREE_DS" &&
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
		if (platform === "THREE_DS") {
			const studioUrl = conversion?.mii.studioUrl({ width: 512 });
			const studioResponse = await fetch(studioUrl!);

			if (!studioResponse.ok) {
				throw new Error(`Failed to fetch Mii image ${studioResponse.status}`);
			}

			portraitBuffer = Buffer.from(await studioResponse.arrayBuffer());
		} else if (platform === "SWITCH") {
			portraitBuffer = Buffer.from(await miiPortraitImage.arrayBuffer());
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

	if (platform === "THREE_DS") {
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
	}

	try {
		await generateMetadataImage(miiRecord, session.user.name!);
	} catch (error) {
		console.error(error);
		return rateLimit.sendResponse(
			{
				error: `Failed to generate 'metadata' type image for mii ${miiRecord.id}`,
			},
			500,
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
			}),
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
