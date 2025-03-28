import { getServerSession } from "next-auth";

import { authOptions } from "../api/auth/[...nextauth]/route";
import LoginButtons from "../components/login-buttons";
import { redirect, RedirectType } from "next/navigation";

export default async function LoginPage() {
	const session = await getServerSession(authOptions);

	// If the user is already logged in, redirect
	if (session) {
		redirect("/");
	}

	return (
		<div className="flex flex-col items-center">
			<h1 className="text-3xl font-medium">Welcome to TomodachiShare!</h1>
			<h2 className="text-lg">Choose your login method</h2>

			<LoginButtons />
		</div>
	);
}
