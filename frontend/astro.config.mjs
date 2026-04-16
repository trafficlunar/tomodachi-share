// @ts-check
import { defineConfig, fontProviders } from "astro/config";

import react from "@astrojs/react";

import tailwindcss from "@tailwindcss/vite";

import icon from "astro-icon";

import swup from "@swup/astro";

// https://astro.build/config
export default defineConfig({
	output: "static",
	integrations: [react(), icon(), swup({ theme: false })],

	vite: {
		plugins: [tailwindcss()],
		ssr: {
			noExternal: ["@tomodachi-share/shared"],
		},
	},
	fonts: [
		{
			provider: fontProviders.fontsource(),
			name: "Lexend",
			cssVariable: "--font-lexend",
		},
	],
});
