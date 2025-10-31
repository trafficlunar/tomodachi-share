import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";

import fs from "fs/promises";
import path from "path";
import { z } from "zod";

import { idSchema } from "@/lib/schemas";
import { RateLimit } from "@/lib/rate-limit";
import { generateMetadataImage } from "@/lib/images";
import { prisma } from "@/lib/prisma";

const searchParamsSchema = z.object({
	type: z
		.enum(["mii", "qr-code", "image0", "image1", "image2", "metadata"], {
			message: "Image type must be either 'mii', 'qr-code', 'image[number from 0 to 2]' or 'metadata'",
		})
		.default("mii"),
});

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	const rateLimit = new RateLimit(request, 200, "/mii/image");
	const check = await rateLimit.handle();
	if (check) return check;

	const { id: slugId } = await params;
	const parsed = idSchema.safeParse(slugId);
	if (!parsed.success) return rateLimit.sendResponse({ error: parsed.error.issues[0].message }, 400);
	const miiId = parsed.data;

	const searchParamsParsed = searchParamsSchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
	if (!searchParamsParsed.success) return rateLimit.sendResponse({ error: searchParamsParsed.error.issues[0].message }, 400);
	const { type: imageType } = searchParamsParsed.data;

	const fileExtension = imageType === "metadata" ? ".png" : ".webp";
	const filePath = path.join(process.cwd(), "uploads", "mii", miiId.toString(), `${imageType}${fileExtension}`);

	let buffer: Buffer | undefined;
	// Only find Mii if image type is 'metadata'
	let mii: Prisma.MiiGetPayload<{
		include: {
			user: {
				select: {
					name: true;
				};
			};
		};
	}> | null = null;

	if (imageType === "metadata") {
		mii = await prisma.mii.findUnique({
			where: {
				id: miiId,
			},
			include: {
				user: {
					select: {
						name: true,
					},
				},
			},
		});

		if (!mii) {
			return rateLimit.sendResponse({ error: "Mii not found" }, 404);
		}
	}

	try {
		// Try to read file
		buffer = await fs.readFile(filePath);
	} catch {
		// If the readFile() fails, that probably means it doesn't exist
		if (imageType === "metadata" && mii) {
			// Metadata images were added after 1274 Miis were submitted, so we generate it on-the-fly
			console.log(`Metadata image not found for mii ID ${miiId}, generating metadata image...`);
			const { buffer: metadataBuffer, error, status } = await generateMetadataImage(mii, mii.user.name!);

			if (error) {
				return rateLimit.sendResponse({ error }, status);
			}

			buffer = metadataBuffer;
		} else {
			return rateLimit.sendResponse({ error: "Image not found" }, 404);
		}
	}

	if (!buffer) return rateLimit.sendResponse({ error: "Image not found" }, 404);

	// Set the file name for the metadata image in the response for SEO
	if (mii && imageType === "metadata") {
		const slugify = (str: string) =>
			str
				.toLowerCase()
				.replace(/[^a-z0-9]+/g, "-") // replace non-alphanumeric with hyphens
				.replace(/^-+|-+$/g, "");

		const name = slugify(mii.name);
		const tags = mii.tags.map(slugify).join("-");

		const filename = `${name}-mii-${tags}.png`;

		return rateLimit.sendResponse(buffer, 200, {
			"Content-Type": "image/png",
			"Content-Disposition": `inline; filename="${filename}"`,
			"Cache-Control": "public, max-age=31536000",
		});
	}

	return rateLimit.sendResponse(buffer, 200, {
		"Content-Type": "image/webp",
		"X-Robots-Tag": "noindex, noimageindex, nofollow",
		"Cache-Control": "no-store",
	});
}
