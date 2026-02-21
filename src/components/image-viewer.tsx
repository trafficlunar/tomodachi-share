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

	const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, duration: 15 });
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
			emblaApi.scrollTo(index, true);
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
					<div className="fixed inset-0 h-[calc(100%-var(--header-height))] top-(--header-height) flex items-center justify-center z-40">
						<div
							onClick={close}
							className={`absolute inset-0 backdrop-brightness-40 backdrop-contrast-125 backdrop-blur-sm transition-opacity duration-300 ${isVisible ? "opacity-100" : "opacity-0"}`}
						/>

						<button
							type="button"
							aria-label="Close"
							onClick={close}
							className={`pill button p-2! aspect-square text-2xl absolute top-4 right-4 ${isVisible ? "opacity-100" : "opacity-0"}`}
						>
							<Icon icon="material-symbols:close-rounded" />
						</button>

						<div
							className={`overflow-hidden max-w-4xl h-[75vh] max-md:h-[55vh] transition-discrete duration-300 ${isVisible ? "scale-100 opacity-100" : "scale-90 opacity-0"}`}
							ref={emblaRef}
						>
							<div className="flex h-full">
								{imagesMap.map((image, index) => (
									<div key={index} className="flex-[0_0_100%] h-full flex items-center px-4">
										<Image
											src={image}
											alt={alt}
											width={896}
											height={896}
											priority={index === selectedIndex}
											loading={Math.abs(index - selectedIndex) <= 1 ? "eager" : "lazy"}
											className="max-w-full max-h-full object-contain drop-shadow-lg"
											style={{ imageRendering: image.includes("qr-code") ? "pixelated" : "auto" }}
										/>
									</div>
								))}
							</div>
						</div>

						{images.length > 1 && (
							<>
								{/* Carousel counter */}
								<div
									className={`flex justify-center gap-2 bg-orange-300 w-15 font-semibold text-sm py-1 rounded-full border-2 border-orange-400 absolute top-4 left-4 transition-opacity duration-300 ${
										isVisible ? "opacity-100" : "opacity-0"
									}`}
								>
									{selectedIndex + 1} / {images.length}
								</div>

								{/* Carousel buttons */}
								{/* Prev button */}
								<button
									type="button"
									aria-label="Scroll Carousel Left"
									onClick={() => emblaApi?.scrollPrev()}
									className={`absolute left-2 top-1/2 -translate-y-1/2 pill button p-0.5! aspect-square text-4xl transition-opacity duration-300 ${isVisible ? "opacity-100" : "opacity-0"}`}
								>
									<Icon icon="ic:round-chevron-left" />
								</button>
								{/* Next button */}
								<button
									type="button"
									aria-label="Scroll Carousel Right"
									onClick={() => emblaApi?.scrollNext()}
									className={`absolute right-2 top-1/2 -translate-y-1/2 pill button p-0.5! aspect-square text-4xl transition-opacity duration-300 ${isVisible ? "opacity-100" : "opacity-0"}`}
								>
									<Icon icon="ic:round-chevron-right" />
								</button>

								{/* Carousel snaps */}
								<div
									className={`flex justify-center gap-2 bg-orange-300 p-2.5 rounded-full border-2 border-orange-400 absolute left-1/2 -translate-x-1/2 bottom-4 transition-opacity duration-300 ${
										isVisible ? "opacity-100" : "opacity-0"
									}`}
								>
									{scrollSnaps.map((_, index) => (
										<button
											key={index}
											aria-label={`Go to ${index} in Carousel`}
											onClick={() => emblaApi?.scrollTo(index)}
											className={`size-2 cursor-pointer rounded-full transition-all duration-300 ${index === selectedIndex ? "bg-slate-800 w-8" : "bg-slate-800/30"}`}
										/>
									))}
								</div>
							</>
						)}
					</div>,
					document.body,
				)}
		</>
	);
}
