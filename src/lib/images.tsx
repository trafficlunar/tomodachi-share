// This file's extension is .tsx because JSX is used for satori to generate images
// Warnings below are disabled since satori is not Next.JS and is turned into an image anyways
/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */

import type { ReactNode } from "react";

import fs from "fs/promises";
import path from "path";
import sharp from "sharp";
import { fileTypeFromBuffer } from "file-type";

import satori, { Font } from "satori";

import { Mii } from "@prisma/client";

const MIN_IMAGE_DIMENSIONS = [320, 240];
const MAX_IMAGE_DIMENSIONS = [1920, 1080];
const MAX_IMAGE_SIZE = 4 * 1024 * 1024; // 4 MB
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

//#region Image validation
export async function validateImage(file: File): Promise<{ valid: boolean; error?: string; status?: number }> {
	if (!file || file.size == 0) return { valid: false, error: "Empty image file" };
	if (file.size > MAX_IMAGE_SIZE) return { valid: false, error: `Image too large. Maximum size is ${MAX_IMAGE_SIZE / (1024 * 1024)}MB` };

	try {
		const buffer = Buffer.from(await file.arrayBuffer());

		// Check mime type
		const fileType = await fileTypeFromBuffer(buffer);
		if (!fileType || !ALLOWED_MIME_TYPES.includes(fileType.mime))
			return { valid: false, error: "Invalid image file type. Only .jpeg, .png, .gif, and .webp are allowed" };

		let metadata: sharp.Metadata;
		try {
			metadata = await sharp(buffer).metadata();
		} catch {
			return { valid: false, error: "Invalid or corrupted image file" };
		}

		// Check image dimensions
		if (
			!metadata.width ||
			!metadata.height ||
			metadata.width < MIN_IMAGE_DIMENSIONS[0] ||
			metadata.width > MAX_IMAGE_DIMENSIONS[0] ||
			metadata.height < MIN_IMAGE_DIMENSIONS[1] ||
			metadata.height > MAX_IMAGE_DIMENSIONS[1]
		) {
			return { valid: false, error: "Image dimensions are invalid. Resolution must be between 320x240 and 1920x1080" };
		}

		// Check for inappropriate content
		// https://github.com/trafficlunar/api-moderation
		try {
			const blob = new Blob([buffer]);
			const formData = new FormData();
			formData.append("image", blob);

			const moderationResponse = await fetch("https://api.trafficlunar.net/moderate/image", { method: "POST", body: formData });

			if (!moderationResponse.ok) {
				console.error("Moderation API error");
				return { valid: false, error: "Content moderation check failed", status: 500 };
			}

			const result = await moderationResponse.json();
			if (result.error) {
				return { valid: false, error: result.error };
			}
		} catch (moderationError) {
			console.error("Error fetching moderation API:", moderationError);
			return { valid: false, error: "Moderation API is down", status: 503 };
		}

		return { valid: true };
	} catch (error) {
		console.error("Error validating image:", error);
		return { valid: false, error: "Failed to process image file.", status: 500 };
	}
}
//#endregion

//#region Generating 'metadata' image type
const uploadsDirectory = path.join(process.cwd(), "uploads", "mii");

const fontCache: Record<string, Font | null> = {
	regular: null,
	medium: null,
	semiBold: null,
	bold: null,
	extraBold: null,
	black: null,
};

// Load fonts only once and cache them
const loadFonts = async (): Promise<Font[]> => {
	const weights = [
		["regular", 400],
		["medium", 500],
		["semiBold", 600],
		["bold", 700],
		["extraBold", 800],
		["black", 900],
	] as const;

	return Promise.all(
		weights.map(async ([weight, value]) => {
			if (!fontCache[weight]) {
				const filePath = path.join(process.cwd(), `public/fonts/lexend-${weight}.ttf`);
				const data = await fs.readFile(filePath);
				fontCache[weight] = {
					name: "Lexend",
					data,
					weight: value,
				};
			}
			return fontCache[weight]!;
		})
	);
};

export async function generateMetadataImage(mii: Mii, author: string): Promise<Buffer> {
	const miiUploadsDirectory = path.join(uploadsDirectory, mii.id.toString());

	// Load assets concurrently
	const [miiImage, qrCodeImage, fonts] = await Promise.all([
		// Read and convert the .webp images to .png (because satori doesn't support it)
		fs.readFile(path.join(miiUploadsDirectory, "mii.webp")).then((buffer) =>
			sharp(buffer)
				.png()
				.toBuffer()
				.then((pngBuffer) => `data:image/png;base64,${pngBuffer.toString("base64")}`)
		),
		fs.readFile(path.join(miiUploadsDirectory, "qr-code.webp")).then((buffer) =>
			sharp(buffer)
				.png()
				.toBuffer()
				.then((pngBuffer) => `data:image/png;base64,${pngBuffer.toString("base64")}`)
		),
		loadFonts(),
	]);

	const jsx: ReactNode = (
		<div tw="w-full h-full bg-amber-50 border-2 border-amber-500 rounded-2xl p-4 flex flex-col">
			<div tw="flex w-full">
				{/* Mii image */}
				<div tw="w-80 rounded-xl flex justify-center mr-2" style={{ backgroundImage: "linear-gradient(to bottom, #fef3c7, #fde68a);" }}>
					<img src={miiImage} width={248} height={248} style={{ filter: "drop-shadow(0 10px 8px #00000024) drop-shadow(0 4px 3px #00000024)" }} />
				</div>

				{/* QR code */}
				<div tw="w-60 bg-amber-200 rounded-xl flex justify-center items-center">
					<img src={qrCodeImage} width={190} height={190} tw="border-2 border-amber-300 rounded-lg" />
				</div>
			</div>

			<div tw="flex flex-col w-full h-30 relative">
				{/* Mii name */}
				<span tw="text-4xl font-extrabold text-amber-700 mt-2" style={{ display: "block", lineClamp: 1, wordBreak: "break-word" }}>
					{mii.name}
				</span>
				{/* Tags */}
				<div id="tags" tw="flex flex-wrap mt-1 w-full">
					{mii.tags.map((tag) => (
						<span key={tag} tw="mr-1 px-2 py-1 bg-orange-300 rounded-full text-sm">
							{tag}
						</span>
					))}
				</div>

				{/* Author */}
				<div tw="flex text-sm mt-2">
					By: <span tw="ml-1.5 font-semibold">@{author}</span>
				</div>

				{/* Watermark */}
				<div tw="absolute bottom-0 right-0 flex items-center">
					<img src={`${process.env.NEXT_PUBLIC_BASE_URL}/logo.svg`} height={34} />
					{/* I tried using text-orange-400 but it wasn't correct..? */}
					<span tw="ml-2 font-black text-xl" style={{ color: "#FF8904" }}>
						TomodachiShare
					</span>
				</div>
			</div>
		</div>
	);

	const svg = await satori(jsx, {
		width: 600,
		height: 400,
		fonts,
	});

	// Convert .svg to .png
	const buffer = await sharp(Buffer.from(svg)).png().toBuffer();

	// Store the file
	// I tried using .webp here but the quality looked awful
	// but it actually might be well-liked due to the hatred of .webp
	const fileLocation = path.join(miiUploadsDirectory, "metadata.png");
	await fs.writeFile(fileLocation, buffer);

	return buffer;
}
//#endregion
