"use client";

import { Icon } from "@iconify/react/dist/iconify.js";
import { signIn } from "next-auth/react";

export default function LoginButtons() {
	return (
		<div className="flex flex-col items-center gap-2 mt-8">
			<button onClick={() => signIn("discord")} className="pill button gap-2 !px-3 !bg-indigo-400 !border-indigo-500 hover:!bg-indigo-500">
				<Icon icon="ic:baseline-discord" fontSize={32} />
				Login with Discord
			</button>
			<button onClick={() => signIn("github")} className="pill button gap-2 !px-3 !bg-zinc-700 !border-zinc-800  hover:!bg-zinc-800 text-white">
				<Icon icon="mdi:github" fontSize={32} />
				Login with GitHub
			</button>
		</div>
	);
}
