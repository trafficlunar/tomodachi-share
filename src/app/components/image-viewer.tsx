"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Icon } from "@iconify/react";

interface Props {
	src: string;
	alt: string;
	width: number;
	height: number;
	className?: string;
}

export default function ImageViewer({ src, alt, width, height, className }: Props) {
	const [isOpen, setIsOpen] = useState(false);
	const [isVisible, setIsVisible] = useState(false);

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
			<Image src={src} alt={alt} width={width} height={height} className={`cursor-pointer ${className}`} onClick={() => setIsOpen(true)} />

			{isOpen &&
				createPortal(
					<div className="fixed inset-0 flex items-center justify-center z-40">
						<div
							onClick={close}
							className={`z-40 absolute inset-0 backdrop-brightness-75 backdrop-blur-xs transition-opacity duration-300 ${
								isVisible ? "opacity-100" : "opacity-0"
							}`}
						/>

						<div
							className={`z-50 bg-orange-50 border-2 border-amber-500 rounded-2xl mx-4 shadow-lg w-full max-w-xl relative transition-discrete duration-300 ${
								isVisible ? "scale-100 opacity-100" : "scale-75 opacity-0"
							}`}
						>
							<div className="absolute right-0 bg-amber-500 rounded-tr-xl rounded-bl-md p-1 flex justify-between items-center">
								<button onClick={close} className="text-2xl cursor-pointer">
									<Icon icon="material-symbols:close-rounded" />
								</button>
							</div>
							<Image src={src} alt={alt} width={576} height={576} className="rounded-2xl w-full" />
						</div>
					</div>,
					document.body
				)}
		</>
	);
}
