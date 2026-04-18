import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import Skeleton from "./skeleton";
import FilterMenu from "./filter-menu";
import SortSelect from "./sort-select";
import Pagination from "../../pagination";
import DeleteMiiButton from "../delete-mii-button";
import { Icon } from "@iconify/react";
import LikeButton from "../../like-button";
import { useStore } from "@nanostores/react";
import { session } from "../../../session";
import Carousel from "../../carousel";

interface ApiResponse {
	totalCount: number;
	miis: any[];
	lastPage: number;
}

interface Props {
	userId?: number;
	parentPage?: "likes" | "admin";
}

export default function MiiList({ parentPage, userId }: Props) {
	const [searchParams] = useSearchParams();
	const [data, setData] = useState<ApiResponse | null>(null);
	const [loading, setLoading] = useState(true);

	const $session = useStore(session);

	useEffect(() => {
		const params = new URLSearchParams(searchParams.toString());
		if (userId) params.append("userId", userId.toString());
		if (parentPage) params.append("parentPage", parentPage);

		fetch(`${import.meta.env.VITE_API_URL}/api/mii/list?${params.toString()}`, { credentials: "include" })
			.then((res) => {
				if (!res.ok) throw new Error("Failed to fetch Miis");
				return res.json();
			})
			.then((data) => {
				setData(data);
				setLoading(false);
			})
			.catch((err) => {
				console.error(err);
				setLoading(false);
			});
	}, [searchParams, userId, parentPage]);

	return (
		<>
			{loading ? (
				<Skeleton />
			) : data ? (
				<div className="w-full">
					<div className="bg-amber-50 border-2 border-amber-500 rounded-2xl shadow-lg p-4 flex justify-between items-center gap-2 mb-2 max-md:flex-col">
						<div className="flex items-center gap-2">
							<span className="text-2xl font-bold text-amber-900">{data.totalCount}</span>
							<span className="text-lg text-amber-700">{data.totalCount === 1 ? "Mii" : "Miis"}</span>
						</div>

						<div className="relative flex items-center justify-end gap-2 w-full md:max-w-2/3 max-md:justify-center">
							<FilterMenu />
							<SortSelect />
						</div>
					</div>

					<div className="grid grid-cols-4 gap-4 max-lg:grid-cols-3 max-md:grid-cols-2 max-[30rem]:grid-cols-1">
						{data.miis.map((mii) => (
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

								{parentPage !== "admin" ? (
									<Link to={`/mii/${mii.id}`} className="overflow-hidden rounded-xl bg-zinc-300 shrink-0">
										<img
											src={`${import.meta.env.VITE_API_URL}/mii/${mii.id}/image?type=mii`}
											width={240}
											height={160}
											alt="mii image"
											className="w-full h-auto aspect-3/2 object-contain"
										/>
									</Link>
								) : (
									<Carousel
										images={[
											`${import.meta.env.VITE_API_URL}/mii/${mii.id}/image?type=mii`,
											...(mii.platform === "THREE_DS"
												? [`${import.meta.env.VITE_API_URL}/mii/${mii.id}/image?type=qr-code`]
												: [`${import.meta.env.VITE_API_URL}/mii/${mii.id}/image?type=features`]),
											...Array.from({ length: mii.imageCount }, (_, index) => `${import.meta.env.VITE_API_URL}/mii/${mii.id}/image?type=image${index}`),
										]}
									/>
								)}

								<div className="p-4 flex flex-col gap-1 h-full">
									<div className="flex justify-between">
										<Link to={`/mii/${mii.id}`} className="relative font-bold text-2xl line-clamp-1 w-full text-ellipsis wrap-break-word" title={mii.name}>
											{mii.name}
										</Link>
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
											<Link to={`?tags=${tag}`} key={tag} className="px-2 py-1 bg-orange-300 rounded-full text-xs">
												{tag}
											</Link>
										))}
									</div>

									<div className="mt-auto grid grid-cols-2 items-center">
										<LikeButton likes={mii._count.likedBy} miiId={mii.id} isLiked={false} abbreviate />

										{!userId && (
											<Link to={`/profile/${mii.user?.id}`} className="text-sm text-right overflow-hidden text-ellipsis whitespace-nowrap">
												@{mii.user?.name}
											</Link>
										)}

										{userId && Number($session?.user?.id) == userId && (
											<div className="flex gap-1 text-2xl justify-end text-zinc-400">
												<Link to={`/edit/${mii.id}`} title="Edit Mii" aria-label="Edit Mii" data-tooltip="Edit">
													<Icon icon="mdi:pencil" />
												</Link>
												<DeleteMiiButton miiId={mii.id} miiName={mii.name} likes={mii._count.likedBy} />
											</div>
										)}

										{/* Admin Controls */}
										{parentPage === "admin" && (
											<div className="flex justify-between w-full col-span-2 mt-2">
												<div className="flex gap-1 text-3xl justify-center">
													<button
														onClick={async () => {
															await fetch(`${import.meta.env.VITE_API_URL}/api/admin/accept-mii?id=${mii.id}`, { method: "POST", credentials: "include" });
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
					<Pagination lastPage={data.lastPage} />
				</div>
			) : (
				<p>No Miis found, has the server died?</p>
			)}
		</>
	);
}
