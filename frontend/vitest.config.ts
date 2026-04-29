import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [react(), tailwindcss()],
	test: {
		include: ["src/**/*.test.{ts,tsx}"],
		environment: "jsdom",
	},
});
