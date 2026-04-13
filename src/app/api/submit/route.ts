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
import { settings } from "@/lib/settings";
import { CharInfoEx } from "charinfo-ex";

const uploadsDirectory = path.join(process.cwd(), "uploads", "mii");

const submitSchema = z.object({
	platform: z.enum(MiiPlatform).default("THREE_DS"),
	name: nameSchema,
	tags: tagsSchema,
	description: z.string().trim().max(512).optional(),

	// Switch
	gender: z.enum(MiiGender).default("MALE"),
	makeup: z.enum(MiiMakeup).default("PARTIAL"),
	miiPortraitImage: z.union([z.instanceof(File), z.any()]).optional(),
	youtubeId: z
		.string()
		.trim()
		.transform((val) => (val === "" ? null : val))
		.refine((val) => val === null || /^[a-zA-Z0-9_-]{11}$/.test(val), "Invalid YouTube video ID")
		.optional(),

	way: z.enum(["savedata", "manual"]).optional(),

	// Save data way
	miiDataFile: z
		.instanceof(File)
		.refine((blob) => blob.size < 1024 * 1024 * 1.5, "File too large") // TODO: actual size
		.optional(),

	// Manual way
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
});

export async function POST(request: NextRequest) {
	const session = await auth();
	if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	Sentry.setUser({ id: session.user?.id, name: session.user?.name });

	const rateLimit = new RateLimit(request, 3);
	const check = await rateLimit.handle();
	if (check) return check;
	if (!settings.canSubmit) return rateLimit.sendResponse({ error: "Submissions are temporarily disabled" }, 503);

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
	if (formData.get("platform") === "SWITCH" && formData.get("way") === "manual")
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
		youtubeId: formData.get("youtubeId"),

		way: formData.get("way"),
		miiDataFile: formData.get("miiDataFile"),

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
		way,
		miiDataFile,
		youtubeId,
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

		const validation = await validateImage(img);
		if (validation.valid) {
			customImages.push(img);
		} else {
			return rateLimit.sendResponse({ error: `Failed to verify custom image: ${validation.error}` }, validation.status ?? 400);
		}
	}

	// Check Mii portrait & features image (Switch)
	if (platform === "SWITCH") {
		const portraitValidation = await validateImage(miiPortraitImage);
		if (!portraitValidation.valid)
			return rateLimit.sendResponse({ error: `Failed to verify portrait: ${portraitValidation.error}` }, portraitValidation.status ?? 400);

		if (way === "manual") {
			const featuresValidation = await validateImage(miiFeaturesImage);
			if (!featuresValidation.valid)
				return rateLimit.sendResponse({ error: `Failed to verify features: ${featuresValidation.error}` }, featuresValidation.status ?? 400);
		}
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

	const miiDataFileBuffer = miiDataFile ? await miiDataFile.arrayBuffer() : undefined;
	const miiDataFileArray = miiDataFileBuffer ? new Uint8Array(miiDataFileBuffer) : undefined;
	const miiData = miiDataFileBuffer ? CharInfoEx.FromShareMiiFileArrayBuffer(miiDataFileBuffer) : undefined;

	if (way === "savedata") {
		if (!miiData || !miiDataFileBuffer || !miiDataFileArray) return rateLimit.sendResponse({ error: "No valid Mii data provided" }, 400);

		const view = new DataView(miiDataFileBuffer);

		const parse = (index: number): number => view.getUint8(161 + index * 4);

		const age = view.getUint32(0x00e1, true);
		const year = view.getUint32(0x00d9, true);

		const dontAge = age !== 0xffffffff;

		const instructions: Partial<SwitchMiiInstructions> = {
			head: {
				type: miiData.facelineType,
				skinColor: miiData.facelineColor,
			},
			hair: {
				set: miiData.hairType,
				bangs: miiData.hairTypeFront,
				back: miiData.hairTypeBack,
				color: miiData.hairColor0,
				subColor: miiData.hairColor1,
				subColor2: miiData.hairColor0, // TODO: check
				style: miiData.hairStyle,
				// uh oh, no flipped
				isFlipped: false,
			},
			eyebrows: {
				type: miiData.eyebrowType,
				color: miiData.eyebrowColor,
				height: miiData.eyebrowY - 10,
				distance: miiData.eyebrowX - 4,
				rotation: miiData.eyebrowRotate - 6,
				size: miiData.eyebrowScale - 4,
				stretch: miiData.eyebrowAspect - 3,
			},
			eyes: {
				main: {
					type: miiData.eyeType,
					color: miiData.eyeColor,
					height: miiData.eyeY - 12,
					distance: miiData.eyeX - 2,
					rotation: miiData.eyeRotate - 4,
					size: miiData.eyeScale - 4,
					stretch: miiData.eyeAspect - 3,
				},
				eyelashesTop: {
					type: miiData.eyelashUpperType,
					height: miiData.eyelashUpperY,
					distance: miiData.eyelashUpperX,
					rotation: miiData.eyelashUpperRotate,
					size: miiData.eyelashUpperScale,
					stretch: miiData.eyelashUpperAspect,
				},
				eyelashesBottom: {
					type: miiData.eyelashLowerType,
					height: miiData.eyelashLowerY,
					distance: miiData.eyelashLowerX,
					rotation: miiData.eyelashLowerRotate,
					size: miiData.eyelashLowerScale,
					stretch: miiData.eyelashLowerAspect,
				},
				eyelidTop: {
					type: miiData.eyelidUpperType,
					height: miiData.eyelidUpperY,
					distance: miiData.eyelidUpperX,
					rotation: miiData.eyelidUpperRotate,
					size: miiData.eyelidUpperScale,
					stretch: miiData.eyelidUpperAspect,
				},
				eyelidBottom: {
					type: miiData.eyelidLowerType,
					height: miiData.eyelidLowerY,
					distance: miiData.eyelidLowerX,
					rotation: miiData.eyelidLowerRotate,
					size: miiData.eyelidLowerScale,
					stretch: miiData.eyelidLowerAspect,
				},
				eyeliner: {
					type: miiData.eyeShadowColor != 0,
					color: miiData.eyeShadowColor,
				},
				pupil: {
					type: miiData.eyeHighlightType,
					height: miiData.eyeHighlightY,
					distance: miiData.eyeHighlightX,
					rotation: miiData.eyeHighlightRotate,
					size: miiData.eyeHighlightScale,
					stretch: miiData.eyeHighlightAspect,
				},
			},
			nose: {
				type: miiData.noseType,
				height: miiData.noseY - 9,
				size: miiData.noseScale - 4,
			},
			lips: {
				type: miiData.mouthType,
				color: miiData.mouthColor,
				height: miiData.mouthY - 13,
				rotation: miiData.mouthRotate,
				size: miiData.mouthScale - 4,
				stretch: miiData.mouthAspect - 3,
				// uh oh, no lipstick
				hasLipstick: false,
			},
			ears: {
				type: miiData.earType,
				height: miiData.earY - 4,
				size: miiData.earScale - 2,
			},
			glasses: {
				type: miiData.glassType1,
				type2: miiData.glassType2,
				ringColor: miiData.glassColor1,
				shadesColor: miiData.glassColor2,
				height: miiData.glassY - 11,
				size: miiData.glassScale - 4,
				stretch: miiData.glassAspect - 3,
			},
			other: {
				wrinkles1: {
					type: miiData.wrinkleLowerType,
					height: miiData.wrinkleLowerY - 15,
					distance: miiData.wrinkleLowerX - 2,
					size: miiData.wrinkleLowerScale - 6,
					stretch: miiData.wrinkleLowerAspect - 3,
				},
				wrinkles2: {
					type: miiData.wrinkleUpperType,
					height: miiData.wrinkleUpperY - 23,
					distance: miiData.wrinkleUpperX - 7,
					size: miiData.wrinkleUpperScale - 6,
					stretch: miiData.wrinkleUpperAspect - 3,
				},
				beard: {
					type: miiData.beardType,
					color: miiData.beardColor,
				},
				moustache: {
					type: miiData.mustacheType,
					color: miiData.mustacheColor,
					height: miiData.mustacheY - 10,
					// uh oh, no flipped
					isFlipped: false,
					size: miiData.mustacheScale - 4,
					stretch: miiData.mustacheAspect - 3,
				},
				goatee: {
					type: miiData.beardShortType,
					color: miiData.beardShortColor,
				},
				mole: {
					type: miiData.moleX != 0,
					height: miiData.moleY - 20,
					distance: miiData.moleX - 2,
					size: miiData.moleScale - 4,
				},
				eyeShadow: {
					type: miiData.makeup0,
					color: miiData.makeup0Color,
					height: miiData.makeup0Y - 12,
					distance: miiData.makeup0X - 1,
					size: miiData.makeup0Scale - 6,
					stretch: miiData.makeup0Aspect - 3,
				},
				blush: {
					type: miiData.makeup1,
					color: miiData.makeup1Color,
					height: miiData.makeup1Y - 19,
					distance: miiData.makeup1X - 6,
					size: miiData.makeup1Scale - 5,
					stretch: miiData.makeup1Aspect - 3,
				},
			},
			height: miiData.height,
			weight: miiData.build,
			datingPreferences: ([MiiGender.MALE, MiiGender.FEMALE, MiiGender.NONBINARY] as const).filter((_, i) => miiDataFileArray[0x01a9 + i] === 1),
			birthday: {
				month: parse(17),
				day: parse(15),
				age: dontAge ? age : new Date().getFullYear() - year,
				dontAge,
			},
			voice: {
				speed: parse(6),
				pitch: parse(8),
				depth: parse(5),
				delivery: Math.max(0, view.getInt8(0xc5)), // why is this an integer??
				tone: parse(7) + 1,
				// preset type?
			},
			personality: {
				movement: parse(4) - 1,
				speech: parse(2) - 1,
				energy: parse(1) - 1,
				thinking: parse(0) - 1,
				overall: parse(3) - 1,
			},
		};

		minifiedInstructions = minifyInstructions(instructions);
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
			in_queue: settings.queueEnabled,

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
						youtubeId,
						makeup: makeup ?? "PARTIAL",
						instructions: minifiedInstructions,
						...(way === "savedata" && { miiData: miiDataFileArray }),
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

			if (way === "manual") {
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
				const pngBuffer = await sharp(buffer).resize({ height: 800, fit: "inside", withoutEnlargement: true }).png({ quality: 85 }).toBuffer();
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
