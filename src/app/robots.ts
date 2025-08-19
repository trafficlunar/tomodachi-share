import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
	return {
		rules: {
			userAgent: "*",
			allow: "/",
			disallow: [
				"/*?*page=",
				"/profile*?*tags=",
				"/create-username",
				"/edit/*",
				"/profile/settings",
				"/random",
				"/submit",
				"/report/mii/*",
				"/report/user/*",
				"/admin",
				"/_next/image",
			],
		},
		sitemap: `${process.env.NEXT_PUBLIC_BASE_URL}/sitemap.xml`,
	};
}
