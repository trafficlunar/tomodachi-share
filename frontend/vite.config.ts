import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
	plugins: [react(), tailwindcss(), nodePolyfills()],
	resolve: {
		alias:
			command === "build"
				? [
						{
							find: "vite-plugin-node-polyfills/shims/buffer",
							replacement: require.resolve("vite-plugin-node-polyfills/shims/buffer"),
						},
					]
				: [],
	},
}));
