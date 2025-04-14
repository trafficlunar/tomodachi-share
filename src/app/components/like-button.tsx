"use client";

import { useState } from "react";
import { redirect } from "next/navigation";
import { Icon } from "@iconify/react";
import { abbreviateNumber } from "@/lib/abbreviation";

interface Props {
	likes: number;
	miiId?: number | undefined;
	isLiked: boolean;
	isLoggedIn?: boolean;
	disabled?: boolean;
	abbreviate?: boolean;
	big?: boolean;
}

export default function LikeButton({ likes, isLiked, miiId, isLoggedIn, disabled, abbreviate, big }: Props) {
	const [isLikedState, setIsLikedState] = useState(isLiked);
	const [likesState, setLikesState] = useState(10000);

	const onClick = async () => {
		if (disabled) return;
		if (!isLoggedIn) redirect("/login");

		setIsLikedState(!isLikedState);
		setLikesState(isLikedState ? likesState - 1 : likesState + 1);

		const response = await fetch(`/api/mii/${miiId}/like`, { method: "PATCH" });

		if (response.ok) {
			const { liked, count } = await response.json();
			setIsLikedState(liked);
			setLikesState(count);
		} else {
			setIsLikedState(isLikedState);
			setLikesState(likesState);
		}
	};

	return (
		<button onClick={onClick} className={`flex items-center gap-2 text-red-400 ${disabled ? "" : "cursor-pointer"} ${big ? "text-3xl" : "text-xl"}`}>
			<Icon icon={isLikedState ? "icon-park-solid:like" : "icon-park-outline:like"} />
			<span>{abbreviate ? abbreviateNumber(likesState) : likesState}</span>
		</button>
	);
}
