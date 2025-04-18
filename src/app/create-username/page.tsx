import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import UsernameForm from "@/components/username-form";

export default async function CreateUsernamePage() {
	const session = await auth();

	// If the user is not logged in or already has a username, redirect
	if (!session || session?.user.username) {
		redirect("/");
	}

	return (
		<div className="flex-grow flex items-center justify-center">
			<div className="bg-amber-50 border-2 border-amber-500 rounded-2xl shadow-lg px-10 py-12 max-w-md text-center">
				<h1 className="text-3xl font-bold mb-4">Welcome to TomodachiShare!</h1>

				<div className="flex items-center gap-4 text-zinc-500 text-sm font-medium mb-6">
					<hr className="flex-grow border-zinc-300" />
					<span>Please create a username</span>
					<hr className="flex-grow border-zinc-300" />
				</div>

				<UsernameForm />
			</div>
		</div>
	);
}
