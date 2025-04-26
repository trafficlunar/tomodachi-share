import { prisma } from "@/lib/prisma";
import type { MetadataRoute } from "next";

type SitemapRoute = MetadataRoute.Sitemap[0];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const baseUrl = process.env.BASE_URL;
	if (!baseUrl) {
		console.error("BASE_URL environment variable missing");
		return [];
	}

	const miis = await prisma.mii.findMany({
		select: {
			id: true,
			createdAt: true,
		},
	});

	const users = await prisma.user.findMany({
		select: {
			id: true,
			updatedAt: true,
		},
	});

	const dynamicRoutes: MetadataRoute.Sitemap = [
		...miis.map(
			(mii) =>
				({
					url: `${baseUrl}/mii/${mii.id}`,
					lastModified: mii.createdAt,
					changeFrequency: "weekly",
					priority: 0.7,
				} as SitemapRoute)
		),
		...users.map(
			(user) =>
				({
					url: `${baseUrl}/profile/${user.id}`,
					lastModified: user.updatedAt,
					changeFrequency: "weekly",
					priority: 0.7,
				} as SitemapRoute)
		),
	];

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
		...dynamicRoutes,
	];
}
