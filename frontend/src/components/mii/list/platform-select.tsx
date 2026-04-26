import { useTransition } from "react";
import { Icon } from "@iconify/react";
import type { MiiPlatform } from "@tomodachi-share/shared";
import { useNavigate, useSearchParams } from "react-router";

export default function PlatformSelect() {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const [, startTransition] = useTransition();
	const selected = (searchParams.get("platform") as MiiPlatform) ?? null;

	const handleClick = (platform: MiiPlatform) => {
		const filter = selected === platform ? null : platform;

		const params = new URLSearchParams(searchParams);
		params.set("page", "1");

		if (filter) {
			params.set("platform", filter);
		} else {
			params.delete("platform");
		}
		if (params.get("gender") === "NONBINARY") params.delete("gender");
		params.delete("makeup");
		params.delete("allowCopying");

		startTransition(() => {
			navigate(`?${params.toString()}`);
		});
	};

	return (
		<div className="grid grid-cols-2 gap-0.5 w-fit">
			<button
				onClick={() => handleClick("THREE_DS")}
				aria-label="Filter for 3DS Miis"
				data-tooltip-span
				className={`cursor-pointer rounded-xl flex justify-center items-center size-13 text-3xl border-2 transition-all ${
					selected === "THREE_DS" ? "bg-sky-100 border-sky-400 shadow-md" : "bg-white border-gray-300 hover:border-gray-400"
				}`}
			>
				<div className="tooltip bg-sky-400! border-sky-400! before:border-b-sky-400!">3DS</div>
				<Icon icon="cib:nintendo-3ds" className="text-sky-400" />
			</button>

			<button
				onClick={() => handleClick("SWITCH")}
				aria-label="Filter for Switch Miis"
				data-tooltip-span
				className={`cursor-pointer rounded-xl flex justify-center items-center size-13 text-3xl border-2 transition-all ${
					selected === "SWITCH" ? "bg-red-100 border-red-400 shadow-md" : "bg-white border-gray-300 hover:border-gray-400"
				}`}
			>
				<div className="tooltip bg-red-400! border-red-400! before:border-b-red-400!">Switch</div>
				<Icon icon="cib:nintendo-switch" className="text-red-400" />
			</button>
		</div>
	);
}
