import { NextRequest, NextResponse } from "next/server";

import fs from "fs/promises";
import path from "path";
import { z } from "zod";

import { idSchema } from "@/lib/schemas";
import { RateLimit } from "@/lib/rate-limit";
import { generateMetadataImage } from "@/lib/images";
import { prisma } from "@/lib/prisma";
import { MiiWithUsername } from "@/types";

const searchParamsSchema = z.object({
	type: z
		.enum(["mii", "qr-code", "image0", "image1", "image2", "metadata"], {
			message: "Image type must be either 'mii', 'qr-code', 'image[number from 0 to 2]' or 'metadata'",
		})
		.default("mii"),
});

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	const rateLimit = new RateLimit(request, 200);
	const check = await rateLimit.handle();
	if (check) return check;

	const { id: slugId } = await params;
	const parsed = idSchema.safeParse(slugId);
	if (!parsed.success) return rateLimit.sendResponse({ error: parsed.error.errors[0].message }, 400);
	const miiId = parsed.data;

	const searchParamsParsed = searchParamsSchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
	if (!searchParamsParsed.success) return rateLimit.sendResponse({ error: searchParamsParsed.error.errors[0].message }, 400);
	const { type: imageType } = searchParamsParsed.data;

	const fileExtension = imageType === "metadata" ? ".png" : ".webp";
	const filePath = path.join(process.cwd(), "uploads", "mii", miiId.toString(), `${imageType}${fileExtension}`);

	let buffer: Buffer | undefined;
	// Only find Mii if image type is 'metadata'
	let mii: MiiWithUsername | null = null;

	if (imageType === "metadata") {
		mii = await prisma.mii.findUnique({
			where: {
				id: miiId,
			},
			include: {
				user: {
					select: {
						username: true,
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
			const { buffer: metadataBuffer, error, status } = await generateMetadataImage(mii, mii.user.username!);

			if (error) {
				return rateLimit.sendResponse({ error }, status);
			}

			buffer = metadataBuffer;
		} else {
			return rateLimit.sendResponse({ error: "Image not found" }, 404);
		}
	}

	// Set the file name for the metadata image in the response for SEO
	if (mii && imageType === "metadata") {
		const slugify = (str: string) =>
			str
				.toLowerCase()
				.replace(/[^a-z0-9]+/g, "-") // replace non-alphanumeric with hyphens
				.replace(/^-+|-+$/g, "");

		const name = slugify(mii.name);
		const tags = mii.tags.map(slugify).join("-");
		const username = slugify(mii.user.username!);

		const filename = `${name}-mii-${tags}-by-${username}.png`;

		return new NextResponse(buffer, {
			headers: {
				"Content-Type": "image/png",
				"Content-Disposition": `inline; filename="${filename}"`,
			},
		});
	}

	return new NextResponse(buffer, {
		headers: {
			"Content-Type": "image/webp",
			"X-Robots-Tag": "noindex, nofollow",
		},
	});
}
