"use client";

import { Icon } from "@iconify/react/dist/iconify.js";
import { signIn } from "next-auth/react";

export default function LoginButtons() {
	return (
		<div className="flex flex-col items-center gap-2">
			<button
				onClick={() => signIn("discord", { redirectTo: "/" })}
				aria-label="Login with Discord"
				className="pill button gap-2 px-3! bg-indigo-400! border-indigo-500! hover:bg-indigo-500!"
			>
				<Icon icon="ic:baseline-discord" fontSize={32} />
				Login with Discord
			</button>
			<button
				onClick={() => signIn("github", { redirectTo: "/" })}
				aria-label="Login with GitHub"
				className="pill button gap-2 px-3! bg-zinc-700! border-zinc-800!  hover:bg-zinc-800! text-white"
			>
				<Icon icon="mdi:github" fontSize={32} />
				Login with GitHub
			</button>
			<button
				onClick={() => signIn("google", { redirectTo: "/" })}
				aria-label="Login with Google"
				className="pill button gap-2 px-3! bg-white! border-gray-300! hover:bg-gray-100! text-black! flex items-center"
			>
				<Icon icon="material-icon-theme:google" fontSize={32} />
				Login with Google
			</button>
		</div>
	);
}
