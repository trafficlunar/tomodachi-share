"use client";

import Image from "next/image";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Icon } from "@iconify/react";

interface Props {
	miiId: number;
}

export default function ShareMiiButton({ miiId }: Props) {
	const [isOpen, setIsOpen] = useState(false);
	const [isVisible, setIsVisible] = useState(false);

	const [hasCopiedUrl, setHasCopiedUrl] = useState(false);
	const [hasCopiedImage, setHasCopiedImage] = useState(false);

	const url = `${process.env.NEXT_PUBLIC_BASE_URL}/mii/${miiId}`;

	const handleCopyUrl = async () => {
		await navigator.clipboard.writeText(url);

		setHasCopiedUrl(true);

		// Reset to trigger exit animation
		setTimeout(() => {
			setHasCopiedUrl(false);
		}, 750);
	};

	const handleCopyImage = async () => {
		const response = await fetch(`/mii/${miiId}/image?type=metadata`);
		const blob = await response.blob();

		await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);

		setHasCopiedImage(true);

		// Reset to trigger exit animation
		setTimeout(() => {
			setHasCopiedImage(false);
		}, 750);
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
			<button onClick={() => setIsOpen(true)} aria-label="Share" className="cursor-pointer">
				<Icon icon="material-symbols:share" />
				<span>Share</span>
			</button>

			{isOpen &&
				createPortal(
					<div className="fixed inset-0 h-[calc(100%-var(--header-height))] top-(--header-height) flex items-center justify-center z-40">
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
								<h2 className="text-xl font-bold">Share Mii</h2>
								<button onClick={close} aria-label="Close" className="text-red-400 hover:text-red-500 text-2xl cursor-pointer">
									<Icon icon="material-symbols:close-rounded" />
								</button>
							</div>

							<div className="relative">
								<input type="text" disabled className="pill input w-full text-sm" value={url} />

								{/* Copy button */}
								<button
									className="absolute! top-2.5 right-2.5 cursor-pointer"
									data-tooltip={hasCopiedUrl ? "Copied!" : "Copy URL"}
									onClick={handleCopyUrl}
								>
									<div className="relative text-xl">
										{/* Copy icon */}
										<Icon
											icon="solar:copy-bold"
											className={`text-zinc-400 transition-all duration-300 ${
												hasCopiedUrl ? "opacity-0 scale-75 rotate-12" : "opacity-100 scale-100 rotate-0"
											}`}
										/>

										{/* Check icon */}
										<Icon
											icon="heroicons-solid:check"
											className={`absolute inset-0 text-green-600 transition-all duration-300 ${
												hasCopiedUrl ? "opacity-100 scale-100 rotate-0" : "opacity-0 scale-75 -rotate-12"
											}`}
										/>
									</div>
								</button>
							</div>

							{/* Separator */}
							<div className="flex items-center gap-4 text-zinc-500 text-sm font-medium my-4">
								<hr className="grow border-zinc-300" />
								<span>or</span>
								<hr className="grow border-zinc-300" />
							</div>

							<div className="flex justify-center items-center p-4 w-full bg-orange-100 border border-orange-400 rounded-lg">
								<Image
									src={`/mii/${miiId}/image?type=metadata`}
									alt="mii 'metadata' image"
									width={248}
									height={248}
									unoptimized
									className="drop-shadow-md"
								/>
							</div>

							<div className="flex justify-end gap-2 mt-4">
								<div className="flex gap-2 w-full">
									{/* Save button */}
									<a
										href={`/mii/${miiId}/image?type=metadata`}
										className="pill button p-0! aspect-square cursor-pointer text-xl"
										aria-label="Save Image"
										data-tooltip="Save Image"
										download={"hello.png"}
									>
										<Icon icon="material-symbols:save-rounded" />
									</a>

									{/* Copy button */}
									<button
										className="pill button p-0! aspect-square cursor-pointer"
										aria-label="Copy Image"
										data-tooltip={hasCopiedImage ? "Copied!" : "Copy Image"}
										onClick={handleCopyImage}
									>
										<div className="relative text-xl">
											{/* Copy icon */}
											<Icon
												icon="solar:copy-bold"
												className={` transition-all duration-300 ${
													hasCopiedImage ? "opacity-0 scale-75 rotate-12" : "opacity-100 scale-100 rotate-0"
												}`}
											/>

											{/* Check icon */}
											<Icon
												icon="heroicons-solid:check"
												className={`absolute inset-0 text-black/60 transition-all duration-300 ${
													hasCopiedImage ? "opacity-100 scale-100 rotate-0" : "opacity-0 scale-75 -rotate-12"
												}`}
											/>
										</div>
									</button>
								</div>

								<button onClick={close} className="pill button">
									Close
								</button>
							</div>
						</div>
					</div>,
					document.body
				)}
		</>
	);
}
