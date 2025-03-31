"use client";

import { useState } from "react";
import { redirect } from "next/navigation";
import { Icon } from "@iconify/react";

interface Props {
	likes: number;
	miiId: number | undefined;
	isLiked: boolean;
	isLoggedIn: boolean;
	big?: boolean;
}

export default function LikeButton({ likes, isLiked, miiId, isLoggedIn, big }: Props) {
	const [isLikedState, setIsLikedState] = useState(isLiked);
	const [likesState, setLikesState] = useState(likes);

	const onClick = async () => {
		if (!isLoggedIn) redirect("/login");

		setIsLikedState((prev) => !prev);
		setLikesState((prev) => (isLiked ? prev - 1 : prev + 1));

		const response = await fetch("/api/like", { method: "PATCH", body: JSON.stringify({ miiId }) });
		const { liked, count } = await response.json();

		setIsLikedState(liked);
		setLikesState(count);
	};

	return (
		<button onClick={onClick} className={`flex items-center gap-2 text-red-400 cursor-pointer ${big ? "text-3xl" : "text-xl"}`}>
			<Icon icon={isLikedState ? "icon-park-solid:like" : "icon-park-outline:like"} />
			<span>{likesState}</span>
		</button>
	);
}
