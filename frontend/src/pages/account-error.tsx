const ERRORS: Record<string, { title: string; messages: string[] }> = {
	OAuthAccountNotLinked: {
		title: "Account already exists",
		messages: [
			"An account with this email already exists, but it was created using a different login method.",
			"Please sign in with the provider you originally used (Google, GitHub, or Discord).",
		],
	},
	Configuration: {
		title: "Server error",
		messages: ["There is a problem with the server configuration. Please e-mail hello@trafficlunar.net or message @trafficlunar on Discord"],
	},
};

const FALLBACK = {
	title: "Sign in failed",
	messages: ["Something went wrong while signing in. Please try again."],
};

export default function AccountErrorPage() {
	const code = new URLSearchParams(window.location.search).get("error") ?? "";
	const { title, messages } = ERRORS[code] ?? FALLBACK;

	return (
		<div className="grow flex items-center justify-center">
			<div className="bg-amber-50 border-2 border-amber-500 rounded-2xl shadow-lg p-8 max-w-lg w-full text-center flex flex-col gap-2">
				<h2 className="text-3xl font-black">{title}</h2>
				{messages.map((message) => (
					<p key={message}>{message}</p>
				))}
				<a href="/" className="mt-4 mx-auto px-4 py-2 rounded-lg bg-amber-500 text-white font-bold hover:bg-amber-600 transition-colors">
					Back to home
				</a>
			</div>
		</div>
	);
}
