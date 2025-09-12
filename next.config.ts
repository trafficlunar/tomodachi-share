import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	output: "standalone",
	images: {
		localPatterns: [
			{
				pathname: "/mii/*/image",
			},
			{
				pathname: "/profile/*/picture",
			},
		],
		remotePatterns: [
			{
				hostname: "avatars.githubusercontent.com",
			},
			{
				hostname: "cdn.discordapp.com",
			},
			{
				hostname: "studio.mii.nintendo.com",
			},
		],
	},
};

export default nextConfig;
