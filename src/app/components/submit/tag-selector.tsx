"use client";

import React, { useState, KeyboardEvent } from "react";
import { useCombobox, useMultipleSelection } from "downshift";
import { Icon } from "@iconify/react";

interface Props {
	tags: string[];
	setTags: React.Dispatch<React.SetStateAction<string[]>>;
}

const tagRegex = /^[a-z]*$/;
const predefinedItems = ["anime", "art", "cartoon", "celebrity", "games", "history", "meme", "movie", "oc", "tv"];

export default function TagSelector({ tags, setTags }: Props) {
	const [inputValue, setInputValue] = useState<string>("");

	const getFilteredItems = (): string[] =>
		predefinedItems.filter((item) => item.toLowerCase().includes(inputValue?.toLowerCase() || "")).filter((item) => !tags.includes(item));

	const filteredItems = getFilteredItems();
	const isMaxItemsSelected = tags.length >= 8;
	const hasSelectedItems = tags.length > 0;

	const addTag = (tag: string) => {
		if (!tags.includes(tag) && tags.length < 8) {
			setTags([...tags, tag]);
		}
	};

	const removeTag = (tag: string) => {
		setTags(tags.filter((t) => t !== tag));
	};

	const { isOpen, getToggleButtonProps, getMenuProps, getInputProps, getItemProps, highlightedIndex } = useCombobox<string>({
		inputValue,
		items: filteredItems,
		onInputValueChange: ({ inputValue }) => {
			if (!tagRegex.test(inputValue)) return;
			setInputValue(inputValue || "");
		},
		onStateChange: ({ type, selectedItem }) => {
			if (type === useCombobox.stateChangeTypes.ItemClick && selectedItem) {
				addTag(selectedItem);
				setInputValue("");
			}
		},
	});

	const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
		if (event.key === "Enter" && inputValue && !tags.includes(inputValue)) {
			addTag(inputValue);
			setInputValue("");
		}

		// Spill onto last tag
		if (event.key === "Backspace" && inputValue === "") {
			const lastTag = tags[tags.length - 1];
			setInputValue(lastTag);
			removeTag(lastTag);
		}
	};

	return (
		<div
			className={`col-span-2 !justify-between pill input relative focus-within:ring-[3px] ring-orange-400/50 transition ${
				tags.length > 0 ? "!py-1.5" : ""
			}`}
		>
			{/* Tags */}
			<div className="flex flex-wrap gap-1.5 w-full">
				{tags.map((tag) => (
					<span key={tag} className="bg-orange-300 py-1 px-3 rounded-2xl flex items-center gap-1 text-sm">
						{tag}
						<button
							type="button"
							className="text-black cursor-pointer"
							onClick={(e) => {
								e.stopPropagation();
								removeTag(tag);
							}}
						>
							<Icon icon="mdi:close" className="text-xs" />
						</button>
					</span>
				))}

				{/* Input */}
				<input
					{...getInputProps({
						onKeyDown: handleKeyDown,
						disabled: isMaxItemsSelected,
						placeholder: tags.length > 0 ? "" : "Type or select an item...",
						className: "w-full flex-1 outline-none",
					})}
				/>
			</div>

			{/* Control buttons */}
			<div className="flex items-center gap-1">
				{hasSelectedItems && (
					<button type="button" className="text-black cursor-pointer" onClick={() => setTags([])}>
						<Icon icon="mdi:close" />
					</button>
				)}

				<button type="button" {...getToggleButtonProps()} className="text-black cursor-pointer text-xl">
					<Icon icon="mdi:chevron-down" />
				</button>
			</div>

			{/* Dropdown menu */}
			{!isMaxItemsSelected && (
				<ul
					{...getMenuProps()}
					className={`absolute left-0 top-full mt-2 z-50 w-full bg-orange-200 border-2 border-orange-400 rounded-lg shadow-lg max-h-60 overflow-y-auto ${
						isOpen ? "block" : "hidden"
					}`}
				>
					{isOpen &&
						filteredItems.map((item, index) => (
							<li
								key={item}
								{...getItemProps({ item, index })}
								className={`px-4 py-1 cursor-pointer text-sm ${highlightedIndex === index ? "bg-black/15" : ""}`}
							>
								{item}
							</li>
						))}
					{isOpen && inputValue && !filteredItems.includes(inputValue) && (
						<li
							className="px-4 py-1 cursor-pointer text-sm bg-black/15"
							onClick={() => {
								addTag(inputValue);
								setInputValue("");
							}}
						>
							Add "{inputValue}"
						</li>
					)}
				</ul>
			)}
		</div>
	);
}
