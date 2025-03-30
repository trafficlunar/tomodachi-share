import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import LoginButtons from "../components/login-buttons";

export default async function LoginPage() {
	const session = await auth();

	// If the user is already logged in, redirect
	if (session) {
		redirect("/");
	}

	return (
		<div>
			<h1 className="text-3xl font-medium text-center">Welcome to TomodachiShare!</h1>
			<h2 className="text-lg text-center">Choose your login method</h2>

			<LoginButtons />
		</div>
	);
}
