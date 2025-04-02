"use client";

import CreatableSelect from "react-select/creatable";

const options = [
	{ value: "anime", label: "anime" },
	{ value: "art", label: "art" },
	{ value: "cartoon", label: "cartoon" },
	{ value: "celebrity", label: "celebrity" },
	{ value: "games", label: "games" },
	{ value: "history", label: "history" },
	{ value: "meme", label: "meme" },
	{ value: "movie", label: "movie" },
	{ value: "oc", label: "oc" },
	{ value: "tv", label: "tv" },
];

export default function TagSelector() {
	// todo: tag validating

	return (
		<CreatableSelect
			isMulti
			placeholder="Select or create tags..."
			options={options}
			className="pill input col-span-2 w-full !py-0.5"
			styles={{
				control: (provided) => ({
					...provided,
					border: "none",
					background: "transparent",
					width: "100%",
					boxShadow: "none",
				}),
				valueContainer: (provided) => ({
					...provided,
					padding: "0",
				}),
				multiValue: (provided) => ({
					...provided,
					borderRadius: "16px",
					padding: "2px 8px",
					backgroundColor: "var(--color-orange-300)",
				}),
				multiValueRemove: (provided) => ({
					...provided,
					cursor: "pointer",
					"&:hover": {
						backgroundColor: "transparent",
						color: "var(--color-black)",
					},
				}),
				indicatorsContainer: (provided) => ({
					...provided,
					"*": {
						padding: "1px",
						color: "black",
						cursor: "pointer",
					},
				}),
				indicatorSeparator: () => ({
					display: "none",
				}),
				placeholder: (provided) => ({
					...provided,
					color: "rgba(0, 0, 0, 0.4)",
				}),
				menu: (provided) => ({
					...provided,
					backgroundColor: "var(--color-orange-200)",
					border: "2px solid var(--color-orange-400)",
					borderRadius: "8px",
				}),
				option: (provided, { isFocused }) => ({
					...provided,
					backgroundColor: isFocused ? "rgba(0, 0, 0, 0.15)" : "var(--color-orange-200)",
					cursor: "pointer",
					padding: "2px 8px",
				}),
			}}
		/>
	);
}
