"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Icon } from "@iconify/react";
import confetti from "canvas-confetti";
import ReturnToIsland from "../admin/return-to-island";

interface Slide {
	// step is never used, undefined is assumed as a step
	type?: "start" | "step" | "finish";
	text?: string;
	imageSrc?: string;
}

interface Tutorial {
	title: string;
	thumbnail?: string;
	hint?: string;
	steps: Slide[];
}

interface Props {
	tutorials: Tutorial[];
	isOpen: boolean;
	setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function Tutorial({ tutorials, isOpen, setIsOpen }: Props) {
	const [isVisible, setIsVisible] = useState(false);

	const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
	const [selectedIndex, setSelectedIndex] = useState(0);

	// Build index map
	const slides: Array<Slide & { tutorialTitle: string }> = [];
	const startSlides: Record<string, number> = {};

	tutorials.forEach((tutorial) => {
		tutorial.steps.forEach((slide) => {
			if (slide.type === "start") {
				startSlides[tutorial.title] = slides.length;
			}
			slides.push({ ...slide, tutorialTitle: tutorial.title });
		});
	});

	const currentSlide = slides[selectedIndex];
	const isStartingPage = currentSlide?.type === "start";

	useEffect(() => {
		if (currentSlide.type !== "finish") return;

		const defaults = { startVelocity: 30, spread: 360, ticks: 120, zIndex: 50 };
		const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

		setTimeout(() => {
			confetti({
				...defaults,
				particleCount: 500,
				origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
			});
			confetti({
				...defaults,
				particleCount: 500,
				origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
			});
		}, 300);
	}, [currentSlide]);

	const close = () => {
		setIsVisible(false);
		setTimeout(() => {
			setIsOpen(false);
			setSelectedIndex(0);
		}, 300);
	};

	const goToTutorial = (tutorialTitle: string) => {
		if (!emblaApi) return;
		const index = startSlides[tutorialTitle];

		// Jump to next starting slide then transition to actual tutorial
		emblaApi.scrollTo(index, true);
		emblaApi.scrollTo(index + 1);
	};

	useEffect(() => {
		if (isOpen) {
			// slight delay to trigger animation
			setTimeout(() => setIsVisible(true), 10);
		}
	}, [isOpen]);

	useEffect(() => {
		if (!emblaApi) return;
		emblaApi.on("select", () => setSelectedIndex(emblaApi.selectedScrollSnap()));
	}, [emblaApi]);

	return (
		<div className="fixed inset-0 h-[calc(100%-var(--header-height))] top-(--header-height) flex items-center justify-center z-40">
			<div
				onClick={close}
				className={`z-40 absolute inset-0 backdrop-brightness-75 backdrop-blur-xs transition-opacity duration-300 ${isVisible ? "opacity-100" : "opacity-0"}`}
			/>

			<div
				className={`z-50 bg-orange-50 border-2 border-amber-500 rounded-2xl shadow-lg w-full max-w-md h-120 transition-discrete duration-300 flex flex-col ${
					isVisible ? "scale-100 opacity-100" : "scale-75 opacity-0"
				}`}
			>
				<div className="flex justify-between items-center mb-2 p-6 pb-0">
					<h2 className="text-xl font-bold">Tutorial</h2>
					<button onClick={close} aria-label="Close" className="text-red-400 hover:text-red-500 text-2xl cursor-pointer">
						<Icon icon="material-symbols:close-rounded" />
					</button>
				</div>

				<div className="flex flex-col min-h-0 h-full">
					<div className="overflow-hidden h-full" ref={emblaRef}>
						<div className="flex h-full">
							{slides.map((slide, index) => (
								<div key={index} className={`shrink-0 flex flex-col w-full px-6 ${slide.type === "start" && "py-6"}`}>
									{slide.type === "start" ? (
										<>
											{/* Separator */}
											<div className="flex items-center gap-4 text-zinc-500 text-sm font-medium mb-2">
												<hr className="grow border-zinc-300" />
												<span>Pick a tutorial</span>
												<hr className="grow border-zinc-300" />
											</div>

											<div className="grid grid-cols-2 gap-4 h-full">
												{tutorials.map((tutorial, tutorialIndex) => (
													<button
														key={tutorialIndex}
														onClick={() => goToTutorial(tutorial.title)}
														aria-label={tutorial.title + " tutorial"}
														className="flex flex-col justify-center items-center bg-zinc-50 rounded-xl p-4 shadow-md border-2 border-zinc-300 cursor-pointer text-center text-sm transition hover:scale-[1.03] hover:bg-cyan-100 hover:border-cyan-600"
													>
														<Image
															src={tutorial.thumbnail!}
															alt="tutorial thumbnail"
															width={128}
															height={128}
															className="rounded-lg border-2 border-zinc-300"
														/>
														<p className="mt-2">{tutorial.title}</p>
														{/* Set opacity to 0 to keep height the same with other tutorials */}
														<p className={`text-[0.65rem] text-zinc-400 ${!tutorial.hint && "opacity-0"}`}>{tutorial.hint || "placeholder"}</p>
													</button>
												))}
											</div>
										</>
									) : slide.type === "finish" ? (
										<div className="h-full flex flex-col justify-center items-center">
											<Icon icon="fxemoji:partypopper" className="text-9xl" />
											<h1 className="font-medium text-xl mt-6 animate-bounce">Yatta! You did it!</h1>
										</div>
									) : (
										<>
											<p className="text-sm text-zinc-500 mb-2 text-center">{slide.text}</p>

											<Image
												src={slide.imageSrc ?? "/missing.svg"}
												alt="step image"
												width={396}
												height={320}
												loading="eager"
												className="rounded-lg w-full h-full object-contain bg-black flex-1"
											/>
										</>
									)}
								</div>
							))}
						</div>
					</div>

					{/* Arrows */}
					<div className={`flex justify-between items-center mt-2 px-6 pb-6 transition-opacity duration-300 ${isStartingPage && "opacity-0"}`}>
						<button
							onClick={() => emblaApi?.scrollPrev()}
							disabled={isStartingPage}
							className={`pill button p-1! aspect-square text-2xl ${isStartingPage && "cursor-auto!"}`}
							aria-label="Scroll Carousel Left"
						>
							<Icon icon="tabler:chevron-left" />
						</button>

						{/* Only show tutorial name on step slides */}
						<span className={`text-sm transition-opacity duration-300 ${(currentSlide.type === "finish" || currentSlide.type === "start") && "opacity-0"}`}>
							{currentSlide?.tutorialTitle}
						</span>

						<button
							onClick={() => emblaApi?.scrollNext()}
							disabled={isStartingPage}
							className={`pill button p-1! aspect-square text-2xl ${isStartingPage && "cursor-auto!"}`}
							aria-label="Scroll Carousel Right"
						>
							<Icon icon="tabler:chevron-right" />
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
