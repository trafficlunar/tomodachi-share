// This file's extension is .tsx because JSX is used for satori to generate images
// Warnings below are disabled since satori is not Next.JS and is turned into an image anyways
/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */

import type { ReactNode } from "react";
import * as Sentry from "@sentry/nextjs";

import fs from "fs/promises";
import path from "path";
import sharp from "sharp";
import { fileTypeFromBuffer } from "file-type";

import satori, { Font } from "satori";

import { Mii } from "@prisma/client";

const MIN_IMAGE_DIMENSIONS = [128, 128];
const MAX_IMAGE_DIMENSIONS = [8000, 8000];
const MAX_IMAGE_SIZE = 8 * 1024 * 1024; // 8 MB
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
			return { valid: false, error: "Image dimensions are invalid. Resolution must be between 128x128 and 8000x8000" };
		}

		return { valid: true };
	} catch (error) {
		console.error("Error validating image:", error);
		Sentry.captureException(error, { extra: { stage: "image-validation" } });
		return { valid: false, error: "Failed to process image file", status: 500 };
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
		}),
	);
};

export async function generateMetadataImage(mii: Mii, author: string): Promise<{ buffer?: Buffer; error?: string; status?: number }> {
	const miiUploadsDirectory = path.join(uploadsDirectory, mii.id.toString());

	// Load assets concurrently
	const [miiImage, qrCodeImage, fonts] = await Promise.all([
		// Read and convert the images to data URI
		fs.readFile(path.join(miiUploadsDirectory, "mii.png")).then((buffer) =>
			sharp(buffer)
				// extend to fix shadow bug on landscape pictures
				.extend({
					left: 16,
					right: 16,
					background: { r: 0, g: 0, b: 0, alpha: 0 },
				})
				.toBuffer()
				.then((pngBuffer) => `data:image/png;base64,${pngBuffer.toString("base64")}`),
		),
		mii.platform === "THREE_DS"
			? fs.readFile(path.join(miiUploadsDirectory, "qr-code.png")).then((buffer) =>
					sharp(buffer)
						.toBuffer()
						.then((pngBuffer) => `data:image/png;base64,${pngBuffer.toString("base64")}`),
				)
			: Promise.resolve(null),
		loadFonts(),
	]);

	const jsx: ReactNode = (
		<div tw="w-full h-full bg-amber-50 border-2 border-amber-500 rounded-2xl p-4 flex flex-col">
			<div tw="flex w-full">
				{/* Mii portrait */}
				<div
					tw={`h-62 rounded-xl flex justify-center items-center mr-2 ${mii.platform === "THREE_DS" ? "w-80" : "w-100"}`}
					style={{
						backgroundImage: "linear-gradient(to bottom, #fef3c7, #fde68a);",
					}}
				>
					<img
						src={miiImage}
						height={248}
						tw="w-full h-full"
						style={{
							objectFit: "contain",
							filter: "drop-shadow(0 10px 8px #00000024) drop-shadow(0 4px 3px #00000024)",
						}}
					/>
				</div>

				{/* QR code */}
				{mii.platform === "THREE_DS" ? (
					<div tw="w-60 bg-amber-200 rounded-xl flex justify-center items-center">
						<img src={qrCodeImage!} width={190} height={190} tw="border-2 border-amber-300 rounded-lg" />
					</div>
				) : (
					<div tw="w-40 bg-amber-200 rounded-xl flex flex-col justify-center items-center p-6">
						<span tw="text-amber-900 font-extrabold text-xl text-center leading-tight">Switch Guide</span>
						<p tw="text-amber-800 text-sm text-center mt-1.5">To fully create the Mii, visit the site for instructions.</p>
						<div tw="mt-auto bg-amber-600 rounded-lg w-full py-2 flex justify-center">
							<span tw="text-white font-semibold">View Steps</span>
						</div>
					</div>
				)}
			</div>

			<div tw="flex flex-col w-full h-30 relative">
				{/* Mii name */}
				<span tw="text-4xl font-extrabold text-amber-700 mt-2" style={{ display: "block", lineClamp: 1, wordBreak: "break-word" }}>
					{mii.name}
				</span>
				{/* Tags */}
				<div id="tags" tw="relative flex mt-1 w-full overflow-hidden">
					<div tw="flex">
						{mii.tags.map((tag) => (
							<span key={tag} tw="mr-1 px-2 py-1 bg-orange-300 rounded-full text-sm shrink-0">
								{tag}
							</span>
						))}
					</div>

					<div tw="absolute inset-0" style={{ position: "absolute", backgroundImage: "linear-gradient(to right, #fffbeb00 70%, #fffbeb);" }}></div>
				</div>

				{/* Author */}
				<div tw="flex mt-2 text-sm w-1/2">
					By{" "}
					<span tw="ml-1.5 font-semibold overflow-hidden" style={{ textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
						{author}
					</span>
				</div>

				{/* Watermark */}
				<div tw="absolute bottom-0 right-0 flex items-center">
					<img src={`${process.env.NEXT_PUBLIC_BASE_URL}/logo.svg`} height={32} />
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
	try {
		const fileLocation = path.join(miiUploadsDirectory, "metadata.png");
		await fs.writeFile(fileLocation, buffer);
	} catch (error) {
		console.error("Error storing 'metadata' image type", error);
		Sentry.captureException(error, { extra: { stage: "metadata-image-storage", miiId: mii.id } });
		return { error: `Failed to store metadata image for ${mii.id}`, status: 500 };
	}

	return { buffer };
}
//#endregion
