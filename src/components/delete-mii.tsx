"use client";

import Image from "next/image";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Icon } from "@iconify/react";

import LikeButton from "./like-button";
import SubmitButton from "./submit-button";

interface Props {
	miiId: number;
	miiName: string;
	likes: number;
}

export default function DeleteMiiButton({ miiId, miiName, likes }: Props) {
	const [isOpen, setIsOpen] = useState(false);
	const [isVisible, setIsVisible] = useState(false);

	const [error, setError] = useState<string | undefined>(undefined);

	const handleSubmit = async () => {
		const response = await fetch(`/api/mii/${miiId}/delete`, { method: "DELETE" });
		if (!response.ok) {
			const { error } = await response.json();
			setError(error);
			return;
		}

		close();
		window.location.reload(); // I would use router.refresh() here but the Mii list doesn't update
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
			<button onClick={() => setIsOpen(true)} className="cursor-pointer">
				<Icon icon="mdi:trash" />
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
								<h2 className="text-xl font-bold">Delete Mii</h2>
								<button onClick={close} className="text-red-400 hover:text-red-500 text-2xl cursor-pointer">
									<Icon icon="material-symbols:close-rounded" />
								</button>
							</div>

							<p className="text-sm text-zinc-500">Are you sure? This will delete your Mii permanently. This action cannot be undone.</p>

							<div className="bg-orange-100 rounded-xl border-2 border-orange-400 mt-4 flex">
								<Image src={`/mii/${miiId}/mii.webp`} alt="mii image" width={128} height={128} />
								<div className="p-4">
									<p className="text-xl font-bold line-clamp-1" title={miiName}>
										{miiName}
									</p>
									<LikeButton likes={likes} isLiked={true} disabled />
								</div>
							</div>

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
