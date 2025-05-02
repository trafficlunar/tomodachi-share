"use client";

import { Icon } from "@iconify/react";
import { ReportReason } from "@prisma/client";
import { useSelect } from "downshift";

interface Props {
	reason: ReportReason | undefined;
	setReason: React.Dispatch<React.SetStateAction<ReportReason | undefined>>;
}

const reasonMap: Record<ReportReason, string> = {
	INAPPROPRIATE: "Inappropriate content",
	SPAM: "Spam",
	COPYRIGHT: "Copyrighted content",
	OTHER: "Other...",
};

const reasonOptions = Object.entries(reasonMap).map(([value, label]) => ({
	value: value as ReportReason,
	label,
}));

export default function ReasonSelector({ reason, setReason }: Props) {
	const { isOpen, getToggleButtonProps, getMenuProps, getItemProps, highlightedIndex, selectedItem } = useSelect({
		items: reasonOptions,
		selectedItem: reason ? reasonOptions.find((option) => option.value === reason) : null,
		itemToString: (item) => (item ? item.label : ""),
		onSelectedItemChange: ({ selectedItem }) => {
			if (selectedItem) {
				setReason(selectedItem.value);
			}
		},
	});

	return (
		<div className="relative w-full col-span-2">
			{/* Toggle button to open the dropdown */}
			<button type="button" {...getToggleButtonProps()} className="pill input w-full gap-1 !justify-between text-nowrap">
				{selectedItem?.label || <span className="text-black/40">Select a reason for the report...</span>}
				<Icon icon="tabler:chevron-down" className="ml-2 size-5" />
			</button>

			{/* Dropdown menu */}
			<ul
				{...getMenuProps()}
				className={`absolute z-50 w-full bg-orange-200 border-2 border-orange-400 rounded-lg mt-1 shadow-lg max-h-60 overflow-y-auto ${
					isOpen ? "block" : "hidden"
				}`}
			>
				{isOpen &&
					reasonOptions.map((item, index) => (
						<li
							key={item.value}
							{...getItemProps({ item, index })}
							className={`px-4 py-1 cursor-pointer text-sm ${highlightedIndex === index ? "bg-black/15" : ""}`}
						>
							{item.label}
						</li>
					))}
			</ul>
		</div>
	);
}
