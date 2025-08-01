"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import useEmblaCarousel from "embla-carousel-react";
import { Icon } from "@iconify/react";

import TutorialPage from "./page";
import StartingPage from "./starting-page";

export default function SubmitTutorialButton() {
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

	const isStartingPage = selectedIndex === 0 || selectedIndex === 9;
	const inTutorialAllowCopying = selectedIndex && selectedIndex >= 1 && selectedIndex <= 9;

	return (
		<>
			<button type="button" onClick={() => setIsOpen(true)} className="text-sm text-orange-400 cursor-pointer underline-offset-2 hover:underline">
				How to?
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
							className={`z-50 bg-orange-50 border-2 border-amber-500 rounded-2xl shadow-lg w-full max-w-md h-[30rem] transition-discrete duration-300 flex flex-col ${
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
										<StartingPage emblaApi={emblaApi} />

										{/* Allow Copying */}
										<TutorialPage text="1. Enter the town hall" imageSrc="/tutorial/step1.png" />
										<TutorialPage text="2. Go into 'Mii List'" imageSrc="/tutorial/allow-copying/step2.png" />
										<TutorialPage text="3. Select and edit the Mii you wish to submit" imageSrc="/tutorial/allow-copying/step3.png" />
										<TutorialPage text="4. Click 'Other Settings' in the information screen" imageSrc="/tutorial/allow-copying/step4.png" />
										<TutorialPage text="5. Click on 'Don't Allow' under the 'Copying' text" imageSrc="/tutorial/allow-copying/step5.png" />
										<TutorialPage text="6. Press 'Allow'" imageSrc="/tutorial/allow-copying/step6.png" />
										<TutorialPage text="7. Confirm the edits to the Mii" imageSrc="/tutorial/allow-copying/step7.png" />
										<TutorialPage carouselIndex={selectedIndex} finishIndex={8} />

										<StartingPage emblaApi={emblaApi} />

										{/* Create QR Code */}
										<TutorialPage text="1. Enter the town hall" imageSrc="/tutorial/step1.png" />
										<TutorialPage text="2. Go into 'QR Code'" imageSrc="/tutorial/create-qr-code/step2.png" />
										<TutorialPage text="3. Press 'Create QR Code'" imageSrc="/tutorial/create-qr-code/step3.png" />
										<TutorialPage text="4. Select and press 'OK' on the Mii you wish to submit" imageSrc="/tutorial/create-qr-code/step4.png" />
										<TutorialPage
											text="5. Pick any option; it doesn't matter since the QR code regenerates upon submission."
											imageSrc="/tutorial/create-qr-code/step5.png"
										/>
										<TutorialPage
											text="6. Exit the tutorial; Upload the QR code (scan with camera or upload file through SD card)."
											imageSrc="/tutorial/create-qr-code/step6.png"
										/>
										<TutorialPage carouselIndex={selectedIndex} finishIndex={16} />
									</div>
								</div>

								<div className={`flex justify-between items-center mt-2 px-6 pb-6 transition-opacity duration-300 ${isStartingPage && "opacity-0"}`}>
									<button
										onClick={() => emblaApi?.scrollPrev()}
										disabled={isStartingPage}
										className={`pill button !p-1 aspect-square text-2xl ${isStartingPage && "!cursor-auto"}`}
										aria-label="Scroll Carousel Left"
									>
										<Icon icon="tabler:chevron-left" />
									</button>

									<span className="text-sm">{inTutorialAllowCopying ? "Allow Copying" : "Create QR Code"}</span>

									<button
										onClick={() => emblaApi?.scrollNext()}
										disabled={isStartingPage}
										className={`pill button !p-1 aspect-square text-2xl ${isStartingPage && "!cursor-auto"}`}
										aria-label="Scroll Carousel Right"
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
