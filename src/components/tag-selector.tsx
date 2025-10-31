"use client";

import React, { useState, useRef } from "react";
import { useCombobox } from "downshift";
import { Icon } from "@iconify/react";

interface Props {
	tags: string[];
	setTags: React.Dispatch<React.SetStateAction<string[]>>;
	showTagLimit?: boolean;
}

const tagRegex = /^[a-z0-9-_]*$/;
const predefinedTags = ["anime", "art", "cartoon", "celebrity", "games", "history", "meme", "movie", "oc", "tv"];

export default function TagSelector({ tags, setTags, showTagLimit }: Props) {
	const [inputValue, setInputValue] = useState<string>("");
	const inputRef = useRef<HTMLInputElement>(null);

	const getFilteredItems = (): string[] =>
		predefinedTags.filter((item) => item.toLowerCase().includes(inputValue?.toLowerCase() || "")).filter((item) => !tags.includes(item));

	const filteredItems = getFilteredItems();
	const isMaxItemsSelected = tags.length >= 8;
	const hasSelectedItems = tags.length > 0;

	const addTag = (tag: string) => {
		if (!tags.includes(tag) && tags.length < 8 && tag.length <= 20) {
			setTags([...tags, tag]);
		}
	};

	const removeTag = (tag: string) => {
		setTags(tags.filter((t) => t !== tag));
	};

	const { isOpen, openMenu, getToggleButtonProps, getMenuProps, getInputProps, getItemProps, highlightedIndex } = useCombobox<string>({
		inputValue,
		items: filteredItems,
		onInputValueChange: ({ inputValue }) => {
			if (inputValue && !tagRegex.test(inputValue)) return;
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

	const handleContainerClick = () => {
		if (!isMaxItemsSelected) {
			inputRef.current?.focus();
			openMenu();
		}
	};

	return (
		<div className="col-span-2 relative">
			<div
				className={`relative justify-between! pill input focus-within:ring-[3px] ring-orange-400/50 cursor-text transition ${
					tags.length > 0 ? "py-1.5! px-2!" : ""
				}`}
				onClick={handleContainerClick}
			>
				{/* Tags */}
				<div className="flex flex-wrap gap-1.5 w-full">
					{tags.map((tag) => (
						<span key={tag} className="bg-orange-300 py-1 px-3 rounded-2xl flex items-center gap-1 text-sm">
							{tag}
							<button
								type="button"
								aria-label="Delete Tag"
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
							ref: inputRef,
							onKeyDown: handleKeyDown,
							disabled: isMaxItemsSelected,
							placeholder: tags.length > 0 ? "" : "Type or select a tag...",
							maxLength: 20,
							className: "w-full flex-1 outline-none placeholder:text-black/40",
						})}
					/>
				</div>

				{/* Control buttons */}
				<div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
					{hasSelectedItems && (
						<button type="button" aria-label="Remove All Tags" className="text-black cursor-pointer" onClick={() => setTags([])}>
							<Icon icon="mdi:close" />
						</button>
					)}

					<button
						type="button"
						aria-label="Toggle Tag Dropdown"
						{...getToggleButtonProps()}
						disabled={isMaxItemsSelected}
						className="text-black cursor-pointer text-xl disabled:text-black/35"
					>
						<Icon icon="mdi:chevron-down" />
					</button>
				</div>

				{/* Dropdown menu */}
				{!isMaxItemsSelected && (
					<ul
						{...getMenuProps()}
						onClick={(e) => e.stopPropagation()}
						className={`absolute right-0 top-full mt-2 z-50 w-80 bg-orange-200/45 backdrop-blur-md border-2 border-orange-400 rounded-lg shadow-lg shadow-black/25 max-h-60 overflow-y-auto ${
							isOpen ? "block" : "hidden"
						}`}
					>
						{filteredItems.map((item, index) => (
							<li
								key={item}
								{...getItemProps({ item, index })}
								className={`px-4 py-1 cursor-pointer text-sm ${highlightedIndex === index ? "bg-black/15" : ""}`}
							>
								{item}
							</li>
						))}
						{inputValue && !filteredItems.includes(inputValue) && (
							<li
								className="px-4 py-1 cursor-pointer text-sm bg-black/15"
								onClick={() => {
									addTag(inputValue);
									setInputValue("");
								}}
							>
								Add &quot;{inputValue}&quot;
							</li>
						)}
					</ul>
				)}
			</div>

			{/* Tag limit message */}
			{showTagLimit && (
				<div className="mt-1.5 text-xs min-h-4">
					{isMaxItemsSelected ? (
						<span className="text-red-400 font-medium">Maximum of 8 tags reached. Remove a tag to add more.</span>
					) : (
						<span className="text-black/60">{tags.length}/8 tags</span>
					)}
				</div>
			)}
		</div>
	);
}
