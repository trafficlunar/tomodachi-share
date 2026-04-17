import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	output: "standalone",
	async headers() {
		return [
			{
				source: "/api/:path*",
				headers: [
					{ key: "Access-Control-Allow-Origin", value: process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:4321" },
					{ key: "Access-Control-Allow-Credentials", value: "true" },
					{ key: "Access-Control-Allow-Methods", value: "GET,POST,PATCH,DELETE,OPTIONS" },
				],
			},
		];
	},
};

export default nextConfig;
