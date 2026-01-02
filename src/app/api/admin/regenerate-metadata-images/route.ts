import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateMetadataImage } from "@/lib/images";

export async function PATCH() {
	const session = await auth();
	if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	if (Number(session.user.id) !== Number(process.env.NEXT_PUBLIC_ADMIN_USER_ID)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

	// Start processing in background
	regenerateImages().catch(console.error);

	return NextResponse.json({ success: true });
}

async function regenerateImages() {
	// Get miis in batches to reduce memory usage
	const BATCH_SIZE = 10;
	const totalMiis = await prisma.mii.count();
	let processed = 0;

	for (let skip = 0; skip < totalMiis; skip += BATCH_SIZE) {
		const miis = await prisma.mii.findMany({
			skip,
			take: BATCH_SIZE,
			include: { user: { select: { name: true } } },
		});

		// Process each batch sequentially to avoid overwhelming the server
		for (const mii of miis) {
			try {
				await generateMetadataImage(mii, mii.user.name);
				processed++;
			} catch (error) {
				console.error(`Failed to generate image for mii ${mii.id}:`, error);
			}
		}
	}
}
