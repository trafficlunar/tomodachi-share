import fs from "fs/promises";
import path from "path";
import sharp from "sharp";

import { AES_CCM } from "@trafficlunar/asmcrypto.js";
import qrcode from "qrcode-generator";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MII_DECRYPTION_KEY } from "@/lib/constants";
import { nameSchema, tagsSchema } from "@/lib/schemas";

import Mii from "@/utils/mii.js/mii";
import TomodachiLifeMii from "@/utils/tomodachi-life-mii";

const uploadsDirectory = path.join(process.cwd(), "public", "mii");

export async function POST(request: Request) {
	const session = await auth();
	if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

	const { name, tags, qrBytesRaw } = await request.json();
	if (!name) return Response.json({ error: "Name is required" }, { status: 400 });
	if (!tags || tags.length == 0) return Response.json({ error: "At least one tag is required" }, { status: 400 });
	if (!qrBytesRaw || qrBytesRaw.length == 0) return Response.json({ error: "A QR code is required" }, { status: 400 });

	const nameValidation = nameSchema.safeParse(name);
	if (!nameValidation.success) return Response.json({ error: nameValidation.error.errors[0].message }, { status: 400 });
	const tagsValidation = tagsSchema.safeParse(tags);
	if (!tagsValidation.success) return Response.json({ error: tagsValidation.error.errors[0].message }, { status: 400 });

	// Validate QR code size
	if (qrBytesRaw.length !== 372) return Response.json({ error: "QR code size is not a valid Tomodachi Life QR code" }, { status: 400 });

	const qrBytes = new Uint8Array(qrBytesRaw);

	// Decrypt the Mii part of the QR code
	// (Credits to kazuki-4ys)
	const nonce = qrBytes.subarray(0, 8);
	const content = qrBytes.subarray(8, 0x70);

	const nonceWithZeros = new Uint8Array(12);
	nonceWithZeros.set(nonce, 0);

	let decrypted: Uint8Array<ArrayBufferLike> = new Uint8Array();
	try {
		decrypted = AES_CCM.decrypt(content, MII_DECRYPTION_KEY, nonceWithZeros, undefined, 16);
	} catch (error) {
		console.warn("Failed to decrypt QR code:", error);
		return Response.json({ error: "Failed to decrypt QR code. It may be invalid or corrupted." }, { status: 400 });
	}

	const result = new Uint8Array(96);
	result.set(decrypted.subarray(0, 12), 0);
	result.set(nonce, 12);
	result.set(decrypted.subarray(12), 20);

	// Check if QR code is valid (after decryption)
	if (result.length !== 0x60 || (result[0x16] !== 0 && result[0x17] !== 0))
		return Response.json({ error: "QR code is not a valid Mii QR code" }, { status: 400 });

	// Convert to Mii class
	const buffer = Buffer.from(result);
	const mii = new Mii(buffer);
	const tomodachiLifeMii = TomodachiLifeMii.fromBytes(qrBytes);

	if (tomodachiLifeMii.hairDyeEnabled) {
		mii.hairColor = tomodachiLifeMii.studioHairColor;
		mii.eyebrowColor = tomodachiLifeMii.studioHairColor;
		mii.facialHairColor = tomodachiLifeMii.studioHairColor;
	}

	// Create Mii in database
	const miiRecord = await prisma.mii.create({
		data: {
			userId: Number(session.user.id),
			name,
			tags,

			firstName: tomodachiLifeMii.firstName,
			lastName: tomodachiLifeMii.lastName,
			islandName: tomodachiLifeMii.islandName,
			allowedCopying: mii.allowCopying,
		},
	});

	// Ensure directories exist
	const miiUploadsDirectory = path.join(uploadsDirectory, miiRecord.id.toString());
	await fs.mkdir(miiUploadsDirectory, { recursive: true });

	// Download the image of the Mii
	let studioBuffer: Buffer;
	try {
		const studioUrl = mii.studioUrl({ width: 128 });
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
		return Response.json({ error: "Failed to download Mii image" }, { status: 500 });
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

		// todo: upload user images

		return Response.json({ success: true, id: miiRecord.id });
	} catch (error) {
		await prisma.mii.delete({ where: { id: miiRecord.id } });
		console.error("Error processing Mii files:", error);
		return Response.json({ error: "Failed to process and store Mii files" }, { status: 500 });
	}
}
