import { useTransition } from "react";
import { Icon } from "@iconify/react";
import type { MiiMakeup } from "@tomodachi-share/shared";
import { useNavigate, useSearchParams } from "react-router";

export default function MakeupSelect() {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const [, startTransition] = useTransition();

	const selected = (searchParams.get("makeup") as MiiMakeup) ?? null;

	const handleClick = (makeup: MiiMakeup) => {
		const filter = selected === makeup ? null : makeup;

		const params = new URLSearchParams(searchParams);
		params.set("page", "1");

		if (filter) {
			params.set("makeup", filter);
		} else {
			params.delete("makeup");
		}

		startTransition(() => {
			navigate(`?${params.toString()}`);
		});
	};

	return (
		<div className="flex gap-0.5 w-fit">
			{/* Full Makeup */}
			<button
				onClick={() => handleClick("FULL")}
				aria-label="Filter for Full Face Paint"
				data-tooltip-span
				className={`cursor-pointer rounded-xl flex justify-center items-center size-13 text-5xl border-2 transition-all ${
					selected === "FULL" ? "bg-pink-100 border-pink-400 shadow-md" : "bg-white border-gray-300 hover:border-gray-400"
				}`}
			>
				<div className="tooltip bg-pink-400! border-pink-400! before:border-b-pink-400!">Full Face Paint</div>
				<Icon icon="mdi:palette" className="text-pink-400" />
			</button>

			{/* Partial Makeup */}
			<button
				onClick={() => handleClick("PARTIAL")}
				aria-label="Filter for Partial Face Paint"
				data-tooltip-span
				className={`cursor-pointer rounded-xl flex justify-center items-center size-13 text-5xl border-2 transition-all ${
					selected === "PARTIAL" ? "bg-purple-100 border-purple-400 shadow-md" : "bg-white border-gray-300 hover:border-gray-400"
				}`}
			>
				<div className="tooltip bg-purple-400! border-purple-400! before:border-b-purple-400!">Partial Face Paint</div>
				<Icon icon="mdi:lipstick" className="text-purple-400" />
			</button>

			{/* No Makeup */}
			<button
				onClick={() => handleClick("NONE")}
				aria-label="Filter for No Face Paint"
				data-tooltip-span
				className={`cursor-pointer rounded-xl flex justify-center items-center size-13 text-5xl border-2 transition-all ${
					selected === "NONE" ? "bg-gray-200 border-gray-400 shadow-md" : "bg-white border-gray-300 hover:border-gray-400"
				}`}
			>
				<div className="tooltip bg-gray-400! border-gray-400! before:border-b-gray-400!">No Face Paint</div>
				<Icon icon="codex:cross" className="text-gray-400" />
			</button>
		</div>
	);
}
