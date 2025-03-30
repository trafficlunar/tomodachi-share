import { auth } from "@/lib/auth";

import UsernameForm from "../components/username-form";
import { redirect } from "next/navigation";

export default async function CreateUsernamePage() {
	const session = await auth();

	// If the user is not logged in or already has a username, redirect
	if (!session || session?.user.username) {
		redirect("/");
	}

	return (
		<div>
			<h1 className="text-3xl font-medium text-center">Welcome to TomodachiShare!</h1>
			<h2 className="text-lg text-center">Please create a username</h2>

			<UsernameForm />
		</div>
	);
}
