"use client";

import { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import { Icon, loadIcons } from "@iconify/react";
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
	const [likesState, setLikesState] = useState(likes);
	const [isAnimating, setIsAnimating] = useState(false);

	const onClick = async () => {
		if (disabled) return;
		if (!isLoggedIn) redirect("/login");

		setIsLikedState(!isLikedState);
		setLikesState(isLikedState ? likesState - 1 : likesState + 1);

		// Trigger animation
		if (!isLikedState) {
			setIsAnimating(true);
			setTimeout(() => setIsAnimating(false), 1000); // match animation duration
		}

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

	// Preload like button icons
	useEffect(() => {
		loadIcons(["icon-park-solid:like", "icon-park-outline:like"]);
	}, []);

	return (
		<button
			onClick={onClick}
			aria-label="Like"
			className={`flex items-center gap-2 text-red-400 ${disabled ? "" : "cursor-pointer"} ${big ? "text-3xl" : "text-xl"}`}
		>
			<div className="relative">
				<Icon icon={isLikedState ? "icon-park-solid:like" : "icon-park-outline:like"} className={`${isAnimating ? "animate-like " : ""}`} />
				<div
					className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 size-6 rounded-full bg-red-400/0 ${
						isAnimating ? "bg-red-400/40 animate-ping" : ""
					}`}
				></div>
			</div>

			<span>{abbreviate ? abbreviateNumber(likesState) : likesState}</span>
		</button>
	);
}
