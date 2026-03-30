"use client";

import Link from "next/link";
import useSWR from "swr";
import { Prisma } from "@prisma/client";
import { useSession } from "next-auth/react";
import { Icon } from "@iconify/react";

import LikeButton from "@/components/like-button";
import DeleteMiiButton from "../delete-mii-button";
import Carousel from "@/components/carousel";

interface Props {
	miis: Prisma.MiiGetPayload<{ include: { user: { select: { id: true; name: true } }; _count: { select: { likedBy: true } } } }>[];
	userId?: number;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function MiiGrid({ miis, userId }: Props) {
	const session = useSession();
	const ids = miis.map((m) => m.id).join(",");
	const { data } = useSWR<number[]>(session.data?.user && miis.length > 0 ? `/api/mii/has-liked?ids=${ids}` : null, fetcher, {
		revalidateOnFocus: false,
		revalidateOnReconnect: false,
	});
	const likedIds = new Set(data ?? []);

	return (
		<div className="grid grid-cols-4 gap-4 max-lg:grid-cols-3 max-md:grid-cols-2 max-[30rem]:grid-cols-1">
			{miis.map((mii) => (
				<div
					key={mii.id}
					className={`flex flex-col relative bg-zinc-50 rounded-3xl border-2 shadow-lg p-[0.8rem] transition hover:scale-105 hover:bg-cyan-100 hover:border-cyan-600 ${mii.quarantined ? "border-red-300" : "border-zinc-300"}`}
				>
					<Carousel
						images={[
							`/mii/${mii.id}/image?type=mii`,
							...(mii.platform === "THREE_DS" ? [`/mii/${mii.id}/image?type=qr-code`] : [`/mii/${mii.id}/image?type=features`]),
							...Array.from({ length: mii.imageCount }, (_, index) => `/mii/${mii.id}/image?type=image${index}`),
						]}
					/>

					<div className="p-4 flex flex-col gap-1 h-full">
						<div className="flex justify-between items-center">
							<Link href={`/mii/${mii.id}`} className="relative font-bold text-2xl line-clamp-1 w-full text-ellipsis wrap-break-word" title={mii.name}>
								{mii.name}
							</Link>
							<div title={mii.platform === "SWITCH" ? "Switch" : "3DS"} className="-mr-3 text-[1.25rem] opacity-25">
								{mii.platform === "SWITCH" ? (
									<Icon icon="cib:nintendo-switch" className="text-red-400" />
								) : (
									<Icon icon="cib:nintendo-3ds" className="text-sky-400" />
								)}
							</div>
						</div>
						<div id="tags" className="flex flex-wrap gap-1">
							{mii.tags.map((tag) => (
								<Link href={{ query: { tags: tag } }} key={tag} className="px-2 py-1 bg-orange-300 rounded-full text-xs">
									{tag}
								</Link>
							))}
						</div>

						<div className="mt-auto grid grid-cols-2 items-center">
							<LikeButton likes={mii._count.likedBy} miiId={mii.id} isLiked={likedIds.has(mii.id)} abbreviate />

							{!userId && (
								<Link href={`/profile/${mii.user?.id}`} className="text-sm text-right overflow-hidden text-ellipsis whitespace-nowrap">
									@{mii.user?.name}
								</Link>
							)}

							{userId && Number(session.data?.user?.id) == userId && (
								<div className="flex gap-1 text-2xl justify-end text-zinc-400">
									<Link href={`/edit/${mii.id}`} title="Edit Mii" aria-label="Edit Mii" data-tooltip="Edit">
										<Icon icon="mdi:pencil" />
									</Link>
									<DeleteMiiButton miiId={mii.id} miiName={mii.name} likes={mii._count.likedBy} />
								</div>
							)}
						</div>
					</div>
				</div>
			))}
		</div>
	);
}
