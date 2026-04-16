import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	output: "standalone",
	images: {
		unoptimized: true,
	},
	async headers() {
		return [
			{
				// Prevent Cloudflare from serving cached HTML for RSC navigation requests
				source: "/:path*",
				headers: [
					{ key: "Vary", value: "RSC, Next-Router-State-Tree, Next-Router-Prefetch" },
				],
			},
		];
	},
};

export default nextConfig;
