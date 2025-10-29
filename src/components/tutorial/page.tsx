"use client";

import Image from "next/image";
import { Icon } from "@iconify/react";
import { useEffect } from "react";

import confetti from "canvas-confetti";

interface Props {
	text?: string;
	imageSrc?: string;
	carouselIndex?: number;
	finishIndex?: number;
}

export default function TutorialPage({ text, imageSrc, carouselIndex, finishIndex }: Props) {
	useEffect(() => {
		if (carouselIndex !== finishIndex || !carouselIndex || !finishIndex) return;

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
	}, [carouselIndex, finishIndex]);

	return (
		<div className="shrink-0 flex flex-col w-full px-6">
			{!finishIndex ? (
				<>
					<p className="text-sm text-zinc-500 mb-2 text-center">{text}</p>

					<Image
						src={imageSrc ?? "/missing.svg"}
						alt="step image"
						width={396}
						height={320}
						className="rounded-lg w-full h-full object-contain bg-black flex-1"
					/>
				</>
			) : (
				<div className="h-full flex flex-col justify-center items-center">
					<Icon icon="fxemoji:partypopper" className="text-9xl" />
					<h1 className="font-medium text-xl mt-6 animate-bounce">Yatta! You did it!</h1>
				</div>
			)}
		</div>
	);
}
