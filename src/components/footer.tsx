import Link from "next/link";
import { Icon } from "@iconify/react";

export default function Footer() {
	return (
		<footer className="mt-auto">
			<div className="max-w-4xl mx-auto px-4 py-4">
				{/* Main disclaimer */}
				<div className="text-center mb-2">
					<p className="text-sm text-zinc-600 font-medium">TomodachiShare is not affiliated with Nintendo</p>
				</div>

				{/* Links section */}
				<div className="flex flex-wrap justify-center items-center gap-x-4 text-sm max-sm:gap-x-12">
					<Link href="/terms-of-service" className="text-zinc-500 hover:text-zinc-700 transition-colors duration-200 hover:underline">
						Terms of Service
					</Link>

					<span className="text-zinc-400 hidden sm:inline" aria-hidden="true">
						•
					</span>

					<Link href="/privacy" className="text-zinc-500 hover:text-zinc-700 transition-colors duration-200 hover:underline">
						Privacy Policy
					</Link>

					<span className="text-zinc-400 hidden sm:inline" aria-hidden="true">
						•
					</span>

					<a
						href="https://discord.gg/48cXBFKvWQ"
						target="_blank"
						className="text-[#5865F2] hover:text-[#454FBF] transition-colors duration-200 hover:underline inline-flex items-end gap-1"
					>
						<Icon icon="ic:baseline-discord" className="text-lg" />
						Discord
					</a>

					<span className="text-zinc-400 hidden sm:inline" aria-hidden="true">
						•
					</span>

					<a
						href="https://github.com/trafficlunar/tomodachi-share"
						target="_blank"
						className="text-zinc-500 hover:text-zinc-700 transition-colors duration-200 hover:underline inline-flex items-end gap-1"
					>
						<Icon icon="mdi:github" className="text-lg" />
						Source Code
					</a>

					<span className="text-zinc-400 hidden sm:inline" aria-hidden="true">
						•
					</span>

					<a href="https://trafficlunar.net" target="_blank" className="text-zinc-500 hover:text-zinc-700 transition-colors duration-200 hover:underline group">
						Made by <span className="text-orange-400 group-hover:text-orange-500 font-medium transition-colors duration-200">trafficlunar</span>
					</a>
				</div>

				{/* Copyright */}
				<div className="text-center mt-4 mb-4">
					<p className="text-xs text-zinc-400">© {new Date().getFullYear()} TomodachiShare. All rights reserved.</p>
				</div>
			</div>
		</footer>
	);
}
