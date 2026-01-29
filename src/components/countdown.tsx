"use client";

import { useEffect, useState } from "react";

export default function Countdown() {
	const [days, setDays] = useState(31);
	const [hours, setHours] = useState(59);
	const [minutes, setMinutes] = useState(59);
	const [seconds, setSeconds] = useState(59);

	const targetDate = new Date("2026-04-16T00:00:00Z").getTime();

	useEffect(() => {
		const interval = setInterval(() => {
			const now = new Date().getTime();
			const distance = targetDate - now;

			if (distance < 0) {
				clearInterval(interval);
				setDays(0);
				setHours(0);
				setMinutes(0);
				setSeconds(0);
				return;
			}

			setDays(Math.floor(distance / (1000 * 60 * 60 * 24)));
			setHours(Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
			setMinutes(Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)));
			setSeconds(Math.floor((distance % (1000 * 60)) / 1000));
		}, 100);

		return () => clearInterval(interval);
	}, []);

	return (
		<div className="flex justify-center">
			<div className="bg-amber-50 border-2 border-amber-500 rounded-2xl shadow-lg p-4 mb-2 flex justify-center items-center gap-12 w-fit">
				<div className="flex flex-col">
					<h1 className="text-2xl font-bold">Living the Dream</h1>
					<h2 className="text-right text-sm">releases in:</h2>
				</div>

				<div className="flex gap-4">
					<div className="flex flex-col text-center">
						<span className="text-2xl font-semibold">{days}</span>
						<span className="text-xs">days</span>
					</div>
					<div className="flex flex-col text-center">
						<span className="text-2xl font-semibold">{hours}</span>
						<span className="text-xs">hours</span>
					</div>
					<div className="flex flex-col text-center">
						<span className="text-2xl font-semibold">{minutes}</span>
						<span className="text-xs">minutes</span>
					</div>
					<div className="flex flex-col text-center">
						<span className="text-2xl font-semibold">{seconds}</span>
						<span className="text-xs">seconds</span>
					</div>
				</div>
			</div>
		</div>
	);
}
