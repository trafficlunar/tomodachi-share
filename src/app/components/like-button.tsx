"use client";

import { useState } from "react";
import { redirect } from "next/navigation";
import { Icon } from "@iconify/react";

interface Props {
	likes: number;
	isLoggedIn: boolean;
}

export default function LikeButton({ likes, isLoggedIn }: Props) {
	const [isLiked, setIsLiked] = useState(false);
	const [likesState, setLikesState] = useState(likes);

	const onClick = () => {
		if (!isLoggedIn) redirect("/login");

		setIsLiked((prev) => !prev);
		setLikesState((prev) => (isLiked ? prev - 1 : prev + 1));

		// todo: update database
	};

	return (
		<button onClick={onClick} className="flex items-center gap-2 text-xl text-red-400 mt-1 cursor-pointer">
			<Icon icon={isLiked ? "icon-park-solid:like" : "icon-park-outline:like"} />
			<span>{likesState}</span>
		</button>
	);
}
