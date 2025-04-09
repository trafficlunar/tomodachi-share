"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Icon } from "@iconify/react";

interface Props {
	images: string[];
	className?: string;
}

export default function Carousel({ images, className }: Props) {
	const [emblaRef, emblaApi] = useEmblaCarousel();
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

	useEffect(() => {
		if (!emblaApi) return;
		setScrollSnaps(emblaApi.scrollSnapList());
		emblaApi.on("select", () => setSelectedIndex(emblaApi.selectedScrollSnap()));
	}, [emblaApi]);

	const scrollTo = useCallback((index: number) => emblaApi && emblaApi.scrollTo(index), [emblaApi]);
	const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
	const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

	return (
		<div className="relative w-full h-fit">
			<div className={`overflow-hidden rounded-xl bg-zinc-300 border-2 border-zinc-300 ${className}`} ref={emblaRef}>
				<div className="flex">
					{images.map((src, index) => (
						<div key={index} className="flex-[0_0_100%]">
							<Image src={src} alt="mii image" width={480} height={320} className="w-full h-auto aspect-[3/2] object-contain" />
						</div>
					))}
				</div>
			</div>

			{images.length > 1 && (
				<>
					<button onClick={scrollPrev} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white p-1 rounded-full shadow text-xl cursor-pointer">
						<Icon icon="ic:round-chevron-left" />
					</button>
					<button onClick={scrollNext} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white p-1 rounded-full shadow text-xl cursor-pointer">
						<Icon icon="ic:round-chevron-right" />
					</button>

					<div className="flex justify-center gap-2 absolute left-1/2 -translate-x-1/2 bottom-2">
						{scrollSnaps.map((_, index) => (
							<button
								key={index}
								onClick={() => scrollTo(index)}
								className={`size-1.5 rounded-full ${index === selectedIndex ? "bg-black" : "bg-black/25"}`}
							/>
						))}
					</div>
				</>
			)}
		</div>
	);
}
