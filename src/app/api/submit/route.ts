import { NextResponse } from "next/server";

import fs from "fs/promises";
import path from "path";
import sharp from "sharp";

import qrcode from "qrcode-generator";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { nameSchema, tagsSchema } from "@/lib/schemas";

import { validateImage } from "@/lib/images";
import { convertQrCode } from "@/lib/qr-codes";
import Mii from "@/lib/mii.js/mii";
import TomodachiLifeMii from "@/lib/tomodachi-life-mii";

const uploadsDirectory = path.join(process.cwd(), "public", "mii");

export async function POST(request: Request) {
	const session = await auth();
	if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const formData = await request.formData();

	const name = formData.get("name") as string;
	const tags: string[] = JSON.parse(formData.get("tags") as string);
	const qrBytesRaw: number[] = JSON.parse(formData.get("qrBytesRaw") as string);

	const image1 = formData.get("image1") as File;
	const image2 = formData.get("image2") as File;
	const image3 = formData.get("image3") as File;

	if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });
	if (!tags || tags.length == 0) return NextResponse.json({ error: "At least one tag is required" }, { status: 400 });
	if (!qrBytesRaw || qrBytesRaw.length == 0) return NextResponse.json({ error: "A QR code is required" }, { status: 400 });

	const nameValidation = nameSchema.safeParse(name);
	if (!nameValidation.success) return NextResponse.json({ error: nameValidation.error.errors[0].message }, { status: 400 });

	const tagsValidation = tagsSchema.safeParse(tags);
	if (!tagsValidation.success) return NextResponse.json({ error: tagsValidation.error.errors[0].message }, { status: 400 });

	if (qrBytesRaw.length !== 372) return NextResponse.json({ error: "QR code size is not a valid Tomodachi Life QR code" }, { status: 400 });

	// Validate image files
	const images: File[] = [];

	for (const img of [image1, image2, image3]) {
		if (!img) break;

		const imageValidation = await validateImage(img);
		if (imageValidation.valid) {
			images.push(img);
		} else {
			return NextResponse.json({ error: imageValidation.error }, { status: imageValidation.status ?? 400 });
		}
	}

	const qrBytes = new Uint8Array(qrBytesRaw);

	// Convert QR code to JS
	let conversion: { mii: Mii; tomodachiLifeMii: TomodachiLifeMii };
	try {
		conversion = convertQrCode(qrBytes);
	} catch (error) {
		return NextResponse.json({ error }, { status: 400 });
	}

	// Create Mii in database
	const miiRecord = await prisma.mii.create({
		data: {
			userId: Number(session.user.id),
			name,
			tags,

			firstName: conversion.tomodachiLifeMii.firstName,
			lastName: conversion.tomodachiLifeMii.lastName,
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
		return NextResponse.json({ error: "Failed to download Mii image" }, { status: 500 });
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
		return NextResponse.json({ error: "Failed to process and store Mii files" }, { status: 500 });
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
		return NextResponse.json({ error: "Failed to store user images" }, { status: 500 });
	}

	return NextResponse.json({ success: true, id: miiRecord.id });
}
