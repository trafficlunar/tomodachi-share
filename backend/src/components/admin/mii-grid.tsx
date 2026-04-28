"use client";

import { Icon } from "@iconify/react";
import { Prisma } from "@prisma/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Pagination from "../pagination";

interface Props {
	miis: Prisma.MiiGetPayload<{ include: { user: { select: { id: true; name: true } } } }>[];
	totalCount: number;
	lastPage: number;
}

export default function MiiGrid({ miis, totalCount, lastPage }: Props) {
	const router = useRouter();

	const acceptMii = async (id: number) => {
		await fetch(`/api/admin/accept-mii?id=${id}`, { method: "POST" });
	};

	const acceptMany = async (ids: number[]) => {
		await Promise.all(ids.map((id) => fetch(`/api/admin/accept-mii?id=${id}`, { method: "POST" })));
	};

	const rows: (typeof miis)[] = [];
	for (let i = 0; i < miis.length; i += 4) rows.push(miis.slice(i, i + 4));

	return (
		<div className="w-full">
			<div className="bg-amber-50 border-2 border-amber-500 rounded-2xl shadow-lg p-4 flex justify-between items-center gap-2 mb-2 max-md:flex-col">
				<div className="flex items-center gap-2">
					<span className="text-2xl font-bold text-amber-900">{totalCount}</span>
					<span className="text-lg text-amber-700">{totalCount === 1 ? "Mii" : "Miis"}</span>
				</div>
				<button
					onClick={() => acceptMany(miis.map((m) => m.id))}
					className="cursor-pointer text-sm font-semibold text-white bg-green-500 hover:bg-green-600 transition-colors px-4 py-2 rounded-xl shadow flex items-center gap-2"
				>
					<Icon icon="material-symbols:check-circle-rounded" />
					Accept all ({miis.length})
				</button>
			</div>

			<div className="flex flex-col gap-2">
				{rows.map((row, rowIndex) => (
					<div key={rowIndex} className="flex flex-col gap-2">
						<div className="flex justify-end">
							<button
								onClick={() => acceptMany(row.map((m) => m.id))}
								className="cursor-pointer text-xs text-zinc-400 hover:text-green-500 border border-zinc-200 hover:border-green-500 bg-white px-2 py-1 rounded-md shadow-sm flex items-center gap-1"
							>
								<Icon icon="material-symbols:check-circle-outline-rounded" />
								Accept row
							</button>
						</div>
						<div className="grid grid-cols-4 gap-4 max-lg:grid-cols-3 max-md:grid-cols-2 max-[30rem]:grid-cols-1">
							{row.map((mii) => (
								<div
									key={mii.id}
									className={`flex flex-col relative bg-zinc-50 border-zinc-300 rounded-3xl border-2 shadow-lg p-[0.8rem] transition hover:scale-105 hover:bg-cyan-100 hover:border-cyan-600 ${mii.quarantined ? "border-red-300 bg-red-50!" : ""}`}
								>
									<div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
										{mii.in_queue && (
											<div className="bg-zinc-500 text-white text-xs font-semibold px-2 py-1 rounded-full shadow-sm flex items-center gap-1 w-fit">
												<Icon icon="mdi:clock-outline" className="text-base" />
												In Queue
											</div>
										)}
										{mii.needsFixing && (
											<div className="bg-orange-500 text-white text-xs font-semibold px-2 py-1 rounded-full shadow-sm flex items-center gap-1 w-fit">
												<Icon icon="mdi:alert-outline" className="text-base" />
												Needs Fixing
											</div>
										)}
									</div>

									<div className="grid grid-cols-2 gap-1 rounded-xl bg-zinc-200">
										{[
											`/mii/${mii.id}/image?type=mii`,
											mii.platform === "THREE_DS" ? `/mii/${mii.id}/image?type=qr-code` : `/mii/${mii.id}/image?type=features`,
											...Array.from({ length: mii.imageCount }, (_, i) => `/mii/${mii.id}/image?type=image${i}`),
										].map((src, i) => (
											<img key={i} src={src} alt="mii image" className="w-full bg-zinc-200" />
										))}
									</div>

									<div className="p-4 flex flex-col gap-1 h-full">
										<div className="flex justify-between items-center">
											<Link
												href={`${process.env.NEXT_PUBLIC_FRONTEND_URL}/mii/${mii.id}`}
												className="relative font-bold text-2xl line-clamp-1 w-full text-ellipsis wrap-break-word"
												title={mii.name}
											>
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
											{mii.tags.map((tag: string) => (
												<Link href={{ query: { tags: tag } }} key={tag} className="px-2 py-1 bg-orange-300 rounded-full text-xs">
													{tag}
												</Link>
											))}
										</div>

										<div className="mt-auto grid grid-cols-2 items-center">
											<Link
												href={`${process.env.NEXT_PUBLIC_FRONTEND_URL}/profile/${mii.user?.id}`}
												className="text-sm text-right overflow-hidden text-ellipsis whitespace-nowrap"
											>
												@{mii.user?.name}
											</Link>

											<div className="flex justify-between w-full col-span-2 mt-2">
												<div className="flex gap-1 text-3xl justify-center">
													<button
														onClick={() => acceptMii(mii.id)}
														className="cursor-pointer text-zinc-400 hover:text-green-500 transition-colors p-1 bg-white rounded-md shadow-sm border border-zinc-200 hover:border-green-500"
														title="Accept Mii"
													>
														<Icon icon="material-symbols:check-rounded" />
													</button>
												</div>

												<span className="text-sm w-1/2 text-right">{mii.createdAt.toLocaleString("en-GB", { timeZone: "UTC" })}</span>
											</div>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				))}
			</div>
			<Pagination lastPage={lastPage} />
		</div>
	);
}
