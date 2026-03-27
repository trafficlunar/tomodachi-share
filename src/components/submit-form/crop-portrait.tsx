"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ReactCrop, { Crop } from "react-image-crop";
import { Icon } from "@iconify/react";

interface Props {
	isOpen: boolean;
	setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
	image: string | undefined;
	setImage: React.Dispatch<React.SetStateAction<string | undefined>>;
}

export default function CropPortrait({ isOpen, setIsOpen, image, setImage }: Props) {
	const [isVisible, setIsVisible] = useState(false);
	const [crop, setCrop] = useState<Crop>();

	const imageRef = useRef<HTMLImageElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);

	const applyCrop = useCallback(() => {
		if (!imageRef.current || !canvasRef.current || !crop) return;

		const image = imageRef.current;
		const canvas = canvasRef.current;

		if (!crop.width || !crop.height || image.naturalWidth === 0 || image.naturalHeight === 0) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const scaleX = image.naturalWidth / image.width;
		const scaleY = image.naturalHeight / image.height;

		canvas.width = crop.width;
		canvas.height = crop.height;

		ctx.drawImage(image, crop.x * scaleX, crop.y * scaleY, crop.width * scaleX, crop.height * scaleY, 0, 0, crop.width, crop.height);

		setImage(canvas.toDataURL());
		close();
	}, [crop, setImage]);

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
		<div className={`fixed inset-0 h-[calc(100%-var(--header-height))] top-(--header-height) flex items-center justify-center z-40 ${!isOpen ? "hidden" : ""}`}>
			<div
				onClick={close}
				className={`z-40 absolute inset-0 backdrop-brightness-75 backdrop-blur-xs transition-opacity duration-300 ${isVisible ? "opacity-100" : "opacity-0"}`}
			/>

			<div
				className={`z-50 bg-orange-50 border-2 border-amber-500 rounded-2xl shadow-lg p-6 w-full max-w-md transition-discrete duration-300 ${
					isVisible ? "scale-100 opacity-100" : "scale-75 opacity-0"
				}`}
			>
				<div className="flex justify-between items-center mb-2">
					<h2 className="text-xl font-bold">Crop Portrait</h2>
					<button type="button" aria-label="Close" onClick={close} className="text-red-400 hover:text-red-500 text-2xl cursor-pointer">
						<Icon icon="material-symbols:close-rounded" />
					</button>
				</div>

				<div className="relative w-full flex justify-center">
					<ReactCrop crop={crop} onChange={(c) => setCrop(c)} className="rounded-2xl border-2 border-amber-500 overflow-hidden max-h-96">
						<img ref={imageRef} src={image} />
					</ReactCrop>
					<canvas ref={canvasRef} className="hidden" />
				</div>

				<div className="mt-4 flex justify-center gap-2">
					<button type="button" onClick={close} className="pill button">
						Cancel
					</button>
					<button type="button" onClick={applyCrop} className="pill button">
						Crop
					</button>
				</div>
			</div>
		</div>
	);
}
