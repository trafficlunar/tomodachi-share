import { Icon } from "@iconify/react";
import { useStore } from "@nanostores/react";
import { useNavigate } from "react-router";
import { session } from "../session";

export default function LoginPage() {
	const navigate = useNavigate();
	const $session = useStore(session);

	if ($session) navigate("/");

	const API_URL = import.meta.env.VITE_API_URL;

	return (
		<div className="grow flex items-center justify-center">
			<div className="bg-amber-50 border-2 border-amber-500 rounded-2xl shadow-lg px-10 py-12 max-w-md text-center">
				<h1 className="text-3xl font-bold mb-4">Welcome to TomodachiShare!</h1>

				<div className="flex items-center gap-4 text-zinc-500 text-sm font-medium mb-8">
					<hr className="grow border-zinc-300" />
					<span>Choose your login method</span>
					<hr className="grow border-zinc-300" />
				</div>

				<div className="flex flex-col items-center gap-2">
					<a
						href={`${API_URL}/api/auth/signin/discord`}
						aria-label="Login with Discord"
						className="pill button gap-2 px-3! bg-indigo-400! border-indigo-500! hover:bg-indigo-500!"
					>
						<Icon icon="ic:baseline-discord" fontSize={32} />
						Login with Discord
					</a>
					<a
						href={`${API_URL}/api/auth/signin/github`}
						aria-label="Login with GitHub"
						className="pill button gap-2 px-3! bg-zinc-700! border-zinc-800! hover:bg-zinc-800! text-white"
					>
						<Icon icon="mdi:github" fontSize={32} />
						Login with GitHub
					</a>
					<a
						href={`${API_URL}/api/auth/signin/google`}
						aria-label="Login with Google"
						className="pill button gap-2 px-3! bg-white! border-gray-300! hover:bg-gray-100! text-black! flex items-center"
					>
						<Icon icon="material-icon-theme:google" fontSize={32} />
						Login with Google
					</a>
				</div>

				<p className="mt-8 text-xs text-zinc-400">
					By signing up, you agree to the{" "}
					<a href="/terms-of-service" className="underline hover:text-zinc-600">
						Terms of Service
					</a>{" "}
					and{" "}
					<a href="/privacy" className="underline hover:text-zinc-600">
						Privacy Policy
					</a>
					.
				</p>
			</div>
		</div>
	);
}
