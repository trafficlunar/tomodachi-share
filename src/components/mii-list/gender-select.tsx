"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Icon } from "@iconify/react";
import { MiiGender } from "@prisma/client";

export default function GenderSelect() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [, startTransition] = useTransition();

	const [selected, setSelected] = useState<MiiGender | null>((searchParams.get("gender") as MiiGender) ?? null);

	const handleClick = (gender: MiiGender) => {
		const filter = selected === gender ? null : gender;
		setSelected(filter);

		const params = new URLSearchParams(searchParams);
		if (filter) {
			params.set("gender", filter);
		} else {
			params.delete("gender");
		}

		startTransition(() => {
			router.push(`?${params.toString()}`);
		});
	};

	return (
		<div className="grid grid-cols-2 gap-0.5">
			<button
				onClick={() => handleClick("MALE")}
				aria-label="Filter for Male Miis"
				className={`cursor-pointer rounded-xl flex justify-center items-center size-11 text-4xl border-2 transition-all ${
					selected === "MALE" ? "bg-blue-100 border-blue-400 shadow-md" : "bg-white border-gray-300 hover:border-gray-400"
				}`}
			>
				<Icon icon="foundation:male" className="text-blue-400" />
			</button>

			<button
				onClick={() => handleClick("FEMALE")}
				aria-label="Filter for Female Miis"
				className={`cursor-pointer rounded-xl flex justify-center items-center size-11 text-4xl border-2 transition-all ${
					selected === "FEMALE" ? "bg-pink-100 border-pink-400 shadow-md" : "bg-white border-gray-300 hover:border-gray-400"
				}`}
			>
				<Icon icon="foundation:female" className="text-pink-400" />
			</button>
		</div>
	);
}
