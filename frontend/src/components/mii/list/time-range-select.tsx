import { useTransition } from "react";
import { useSelect } from "downshift";
import { Icon } from "@iconify/react";
import { useNavigate, useSearchParams } from "react-router";

type TimeRange = "day" | "week" | "month" | "year";

const items: { value: TimeRange | "all"; label: string }[] = [
	{ value: "all", label: "all time" },
	{ value: "day", label: "today" },
	{ value: "week", label: "this week" },
	{ value: "month", label: "this month" },
	{ value: "year", label: "this year" },
];

export default function TimeRangeSelect() {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const [, startTransition] = useTransition();

	const currentRange = (searchParams.get("timeRange") as TimeRange) || "all";
	const currentItem = items.find((i) => i.value === currentRange) || items[0];

	const { isOpen, getToggleButtonProps, getMenuProps, getItemProps, highlightedIndex, selectedItem } = useSelect({
		items,
		selectedItem: currentItem,
		itemToString: (item) => item?.label || "",
		onSelectedItemChange: ({ selectedItem }) => {
			if (!selectedItem) return;

			const params = new URLSearchParams(searchParams);
			params.set("page", "1");

			if (selectedItem.value === "all") {
				params.delete("timeRange");
			} else {
				params.set("timeRange", selectedItem.value);
			}

			startTransition(() => {
				navigate(`?${params.toString()}`, { preventScrollReset: true });
			});
		},
	});

	return (
		<div className="relative w-fit">
			<button type="button" {...getToggleButtonProps()} aria-label="Time range dropdown" className="pill input w-full gap-1 justify-between! text-nowrap">
				<Icon icon="mdi:clock-outline" className="size-5 mr-1" />
				{selectedItem?.label || "all time"}
				<Icon icon="tabler:chevron-down" className="ml-1 size-5" />
			</button>

			<ul
				{...getMenuProps()}
				className={`absolute z-50 w-full bg-orange-200 border-2 border-orange-400 rounded-lg mt-1 shadow-lg max-h-60 overflow-y-auto ${
					isOpen ? "block" : "hidden"
				}`}
			>
				{isOpen &&
					items.map((item, index) => (
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
