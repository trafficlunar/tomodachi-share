"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Icon } from "@iconify/react";
import { redirect } from "next/navigation";
import SubmitButton from "../submit-button";

export default function DeleteAccount() {
	const [isOpen, setIsOpen] = useState(false);
	const [isVisible, setIsVisible] = useState(false);

	const [error, setError] = useState<string | undefined>(undefined);

	const handleSubmit = async () => {
		const response = await fetch("/api/auth/delete", { method: "DELETE" });
		if (!response.ok) {
			const { error } = await response.json();
			setError(error);
			return;
		}

		redirect("/404");
	};

	const close = () => {
		setIsVisible(false);
		setTimeout(() => {
			setIsOpen(false);
		}, 300);
	};

	useEffect(() => {
		if (isOpen) {
			// slight delay to trigger animation
			setTimeout(() => setIsVisible(true), 10);
		}
	}, [isOpen]);

	return (
		<>
			<button
				name="deletion"
				onClick={() => setIsOpen(true)}
				className="pill button w-fit h-min ml-auto !bg-red-400 !border-red-500 hover:!bg-red-500"
			>
				Delete Account
			</button>

			{isOpen &&
				createPortal(
					<div className="fixed inset-0 h-[calc(100%-var(--header-height))] top-[var(--header-height)] flex items-center justify-center z-40">
						<div
							onClick={close}
							className={`z-40 absolute inset-0 backdrop-brightness-75 backdrop-blur-xs transition-opacity duration-300 ${
								isVisible ? "opacity-100" : "opacity-0"
							}`}
						/>

						<div
							className={`z-50 bg-orange-50 border-2 border-amber-500 rounded-2xl shadow-lg p-6 w-full max-w-md transition-discrete duration-300 flex flex-col ${
								isVisible ? "scale-100 opacity-100" : "scale-75 opacity-0"
							}`}
						>
							<div className="flex justify-between items-center mb-2">
								<h2 className="text-xl font-bold">Delete Account</h2>
								<button onClick={close} aria-label="Close" className="text-red-400 hover:text-red-500 text-2xl cursor-pointer">
									<Icon icon="material-symbols:close-rounded" />
								</button>
							</div>

							<p className="text-sm text-zinc-500">
								Are you sure? This is permanent and will remove all uploaded Miis. This action cannot be undone.
							</p>

							{error && <span className="text-red-400 font-bold mt-2">Error: {error}</span>}

							<div className="flex justify-end gap-2 mt-4">
								<button onClick={close} className="pill button">
									Cancel
								</button>
								<SubmitButton onClick={handleSubmit} text="Delete" className="!bg-red-400 !border-red-500 hover:!bg-red-500" />
							</div>
						</div>
					</div>,
					document.body
				)}
		</>
	);
}
