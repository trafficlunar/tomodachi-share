"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Icon } from "@iconify/react";
import { MiiMakeup, MiiPlatform } from "@prisma/client";

export default function MakeupSelect() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [, startTransition] = useTransition();

	const [selected, setSelected] = useState<MiiMakeup | null>((searchParams.get("makeup") as MiiMakeup) ?? null);

	const handleClick = (makeup: MiiMakeup) => {
		const filter = selected === makeup ? null : makeup;
		setSelected(filter);

		const params = new URLSearchParams(searchParams);
		params.set("page", "1");

		if (filter) {
			params.set("makeup", filter);
		} else {
			params.delete("makeup");
		}

		startTransition(() => {
			router.push(`?${params.toString()}`, { scroll: false });
		});
	};

	return (
		<div className="flex gap-0.5 w-fit">
			{/* Full Makeup */}
			<button
				onClick={() => handleClick("FULL")}
				aria-label="Filter for Full Makeup"
				data-tooltip-span
				className={`cursor-pointer rounded-xl flex justify-center items-center size-13 text-5xl border-2 transition-all ${
					selected === "FULL" ? "bg-pink-100 border-pink-400 shadow-md" : "bg-white border-gray-300 hover:border-gray-400"
				}`}
			>
				<div className="tooltip bg-pink-400! border-pink-400! before:border-b-pink-400!">Full Makeup</div>
				<Icon icon="mdi:palette" className="text-pink-400" />
			</button>

			{/* Partial Makeup */}
			<button
				onClick={() => handleClick("PARTIAL")}
				aria-label="Filter for Partial Makeup"
				data-tooltip-span
				className={`cursor-pointer rounded-xl flex justify-center items-center size-13 text-5xl border-2 transition-all ${
					selected === "PARTIAL" ? "bg-purple-100 border-purple-400 shadow-md" : "bg-white border-gray-300 hover:border-gray-400"
				}`}
			>
				<div className="tooltip bg-purple-400! border-purple-400! before:border-b-purple-400!">Partial Makeup</div>
				<Icon icon="mdi:lipstick" className="text-purple-400" />
			</button>

			{/* No Makeup */}
			<button
				onClick={() => handleClick("NONE")}
				aria-label="Filter for No Makeup"
				data-tooltip-span
				className={`cursor-pointer rounded-xl flex justify-center items-center size-13 text-5xl border-2 transition-all ${
					selected === "NONE" ? "bg-gray-200 border-gray-400 shadow-md" : "bg-white border-gray-300 hover:border-gray-400"
				}`}
			>
				<div className="tooltip bg-gray-400! border-gray-400! before:border-b-gray-400!">No Makeup</div>
				<Icon icon="codex:cross" className="text-gray-400" />
			</button>
		</div>
	);
}
