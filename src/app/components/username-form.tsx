"use client";

import { FormEvent, useState } from "react";
import { redirect } from "next/navigation";

export default function UsernameForm() {
	const [username, setUsername] = useState("");
	const [error, setError] = useState(null);

	const handleSubmit = async (event: FormEvent) => {
		event.preventDefault();

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
		<form onSubmit={handleSubmit} className="flex flex-col items-center">
			<input
				type="text"
				placeholder="Type your username..."
				value={username}
				onChange={(e) => setUsername(e.target.value)}
				required
				className="pill input w-96 mt-8 mb-2"
			/>

			<button type="submit" className="pill button w-min">
				Submit
			</button>
			{error && <p className="text-red-400 font-semibold mt-4">Error: {error}</p>}
		</form>
	);
}
