import { prisma } from "@/lib/prisma";
import { CHUNK_SIZE } from "../sitemap";
import { NextResponse } from "next/server";

export const revalidate = 43200; // update every 12 hours

export async function GET() {
	const apiUrl = process.env.NEXT_PUBLIC_BASE_URL!;

	const total = await prisma.mii.count({
		where: { in_queue: false, quarantined: false },
	});
	const miiChunks = Math.ceil(total / CHUNK_SIZE);
	const totalSitemaps = miiChunks + 1; // +1 for the static-routes sitemap

	const sitemapEntries = Array.from({ length: totalSitemaps }, (_, i) => `<sitemap><loc>${apiUrl}/sitemap/${i}.xml</loc></sitemap>`).join("");

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries}
</sitemapindex>`;

	return new NextResponse(xml, {
		headers: { "Content-Type": "application/xml" },
	});
}
