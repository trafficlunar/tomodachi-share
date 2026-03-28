import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { z } from "zod";

import fs from "fs/promises";
import path from "path";
import sharp from "sharp";

import qrcode from "qrcode-generator";
import { profanity } from "@2toad/profanity";
import { MiiGender, MiiMakeup, MiiPlatform } from "@prisma/client";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { nameSchema, switchMiiInstructionsSchema, tagsSchema } from "@/lib/schemas";
import { RateLimit } from "@/lib/rate-limit";
import { generateMetadataImage, validateImage } from "@/lib/images";
import { convertQrCode } from "@/lib/qr-codes";
import Mii from "@/lib/mii.js/mii";
import { ThreeDsTomodachiLifeMii } from "@/lib/three-ds-tomodachi-life-mii";

import { SwitchMiiInstructions } from "@/types";
import { minifyInstructions } from "@/lib/switch";

const uploadsDirectory = path.join(process.cwd(), "uploads", "mii");

const submitSchema = z
	.object({
		platform: z.enum(MiiPlatform).default("THREE_DS"),
		name: nameSchema,
		tags: tagsSchema,
		description: z.string().trim().max(256).optional(),

		// Switch
		gender: z.enum(MiiGender).default("MALE"),
		makeup: z.enum(MiiMakeup).default("NONE"),
		miiPortraitImage: z.union([z.instanceof(File), z.any()]).optional(),
		miiFeaturesImage: z.union([z.instanceof(File), z.any()]).optional(),
		instructions: switchMiiInstructionsSchema,

		// QR code
		qrBytesRaw: z
			.array(z.number(), { error: "A QR code is required" })
			.length(372, {
				error: "QR code size is not a valid Tomodachi Life QR code",
			})
			.nullish(),

		// Custom images
		image1: z.union([z.instanceof(File), z.any()]).optional(),
		image2: z.union([z.instanceof(File), z.any()]).optional(),
		image3: z.union([z.instanceof(File), z.any()]).optional(),
	})
	// This refine function is probably useless
	.refine(
		(data) => {
			// If platform is Switch, gender, miiPortraitImage, and miiFeaturesImage must be present
			if (data.platform === "SWITCH") {
				return data.gender !== undefined && data.miiPortraitImage !== undefined;
			}
			return true;
		},
		{
			message: "Gender, Mii portrait & features image, and instructions are required for Switch platform",
			path: ["gender", "miiPortraitImage", "miiFeaturesImage", "instructions"],
		},
	);

export async function POST(request: NextRequest) {
	const session = await auth();
	if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	Sentry.setUser({ id: session.user?.id, name: session.user?.name });

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
	} catch (error) {
		Sentry.captureException(error, {
			extra: { stage: "submit-json-parse" },
		});
		return rateLimit.sendResponse({ error: "Invalid JSON in tags or QR code data" }, 400);
	}

	// Minify instructions to save space and improve user experience
	let minifiedInstructions: Partial<SwitchMiiInstructions> | undefined;
	if (formData.get("platform") === "SWITCH")
		minifiedInstructions = minifyInstructions(JSON.parse((formData.get("instructions") as string) ?? "{}") as SwitchMiiInstructions);

	// Parse and check all submission info
	const parsed = submitSchema.safeParse({
		platform: formData.get("platform"),
		name: formData.get("name"),
		tags: rawTags,
		description: formData.get("description"),

		gender: formData.get("gender") ?? undefined, // ZOD MOMENT
		makeup: formData.get("makeup") ?? undefined,
		miiPortraitImage: formData.get("miiPortraitImage"),
		miiFeaturesImage: formData.get("miiFeaturesImage"),
		instructions: minifiedInstructions,

		qrBytesRaw: rawQrBytesRaw,

		image1: formData.get("image1"),
		image2: formData.get("image2"),
		image3: formData.get("image3"),
	});

	if (!parsed.success) {
		const firstIssue = parsed.error.issues[0];
		const path = firstIssue.path.length ? firstIssue.path.join(".") : "root";
		const error = `${path}: ${firstIssue.message}`;
		const issues = parsed.error.issues;
		const hasInstructionsErrors = issues.some((issue) => issue.path[0] === "instructions");

		if (hasInstructionsErrors) {
			Sentry.captureException(error, {
				extra: { issues, rawInstructions: formData.get("instructions"), stage: "submit-instructions" },
			});
		}

		return rateLimit.sendResponse({ error }, 400);
	}
	const {
		platform,
		name: uncensoredName,
		tags: uncensoredTags,
		description: uncensoredDescription,
		qrBytesRaw,
		gender,
		makeup,
		miiPortraitImage,
		miiFeaturesImage,
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
			return rateLimit.sendResponse({ error: `Failed to verify custom image: ${imageValidation.error}` }, imageValidation.status ?? 400);
		}
	}

	// Check Mii portrait & features image (Switch)
	if (platform === "SWITCH") {
		const portraitValidation = await validateImage(miiPortraitImage);
		const featuresValidation = await validateImage(miiFeaturesImage);
		if (!portraitValidation.valid)
			return rateLimit.sendResponse({ error: `Failed to verify portrait: ${portraitValidation.error}` }, portraitValidation.status ?? 400);
		if (!featuresValidation.valid)
			return rateLimit.sendResponse({ error: `Failed to verify features: ${featuresValidation.error}` }, featuresValidation.status ?? 400);
	}

	const qrBytes = new Uint8Array(qrBytesRaw ?? []);

	// Convert QR code to JS (3DS)
	let conversion: { mii: Mii; tomodachiLifeMii: ThreeDsTomodachiLifeMii } | undefined;
	if (platform === "THREE_DS") {
		try {
			conversion = convertQrCode(qrBytes);
		} catch (error) {
			Sentry.captureException(error, { extra: { stage: "qr-conversion" } });
			return rateLimit.sendResponse({ error: error instanceof Error ? error.message : String(error) }, 400);
		}
	}

	// Create Mii in database
	const miiRecord = await prisma.mii.create({
		data: {
			userId: Number(session.user?.id),
			platform,
			name,
			tags,
			description,
			gender: gender ?? "MALE",

			// Automatically detect certain information if on 3DS
			...(platform === "THREE_DS"
				? conversion && {
						firstName: conversion.tomodachiLifeMii.firstName,
						lastName: conversion.tomodachiLifeMii.lastName,
						gender: conversion.mii.gender == 0 ? MiiGender.MALE : MiiGender.FEMALE,
						islandName: conversion.tomodachiLifeMii.islandName,
						allowedCopying: conversion.mii.allowCopying,
					}
				: {
						instructions: minifiedInstructions,
						makeup: makeup ?? "NONE",
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

			// Save features image
			const featuresBuffer = Buffer.from(await miiFeaturesImage.arrayBuffer());
			const pngBuffer = await sharp(featuresBuffer)
				.resize({
					height: 800,
					fit: "inside",
					withoutEnlargement: true,
				})
				.png({ quality: 85 })
				.toBuffer();
			const fileLocation = path.join(miiUploadsDirectory, "features.png");
			await fs.writeFile(fileLocation, pngBuffer);
		}

		// Save portrait image
		if (!portraitBuffer) throw Error("Mii portrait buffer not initialised");
		const pngBuffer = await sharp(portraitBuffer)
			.resize({
				height: 500,
				fit: "inside",
				withoutEnlargement: true,
			})
			.png({ quality: 85 })
			.toBuffer();
		const fileLocation = path.join(miiUploadsDirectory, "mii.png");

		await fs.writeFile(fileLocation, pngBuffer);
	} catch (error) {
		// Clean up if something went wrong
		await prisma.mii.delete({ where: { id: miiRecord.id } });

		console.error("Failed to download/store Mii portrait/features:", error);
		Sentry.captureException(error, { extra: { miiId: miiRecord.id, stage: "studio-image-download" } });
		return rateLimit.sendResponse({ error: "Failed to download/store Mii portrait/features" }, 500);
	}

	try {
		await generateMetadataImage(miiRecord, session.user?.name!);
	} catch (error) {
		console.error("Failed to generate metadata image:", error);
		Sentry.captureException(error, { extra: { miiId: miiRecord.id, stage: "metadata-image-generation" } });
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
			const codePngBuffer = await sharp(codeBuffer).png({ quality: 85 }).toBuffer();
			const codeFileLocation = path.join(miiUploadsDirectory, "qr-code.png");

			await fs.writeFile(codeFileLocation, codePngBuffer);
		} catch (error) {
			// Clean up if something went wrong
			await prisma.mii.delete({ where: { id: miiRecord.id } });

			console.error("Error processing Mii files:", error);
			Sentry.captureException(error, { extra: { miiId: miiRecord.id, stage: "file-processing" } });
			return rateLimit.sendResponse({ error: "Failed to process and store Mii files" }, 500);
		}
	}

	// Compress and store user images
	try {
		await Promise.all(
			customImages.map(async (image, index) => {
				const buffer = Buffer.from(await image.arrayBuffer());
				const pngBuffer = await sharp(buffer).png({ quality: 85 }).toBuffer();
				const fileLocation = path.join(miiUploadsDirectory, `image${index}.png`);

				await fs.writeFile(fileLocation, pngBuffer);
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

		Sentry.captureException(error, { extra: { miiId: miiRecord.id, stage: "user-image-storage" } });
		return rateLimit.sendResponse({ error: "Failed to store user images" }, 500);
	}

	return rateLimit.sendResponse({ success: true, id: miiRecord.id });
}
