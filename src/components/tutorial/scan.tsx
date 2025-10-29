"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import useEmblaCarousel from "embla-carousel-react";
import { Icon } from "@iconify/react";

import TutorialPage from "./page";

export default function ScanTutorialButton() {
	const [isOpen, setIsOpen] = useState(false);
	const [isVisible, setIsVisible] = useState(false);

	const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
	const [selectedIndex, setSelectedIndex] = useState(0);

	const close = () => {
		setIsVisible(false);
		setTimeout(() => {
			setIsOpen(false);
			setSelectedIndex(0);
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
		emblaApi.on("select", () => setSelectedIndex(emblaApi.selectedScrollSnap()));
	}, [emblaApi]);

	return (
		<>
			<button aria-label="Tutorial" type="button" onClick={() => setIsOpen(true)} className="text-3xl cursor-pointer">
				<Icon icon="fa:question-circle" />
				<span>Tutorial</span>
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
										<TutorialPage text="1. Enter the town hall" imageSrc="/tutorial/step1.png" />
										<TutorialPage text="2. Go into 'QR Code'" imageSrc="/tutorial/adding-mii/step2.png" />
										<TutorialPage text="3. Press 'Scan QR Code'" imageSrc="/tutorial/adding-mii/step3.png" />
										<TutorialPage text="4. Click on the QR code below the Mii's image" imageSrc="/tutorial/adding-mii/step4.png" />
										<TutorialPage text="5. Scan with your 3DS" imageSrc="/tutorial/adding-mii/step5.png" />
										<TutorialPage carouselIndex={selectedIndex} finishIndex={5} />
									</div>
								</div>

								<div className="flex justify-between items-center mt-2 px-6 pb-6">
									<button
										onClick={() => emblaApi?.scrollPrev()}
										aria-label="Scroll Carousel Left"
										className="pill button p-1! aspect-square text-2xl"
									>
										<Icon icon="tabler:chevron-left" />
									</button>

									<span className="text-sm">Adding Mii to Island</span>

									<button
										onClick={() => emblaApi?.scrollNext()}
										aria-label="Scroll Carousel Right"
										className="pill button p-1! aspect-square text-2xl"
									>
										<Icon icon="tabler:chevron-right" />
									</button>
								</div>
							</div>
						</div>
					</div>,
					document.body
				)}
		</>
	);
}
