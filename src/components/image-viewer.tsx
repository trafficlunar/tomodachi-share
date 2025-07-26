"use client";

import Image from "next/image";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import useEmblaCarousel from "embla-carousel-react";
import { Icon } from "@iconify/react";

interface Props {
	src: string;
	alt: string;
	width: number;
	height: number;
	className?: string;
	images?: string[];
}

export default function ImageViewer({ src, alt, width, height, className, images = [] }: Props) {
	const [isOpen, setIsOpen] = useState(false);
	const [isVisible, setIsVisible] = useState(false);

	const [emblaRef, emblaApi] = useEmblaCarousel();
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

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

	useEffect(() => {
		if (!emblaApi) return;

		// Keep order of images whilst opening at src prop
		const index = images.indexOf(src);
		if (index !== -1) {
			emblaApi.scrollTo(index);
			setSelectedIndex(index);
		}

		setScrollSnaps(emblaApi.scrollSnapList());
		emblaApi.on("select", () => setSelectedIndex(emblaApi.selectedScrollSnap()));
	}, [emblaApi, images, src]);

	// Handle keyboard events
	useEffect(() => {
		if (!isOpen || !emblaApi) return;

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "ArrowLeft") emblaApi.scrollPrev();
			else if (event.key === "ArrowRight") emblaApi.scrollNext();
			else if (event.key === "Escape") close();
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [isOpen, emblaApi]);

	const imagesMap = images.length === 0 ? [src] : images;

	return (
		<>
			{/* not inserting pixelated image-rendering here because i thought it looked a bit weird */}
			<Image src={src} alt={alt} width={width} height={height} onClick={() => setIsOpen(true)} className={`cursor-pointer ${className}`} />

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
							className={`z-50 bg-orange-50 border-2 border-amber-500 rounded-2xl mx-4 shadow-lg aspect-square w-full max-w-xl relative transition-discrete duration-300 ${
								isVisible ? "scale-100 opacity-100" : "scale-75 opacity-0"
							}`}
						>
							<div className="z-50 absolute right-0 bg-amber-500 rounded-tr-xl rounded-bl-md p-1 flex justify-between items-center">
								<button type="button" aria-label="Close" onClick={close} className="text-2xl cursor-pointer">
									<Icon icon="material-symbols:close-rounded" />
								</button>
							</div>

							<div className="overflow-hidden rounded-2xl h-full" ref={emblaRef}>
								<div className="flex h-full items-center">
									{imagesMap.map((image, index) => (
										<div key={index} className="flex-shrink-0 w-full">
											<Image
												src={image}
												alt={alt}
												width={576}
												height={576}
												className="object-contain"
												style={{ imageRendering: image.includes("qr-code") ? "pixelated" : "auto" }}
											/>
										</div>
									))}
								</div>
							</div>
						</div>

						{images.length != 0 && (
							<>
								{/* Carousel buttons */}
								{/* Prev button */}
								<div
									className={`z-50 absolute left-2 top-1/2 -translate-y-1/2 transition-opacity duration-300 ${
										isVisible ? "opacity-100" : "opacity-0"
									}`}
								>
									<button
										type="button"
										aria-label="Scroll Carousel Left"
										onClick={() => emblaApi?.scrollPrev()}
										disabled={!emblaApi?.canScrollPrev()}
										className={`bg-white p-1 rounded-full shadow text-4xl transition-opacity ${
											emblaApi?.canScrollPrev() ? "opacity-100 cursor-pointer" : "opacity-50"
										}`}
									>
										<Icon icon="ic:round-chevron-left" />
									</button>
								</div>
								{/* Next button */}
								<div
									className={`z-50 absolute right-2 top-1/2 -translate-y-1/2 transition-opacity duration-300 ${
										isVisible ? "opacity-100" : "opacity-0"
									}`}
								>
									<button
										type="button"
										aria-label="Scroll Carousel Right"
										onClick={() => emblaApi?.scrollNext()}
										disabled={!emblaApi?.canScrollNext()}
										className={`bg-white p-1 rounded-full shadow text-4xl transition-opacity ${
											emblaApi?.canScrollNext() ? "opacity-100 cursor-pointer" : "opacity-50"
										}`}
									>
										<Icon icon="ic:round-chevron-right" />
									</button>
								</div>

								{/* Carousel snaps */}
								<div
									className={`z-50 flex justify-center gap-3 absolute left-1/2 -translate-x-1/2 bottom-4 transition-opacity duration-300 ${
										isVisible ? "opacity-100" : "opacity-0"
									}`}
								>
									{scrollSnaps.map((_, index) => (
										<button
											key={index}
											aria-label={`Go to ${index} in Carousel`}
											onClick={() => emblaApi?.scrollTo(index)}
											className={`size-2.5 cursor-pointer rounded-full ${index === selectedIndex ? "bg-black" : "bg-black/25"}`}
										/>
									))}
								</div>
							</>
						)}
					</div>,
					document.body
				)}
		</>
	);
}
