import { Icon } from "@iconify/react";
import { useStore } from "@nanostores/react";
import { Link, Navigate, useSearchParams } from "react-router";
import { session } from "../session";

const API_URL = import.meta.env.VITE_API_URL;

const ERRORS: Record<string, string> = {
	OAuthAccountNotLinked:
		"An account with this email already exists, but it was created with a different login method. Please sign in with the provider you originally used.",
	AccessDenied: "You don't have permission to sign in with this account.",
	Configuration: "There is a problem with the server configuration. Please e-mail hello@trafficlunar.net or message @trafficlunar on Discord",
};

export default function LoginPage() {
	const $session = useStore(session);
	const [searchParams] = useSearchParams();

	if ($session === undefined) return <div className="p-6 text-center">Loading...</div>;
	if ($session) return <Navigate to="/" replace />;

	const code = searchParams.get("error");
	const errorMessage = code ? (ERRORS[code] ?? "Something went wrong while signing in. Please try again. Message trafficlunar if this continues") : null;

	return (
		<div className="grow flex items-center justify-center">
			<div className="bg-amber-50 border-2 border-amber-500 rounded-2xl shadow-lg px-10 py-12 max-w-md text-center">
				<h1 className="text-3xl font-bold mb-4">Welcome to TomodachiShare!</h1>

				{errorMessage && <p className="mb-6 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">Error: {errorMessage}</p>}

				<div className="flex items-center gap-4 text-zinc-500 text-sm font-medium mb-8">
					<hr className="grow border-zinc-300" />
					<span>Choose your login method</span>
					<hr className="grow border-zinc-300" />
				</div>

				<div className="flex flex-col items-center gap-2">
					<Link
						to={`${API_URL}/api/auth/signin/discord`}
						aria-label="Login with Discord"
						className="pill button gap-2 px-3! bg-indigo-400! border-indigo-500! hover:bg-indigo-500!"
					>
						<Icon icon="ic:baseline-discord" fontSize={32} />
						Login with Discord
					</Link>
					<Link
						to={`${API_URL}/api/auth/signin/github`}
						aria-label="Login with GitHub"
						className="pill button gap-2 px-3! bg-zinc-700! border-zinc-800! hover:bg-zinc-800! text-white"
					>
						<Icon icon="mdi:github" fontSize={32} />
						Login with GitHub
					</Link>
					<Link
						to={`${API_URL}/api/auth/signin/google`}
						aria-label="Login with Google"
						className="pill button gap-2 px-3! bg-white! border-gray-300! hover:bg-gray-100! text-black! flex items-center"
					>
						<Icon icon="material-icon-theme:google" fontSize={32} />
						Login with Google
					</Link>
				</div>

				<p className="mt-8 text-xs text-zinc-400">
					By signing up, you agree to the{" "}
					<Link to="/terms-of-service" className="underline hover:text-zinc-600">
						Terms of Service
					</Link>{" "}
					and{" "}
					<Link to="/privacy" className="underline hover:text-zinc-600">
						Privacy Policy
					</Link>
					.
				</p>
			</div>
		</div>
	);
}
