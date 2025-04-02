"use client";

import { useDropzone } from "react-dropzone";
import CreatableSelect from "react-select/creatable";
import { Icon } from "@iconify/react";

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

export default function SubmitForm() {
	const { acceptedFiles, getRootProps, getInputProps } = useDropzone({
		accept: {
			"image/*": [".png", ".jpg", ".jpeg", ".bmp", ".webp"],
		},
	});

	// todo: tag validating

	return (
		<form onSubmit={(e) => e.preventDefault()} className="grid grid-cols-2">
			<div className="p-4">
				<div className="p-2 border-2 bg-orange-100 border-amber-500 rounded-2xl shadow-lg h-48">
					<div
						{...getRootProps({
							className:
								"bg-orange-100 flex flex-col justify-center items-center gap-2 p-4 rounded-xl border border-2 border-dashed border-amber-500 select-none h-full",
						})}
					>
						<input {...getInputProps({ multiple: false })} />
						<Icon icon="material-symbols:upload" fontSize={64} />
						<p className="text-center">
							Drag and drop your images here
							<br />
							or click to open
						</p>
					</div>
				</div>

				{/* todo: show file list here */}
			</div>

			<div className="p-4 flex flex-col gap-2">
				<div className="w-full grid grid-cols-3 items-center">
					<label htmlFor="name" className="font-semibold">
						Name
					</label>
					<input
						name="name"
						type="text"
						className="pill input w-full col-span-2"
						minLength={2}
						maxLength={64}
						placeholder="Type your mii's name here..."
					/>
				</div>

				<div className="w-full grid grid-cols-3 items-center">
					<label htmlFor="tags" className="font-semibold">
						Tags
					</label>
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
				</div>

				<fieldset className="border-t-2 border-b-2 border-black p-3 flex flex-col items-center gap-2">
					<legend className="px-2">QR Code</legend>

					<div className="p-2 border-2 bg-orange-100 border-amber-500 rounded-2xl shadow-lg w-full">
						<div
							{...getRootProps({
								className:
									"bg-orange-100 flex flex-col justify-center items-center gap-2 p-4 rounded-xl border border-2 border-dashed border-amber-500 select-none h-full",
							})}
						>
							<input {...getInputProps({ multiple: false })} />
							<Icon icon="material-symbols:upload" fontSize={48} />
							<p className="text-center text-sm">
								Drag and drop your QR code image here
								<br />
								or click to open
							</p>
						</div>
					</div>

					<span>or</span>

					<button className="pill button gap-2">
						<Icon icon="mdi:camera" fontSize={20} />
						Use your camera
					</button>
				</fieldset>

				<button type="submit" className="pill button w-min ml-auto">
					Submit
				</button>
			</div>
		</form>
	);
}
