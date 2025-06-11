import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
	return {
		rules: {
			userAgent: "*",
			allow: "/",
			disallow: ["/*?*page=", "/create-username", "/edit/*", "/profile/settings", "/random", "/submit", "/report/mii/*", "/report/user/*", "/admin"],
		},
		sitemap: `${process.env.NEXT_PUBLIC_BASE_URL}/sitemap.xml`,
	};
}
