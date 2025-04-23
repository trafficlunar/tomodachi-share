"use client";

import { useState } from "react";
import { redirect } from "next/navigation";
import { usernameSchema } from "@/lib/schemas";
import SubmitButton from "./submit-button";

export default function UsernameForm() {
	const [username, setUsername] = useState("");
	const [error, setError] = useState<string | undefined>(undefined);

	const handleSubmit = async () => {
		const parsed = usernameSchema.safeParse(username);
		if (!parsed.success) setError(parsed.error.errors[0].message);

		const response = await fetch("/api/auth/username", {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ username }),
		});

		if (!response.ok) {
			const { error } = await response.json();
			setError(error);
			return;
		}

		redirect("/");
	};

	return (
		<form className="flex flex-col items-center">
			<input
				type="text"
				placeholder="Type your username..."
				value={username}
				onChange={(e) => setUsername(e.target.value)}
				required
				className="pill input w-96 mb-2"
			/>

			<SubmitButton onClick={handleSubmit} />
			{error && <p className="text-red-400 font-semibold mt-4">Error: {error}</p>}
		</form>
	);
}
