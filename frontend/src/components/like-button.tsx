import { useEffect, useState } from "react";
import { Icon, loadIcons } from "@iconify/react";
import { abbreviateNumber } from "../lib/abbreviation";
import { useStore } from "@nanostores/react";
import { session } from "../session";
import { useNavigate } from "react-router";

interface Props {
	likes: number;
	miiId?: number | undefined;
	isLiked: boolean;
	disabled?: boolean;
	abbreviate?: boolean;
	big?: boolean;
}

export default function LikeButton({ likes, miiId, isLiked, disabled, abbreviate, big }: Props) {
	const $session = useStore(session);
	const navigate = useNavigate();
	const [isLikedState, setIsLikedState] = useState(isLiked);
	const [likesState, setLikesState] = useState(likes);
	const [isAnimating, setIsAnimating] = useState(false);

	const onClick = async () => {
		if (disabled || !miiId) return;
		if ($session === undefined) return;
		if ($session === null) {
			navigate("/login");
			return;
		}

		const prevLiked = isLikedState;
		const prevLikes = likesState;
		setIsLikedState(!prevLiked);
		setLikesState(prevLiked ? likesState - 1 : likesState + 1);

		// Trigger animation
		if (!prevLiked) {
			setIsAnimating(true);
			setTimeout(() => setIsAnimating(false), 1000);
		}

		const response = await fetch(`${import.meta.env.VITE_API_URL}/api/mii/${miiId}/like`, { method: "POST", credentials: "include" });
		if (response.ok) {
			const { liked, count } = await response.json();
			setIsLikedState(liked);
			setLikesState(count);
		} else {
			setIsLikedState(prevLiked);
			setLikesState(prevLikes);
		}
	};

	// Preload like button icons
	useEffect(() => {
		loadIcons(["icon-park-solid:like", "icon-park-outline:like"]);
	}, []);

	useEffect(() => {
		setIsLikedState(isLiked);
	}, [isLiked]);

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
