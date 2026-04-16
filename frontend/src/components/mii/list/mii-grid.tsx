import { Icon } from "@iconify/react";

import LikeButton from "../../like-button";
import DeleteMiiButton from "../delete-mii-button";
import Carousel from "../../carousel";
import ImageViewer from "../../image-viewer";

interface Props {
	// miis: Prisma.MiiGetPayload<{ include: { user: { select: { id: true; name: true } }; _count: { select: { likedBy: true } } } }>[];
	miis: any[];
	userId?: number;
	parentPage?: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function MiiGrid({ miis, userId, parentPage }: Props) {
	const likedIds = new Set([]);

	return (
		<div className="grid grid-cols-4 gap-4 max-lg:grid-cols-3 max-md:grid-cols-2 max-[30rem]:grid-cols-1">
			{miis.map((mii) => (
				<div
					key={mii.id}
					className={`flex flex-col relative bg-zinc-50 rounded-3xl border-2 shadow-lg p-[0.8rem] transition hover:scale-105 hover:bg-cyan-100 hover:border-cyan-600 ${mii.quarantined ? "border-red-300 bg-red-50!" : mii.in_queue && parentPage !== "admin" ? "border-zinc-400 opacity-70" : "border-zinc-300"}`}
				>
					{mii.in_queue && (
						<div className="absolute top-2 left-2 z-10 bg-zinc-500 text-white text-xs font-semibold px-2 py-1 rounded-full shadow-sm flex items-center gap-1">
							<Icon icon="mdi:clock-outline" className="text-base" />
							In Queue
						</div>
					)}

					<a href={`/mii/${mii.id}`} className="overflow-hidden rounded-xl bg-zinc-300 shrink-0">
						<img
							src={`${import.meta.env.PUBLIC_API_URL}/mii/${mii.id}/image?type=mii`}
							width={240}
							height={160}
							alt="mii image"
							className="w-full h-auto aspect-3/2 object-contain"
						/>
					</a>

					<div className="p-4 flex flex-col gap-1 h-full">
						<div className="flex justify-between">
							<a href={`/mii/${mii.id}`} className="relative font-bold text-2xl line-clamp-1 w-full text-ellipsis wrap-break-word" title={mii.name}>
								{mii.name}
							</a>
							<div title={mii.platform === "SWITCH" ? "Switch" : "3DS"} className="text-[1.25rem] opacity-25">
								{mii.platform === "SWITCH" ? (
									<Icon icon="cib:nintendo-switch" className="text-red-400" />
								) : (
									<Icon icon="cib:nintendo-3ds" className="text-sky-400" />
								)}
							</div>
						</div>
						<div id="tags" className="flex flex-wrap gap-1">
							{mii.tags.map((tag: string) => (
								<a href={`?tags=${tag}`} key={tag} className="px-2 py-1 bg-orange-300 rounded-full text-xs">
									{tag}
								</a>
							))}
						</div>

						<div className="mt-auto grid grid-cols-2 items-center">
							<LikeButton likes={mii._count.likedBy} miiId={mii.id} isLiked={likedIds.has(mii.id)} abbreviate />

							{!userId && (
								<a href={`/profile/${mii.user?.id}`} className="text-sm text-right overflow-hidden text-ellipsis whitespace-nowrap">
									@{mii.user?.name}
								</a>
							)}

							{/* {userId && Number(session.data?.user?.id) == userId && (
								<div className="flex gap-1 text-2xl justify-end text-zinc-400">
									<a href={`/edit/${mii.id}`} title="Edit Mii" aria-label="Edit Mii" data-tooltip="Edit">
										<Icon icon="mdi:pencil" />
									</a>
									<DeleteMiiButton miiId={mii.id} miiName={mii.name} likes={mii._count.likedBy} />
								</div>
							)} */}

							{/* Admin Controls */}
							{parentPage === "admin" && (
								<div className="flex justify-between w-full col-span-2 mt-2">
									<div className="flex gap-1 text-3xl justify-center">
										<button
											onClick={async () => {
												await fetch(`/api/admin/accept-mii?id=${mii.id}`, { method: "PATCH" });
											}}
											className="cursor-pointer text-zinc-400 hover:text-green-500 transition-colors p-1 bg-white rounded-md shadow-sm border border-zinc-200 hover:border-green-500"
											title="Accept Mii"
										>
											<Icon icon="material-symbols:check-rounded" />
										</button>
										<div className="text-zinc-400 hover:text-red-500 transition-colors p-1 bg-white rounded-md shadow-sm border border-zinc-200 hover:border-red-500 flex items-center justify-center">
											<DeleteMiiButton miiId={mii.id} miiName={mii.name} likes={mii._count.likedBy} />
										</div>
									</div>

									<span className="text-sm w-1/2 text-right">{new Date(mii.createdAt).toLocaleString("en-GB", { timeZone: "UTC" })}</span>
								</div>
							)}
						</div>
					</div>
				</div>
			))}
		</div>
	);
}
