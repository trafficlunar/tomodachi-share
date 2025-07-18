"use client";

import { useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Icon } from "@iconify/react";

import ImageViewer from "./image-viewer";

interface Props {
	images: string[];
	className?: string;
}

export default function Carousel({ images, className }: Props) {
	const [emblaRef, emblaApi] = useEmblaCarousel();
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
	const [isFocused, setIsFocused] = useState(false);

	useEffect(() => {
		if (!emblaApi) return;
		setScrollSnaps(emblaApi.scrollSnapList());
		emblaApi.on("select", () => setSelectedIndex(emblaApi.selectedScrollSnap()));
	}, [images, emblaApi]);

	// Handle keyboard events
	useEffect(() => {
		if (!isFocused || !emblaApi) return;

		const handleKeyDown = (event: KeyboardEvent) => {
			switch (event.key) {
				case "ArrowLeft":
					emblaApi.scrollPrev();
					break;
				case "ArrowRight":
					emblaApi.scrollNext();
					break;
				default:
					break;
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [isFocused, emblaApi]);

	return (
		<div className="relative w-full h-fit" tabIndex={0} onMouseEnter={() => setIsFocused(true)} onMouseLeave={() => setIsFocused(false)}>
			<div className={`overflow-hidden rounded-xl bg-zinc-300 border-2 border-zinc-300 ${className ?? ""}`} ref={emblaRef}>
				<div className="flex">
					{images.map((src, index) => (
						<div key={index} className="flex-shrink-0 w-full">
							<ImageViewer src={src} alt="mii image" width={480} height={320} className="w-full h-auto aspect-[3/2] object-contain" images={images} />
						</div>
					))}
				</div>
			</div>

			{images.length > 1 && (
				<>
					<button
						type="button"
						aria-label="Scroll Carousel Left"
						onClick={() => emblaApi?.scrollPrev()}
						disabled={!emblaApi?.canScrollPrev()}
						className={`absolute left-2 top-1/2 -translate-y-1/2 bg-white p-1 rounded-full shadow text-xl transition-opacity ${
							emblaApi?.canScrollPrev() ? "opacity-100 cursor-pointer" : "opacity-50"
						}`}
					>
						<Icon icon="ic:round-chevron-left" />
					</button>
					<button
						type="button"
						aria-label="Scroll Carousel Right"
						onClick={() => emblaApi?.scrollNext()}
						disabled={!emblaApi?.canScrollNext()}
						className={`absolute right-2 top-1/2 -translate-y-1/2 bg-white p-1 rounded-full shadow text-xl transition-opacity ${
							emblaApi?.canScrollNext() ? "opacity-100 cursor-pointer" : "opacity-50"
						}`}
					>
						<Icon icon="ic:round-chevron-right" />
					</button>

					<div className="flex justify-center p-2 gap-2 absolute right-0">
						{scrollSnaps.map((_, index) => (
							<button
								key={index}
								type="button"
								aria-label={`Go to ${index} in Carousel`}
								onClick={() => emblaApi?.scrollTo(index)}
								className={`size-1.5 cursor-pointer rounded-full ${index === selectedIndex ? "bg-black" : "bg-black/25"}`}
							/>
						))}
					</div>
				</>
			)}
		</div>
	);
}
