import { Icon } from "@iconify/react";
import { Link } from "react-router";

export default function Footer() {
	return (
		<footer className="mt-auto">
			<div className="max-w-4xl mx-auto px-4 py-4">
				{/* Main disclaimer */}
				<div className="text-center mb-2">
					<p className="text-sm text-zinc-600 font-medium dark:text-slate-400">TomodachiShare is not affiliated with Nintendo</p>
				</div>

				{/* Links section */}
				<div className="flex flex-wrap justify-center items-center gap-x-4 text-sm max-sm:gap-x-12">
					<Link to="/terms-of-service" className="text-zinc-500 hover:text-zinc-700 transition-colors duration-200 hover:underline dark:text-slate-400 dark:hover:text-slate-300">
						Terms of Service
					</Link>

					<span className="text-zinc-400 hidden sm:inline dark:text-slate-600" aria-hidden="true">
						•
					</span>

					<Link to="/privacy" className="text-zinc-500 hover:text-zinc-700 transition-colors duration-200 hover:underline dark:text-slate-400 dark:hover:text-slate-300">
						Privacy Policy
					</Link>

					<span className="text-zinc-400 hidden sm:inline" aria-hidden="true">
						•
					</span>

					<Link
						to="https://discord.gg/48cXBFKvWQ"
						target="_blank"
						className="text-[#5865F2] hover:text-[#454FBF] transition-colors duration-200 hover:underline inline-flex items-end gap-1"
					>
						<Icon icon="ic:baseline-discord" className="text-lg" />
						Discord
					</Link>

					<span className="text-zinc-400 hidden sm:inline dark:text-slate-600" aria-hidden="true">
						•
					</span>

					<Link
						to="https://trafficlunar.net"
						target="_blank"
						className="text-zinc-500 hover:text-zinc-700 transition-colors duration-200 hover:underline group dark:text-slate-400 dark:hover:text-slate-300"
					>
						Made by <span className="text-orange-400 group-hover:text-orange-500 font-medium transition-colors duration-200 dark:text-orange-500 dark:group-hover:text-orange-400">trafficlunar</span>
					</Link>
				</div>

				{/* Copyright */}
				<div className="text-center mt-4 mb-4">
					<p className="text-xs text-zinc-400 dark:text-slate-500">© {new Date().getFullYear()} TomodachiShare. All rights reserved.</p>
				</div>
			</div>
		</footer>
	);
}
