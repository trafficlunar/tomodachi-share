import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import type { MetadataRoute } from "next";

type SitemapRoute = MetadataRoute.Sitemap[0];

export const revalidate = 43200; // update every 12 hours
export const CHUNK_SIZE = 45000; // stay under 50,000 limit

export async function generateSitemaps() {
	const total = await prisma.mii.count({
		where: {
			in_queue: false,
			quarantined: false,
		},
	});
	const miiChunks = Math.ceil(total / CHUNK_SIZE);

	// id 0 = static routes, ids 1..miiChunks = mii chunks
	return Array.from({ length: miiChunks + 1 }, (_, id) => ({ id }));
}

export default async function sitemap(props: { id: Promise<string> }): Promise<MetadataRoute.Sitemap> {
	const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL!;
	const apiUrl = process.env.NEXT_PUBLIC_BASE_URL!;

	// id 0: static routes only
	if ((await props.id) === "0") {
		const lastModified = new Date();

		return [
			{
				url: baseUrl,
				lastModified,
				changeFrequency: "always",
				priority: 1,
			},
			{
				url: `${baseUrl}/login`,
				lastModified,
				changeFrequency: "monthly",
				priority: 0.6,
			},
			{
				url: `${baseUrl}/privacy`,
				lastModified,
				changeFrequency: "yearly",
				priority: 0.4,
			},
			{
				url: `${baseUrl}/terms-of-service`,
				lastModified,
				changeFrequency: "yearly",
				priority: 0.4,
			},
		];
	}

	// id 1+: paginated mii chunks
	const chunkIndex = Number(await props.id) - 1;

	const miis = await prisma.mii.findMany({
		select: {
			id: true,
			createdAt: true,
		},
		where: {
			in_queue: false,
			quarantined: false,
		},
		orderBy: { id: "asc" },
		skip: chunkIndex * CHUNK_SIZE,
		take: CHUNK_SIZE,
	});

	return miis.map(
		(mii) =>
			({
				url: `${baseUrl}/mii/${mii.id}`,
				lastModified: mii.createdAt,
				changeFrequency: "weekly",
				priority: 0.7,
				images: [`${apiUrl}/mii/${mii.id}/image?type=metadata`],
			}) as SitemapRoute,
	);
}
