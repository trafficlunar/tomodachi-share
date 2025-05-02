import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
	return {
		rules: {
			userAgent: "*",
			allow: "/",
			disallow: ["/create-username", "/edit/*", "/profile/settings", "/random", "/submit", "/report/mii/*", "/report/user/*", "/admin"],
		},
		sitemap: `${process.env.BASE_URL}/sitemap.xml`,
	};
}
