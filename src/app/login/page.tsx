import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import LoginButtons from "@/components/login-buttons";

export const metadata: Metadata = {
	title: "Login - TomodachiShare",
	description: "Sign in with Discord or GitHub to upload Miis, and like others' creations",
};

export default async function LoginPage() {
	const session = await auth();

	// If the user is already logged in, redirect
	if (session) {
		redirect("/");
	}

	return (
		<div className="flex-grow flex items-center justify-center">
			<div className="bg-amber-50 border-2 border-amber-500 rounded-2xl shadow-lg px-10 py-12 max-w-md text-center">
				<h1 className="text-3xl font-bold mb-4">Welcome to TomodachiShare!</h1>

				<div className="flex items-center gap-4 text-zinc-500 text-sm font-medium mb-8">
					<hr className="flex-grow border-zinc-300" />
					<span>Choose your login method</span>
					<hr className="flex-grow border-zinc-300" />
				</div>

				<LoginButtons />
			</div>
		</div>
	);
}
