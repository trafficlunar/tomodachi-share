"use client";

import CreatableSelect from "react-select/creatable";

interface Props {
	tags: string[];
	setTags: React.Dispatch<React.SetStateAction<string[]>>;
}

interface Option {
	label: string;
	value: string;
}

const stringToOption = (input: string) => ({ value: input, label: input });

const options = ["anime", "art", "cartoon", "celebrity", "games", "history", "meme", "movie", "oc", "tv"].map(stringToOption);

export default function TagSelector({ tags, setTags }: Props) {
	// todo: tag validating

	return (
		<CreatableSelect
			isMulti
			placeholder="Select or create tags..."
			options={options}
			value={tags.map(stringToOption)}
			onChange={(newValue) => setTags(newValue.map((option) => option.value))}
			className="pill input col-span-2 w-full min-h-11 !py-0.5"
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
