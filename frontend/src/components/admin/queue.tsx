// import { Prisma } from "@prisma/client";
// import { useMemo, useRef, useState } from "react";
// import Carousel from "../carousel";
// import Link from "next/link";
// import { Icon } from "@iconify/react";

// interface Props {
// 	miis: Prisma.MiiGetPayload<{ include: { user: { select: { id: true; name: true } }; _count: { select: { likedBy: true } } } }>[];
// }

// type Decision = "accept" | "reject" | null;

// export default function Queue({ miis }: Props) {
// 	const [currentIndex, setCurrentIndex] = useState(4); // Current index in the miis array, not visible
// 	const [visibleMiis, setVisibleMiis] = useState(miis.slice(0, 4));
// 	const [decision, setDecision] = useState<Decision>(null);
// 	const [isAnimating, setIsAnimating] = useState(false);

// 	const [dragOffset, setDragOffset] = useState(0);
// 	const dragStart = useRef<number | null>(null);
// 	const isDragging = useRef(false);

// 	const rotations = useMemo(() => {
// 		const map: Record<string, number> = {};
// 		miis.forEach((mii) => {
// 			map[mii.id] = Math.random() * 15 - 5;
// 		});
// 		return map;
// 	}, [miis]);

// 	const handleDecision = (decision: Decision) => {
// 		if (isAnimating) return;
// 		setDecision(decision);
// 		setIsAnimating(true);
// 		setDragOffset(decision === "accept" ? -300 : 300);

// 		setTimeout(() => {
// 			setVisibleMiis((prev) => {
// 				const newQueue = prev.slice(1); // Remove first Mii
// 				if (miis[currentIndex]) newQueue.push(miis[currentIndex]); // Add a new Mii to the end of the list
// 				return newQueue;
// 			});
// 			setCurrentIndex((prev) => prev + 1);
// 			setDecision(null);
// 			setIsAnimating(false);
// 			setDragOffset(0);
// 		}, 500);
// 	};

// 	const onDragStart = (clientX: number) => {
// 		if (isAnimating) return;
// 		dragStart.current = clientX;
// 		isDragging.current = true;
// 	};

// 	const onDragMove = (clientX: number) => {
// 		if (!isDragging.current || !dragStart.current) return;
// 		setDragOffset(clientX - dragStart.current);
// 	};

// 	const onDragEnd = () => {
// 		if (!isDragging.current) return;
// 		isDragging.current = false;

// 		if (dragOffset < -80) handleDecision("accept");
// 		else if (dragOffset > 80) handleDecision("reject");
// 		else setDragOffset(0);

// 		dragStart.current = null;
// 	};

// 	return (
// 		<div className="w-full flex justify-center items-center gap-8 relative h-100 mt-4 mb-8">
// 			<button
// 				onClick={() => handleDecision("accept")}
// 				className="pointer-coarse:hidden aspect-square cursor-pointer size-12 bg-zinc-50 border-2 border-zinc-300 rounded-full flex justify-center items-center text-2xl text-zinc-500 shadow-xs"
// 			>
// 				<Icon icon="material-symbols:check-rounded" />
// 			</button>

// 			<div className="relative w-full max-w-96 h-96 aspect-square">
// 				{visibleMiis.map((mii, i) => {
// 					const isTopCard = i === 0;

// 					// Calculate rotation/opacity based on drag distance
// 					const dragRotation = isTopCard ? dragOffset / 10 : 0;
// 					const dragOpacity = isTopCard ? 1 - Math.min(Math.abs(dragOffset) / 300, 1) : undefined;

// 					return (
// 						<div
// 							key={mii.id}
// 							className={`absolute inset-0 flex flex-col bg-zinc-50 rounded-3xl border-2 shadow-lg p-[0.8rem] border-zinc-300 *:select-none
// 								${!isDragging.current ? "transition-all duration-500" : "transition-none"}
// 								${isTopCard ? "cursor-grab active:cursor-grabbing" : "pointer-events-none"}`}
// 							style={{
// 								transform: isTopCard
// 									? `translate(${dragOffset}px, ${Math.abs(dragOffset) * 0.1}px) rotate(${rotations[mii.id] + dragRotation}deg)`
// 									: `translateY(${i * 10}px) rotate(${rotations[mii.id]}deg)`,
// 								zIndex: (visibleMiis.length - i) * 10,
// 								opacity: dragOpacity,
// 							}}
// 							onMouseDown={(e) => isTopCard && onDragStart(e.clientX)}
// 							onMouseMove={(e) => isTopCard && onDragMove(e.clientX)}
// 							onMouseUp={() => isTopCard && onDragEnd()}
// 							onMouseLeave={() => isTopCard && isDragging.current && onDragEnd()}
// 							onTouchStart={(e) => isTopCard && onDragStart(e.touches[0].clientX)}
// 							onTouchMove={(e) => isTopCard && onDragMove(e.touches[0].clientX)}
// 							onTouchEnd={() => isTopCard && onDragEnd()}
// 						>
// 							<Carousel
// 								images={[
// 									`/mii/${mii.id}/image?type=mii`,
// 									...(mii.platform === "THREE_DS" ? [`/mii/${mii.id}/image?type=qr-code`] : [`/mii/${mii.id}/image?type=features`]),
// 									...Array.from({ length: mii.imageCount }, (_, index) => `/mii/${mii.id}/image?type=image${index}`),
// 								]}
// 								onlyButtons
// 							/>

// 							<div className="p-4 flex flex-col gap-1 h-full">
// 								<div className="flex justify-between items-center">
// 									<Link
// 										href={`/mii/${mii.id}`}
// 										draggable={false}
// 										className="relative font-bold text-2xl line-clamp-1 w-full text-ellipsis wrap-break-word"
// 										title={mii.name}
// 									>
// 										{mii.name}
// 									</Link>
// 									<div title={mii.platform === "SWITCH" ? "Switch" : "3DS"} className="-mr-3 text-[1.25rem] opacity-25">
// 										{mii.platform === "SWITCH" ? (
// 											<Icon icon="cib:nintendo-switch" className="text-red-400" />
// 										) : (
// 											<Icon icon="cib:nintendo-3ds" className="text-sky-400" />
// 										)}
// 									</div>
// 								</div>
// 								<div id="tags" className="flex flex-wrap gap-1">
// 									{mii.tags.map((tag) => (
// 										<Link href={{ query: { tags: tag } }} draggable={false} key={tag} className="px-2 py-1 bg-orange-300 rounded-full text-xs">
// 											{tag}
// 										</Link>
// 									))}
// 								</div>

// 								<div className="mt-auto grid grid-cols-2 gap-4 items-center">
// 									<p className="text-sm">{mii.createdAt.toLocaleString("en-GB", { timeZone: "UTC" })}</p>

// 									<Link href={`/profile/${mii.user.id}`} draggable={false} className="text-sm text-right overflow-hidden text-ellipsis whitespace-nowrap">
// 										@{mii.user?.name}
// 									</Link>
// 								</div>
// 							</div>
// 						</div>
// 					);
// 				})}
// 			</div>

// 			<button
// 				onClick={() => handleDecision("reject")}
// 				className="pointer-coarse:hidden aspect-square cursor-pointer size-12 bg-zinc-50 border-2 border-zinc-300 rounded-full flex justify-center items-center text-2xl text-zinc-500 shadow-xs"
// 			>
// 				<Icon icon="material-symbols:close-rounded" />
// 			</button>
// 		</div>
// 	);
// }
