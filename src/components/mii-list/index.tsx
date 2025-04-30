"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import useSWR from "swr";

import { Icon } from "@iconify/react";

import Skeleton from "./skeleton";
import FilterSelect from "./filter-select";
import SortSelect from "./sort-select";
import Carousel from "../carousel";
import LikeButton from "../like-button";
import DeleteMiiButton from "../delete-mii";
import Pagination from "./pagination";

interface Props {
	isLoggedIn: boolean;
	// Profiles
	userId?: number;
	sessionUserId?: number;
}

interface ApiResponse {
	total: number;
	filtered: number;
	lastPage: number;
	miis: {
		id: number;
		user?: {
			id: number;
			username: string;
		};
		name: string;
		imageCount: number;
		tags: string[];
		createdAt: string;
		likes: number;
		isLiked: boolean;
	}[];
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function MiiList({ isLoggedIn, userId, sessionUserId }: Props) {
	const searchParams = useSearchParams();
	const { data, error } = useSWR<ApiResponse>(`/api/mii/list?${searchParams.toString()}`, fetcher);

	return (
		<div className="w-full">
			<div className="flex justify-between items-end mb-2 max-[32rem]:flex-col max-[32rem]:items-center">
				<p className="text-lg">
					{data ? (
						data.total == data.filtered ? (
							<>
								<span className="font-extrabold">{data.total}</span> Miis
							</>
						) : (
							<>
								<span className="font-extrabold">{data.filtered}</span> of <span className="font-extrabold">{data.total}</span> Miis
							</>
						)
					) : (
						<>
							<span className="font-extrabold">0</span> Miis
						</>
					)}
				</p>

				<div className="flex gap-2">
					<FilterSelect />
					<SortSelect />
				</div>
			</div>

			{data ? (
				data.miis.length > 0 ? (
					<div className="grid grid-cols-4 gap-4 max-lg:grid-cols-3 max-sm:grid-cols-2 max-[25rem]:grid-cols-1">
						{data.miis.map((mii) => (
							<div
								key={mii.id}
								className="flex flex-col bg-zinc-50 rounded-3xl border-2 border-zinc-300 shadow-lg p-3 transition hover:scale-105 hover:bg-cyan-100 hover:border-cyan-600"
							>
								<Carousel
									images={[
										`/mii/${mii.id}/image?type=mii`,
										`/mii/${mii.id}/image?type=qr-code`,
										...Array.from({ length: mii.imageCount }, (_, index) => `/mii/${mii.id}/image?type=image${index}`),
									]}
								/>

								<div className="p-4 flex flex-col gap-1 h-full">
									<Link href={`/mii/${mii.id}`} className="font-bold text-2xl line-clamp-1" title={mii.name}>
										{mii.name}
									</Link>
									<div id="tags" className="flex flex-wrap gap-1">
										{mii.tags.map((tag) => (
											<Link href={{ query: { tags: tag } }} key={tag} className="px-2 py-1 bg-orange-300 rounded-full text-xs">
												{tag}
											</Link>
										))}
									</div>

									<div className="mt-auto grid grid-cols-2 items-center">
										<LikeButton likes={mii.likes} miiId={mii.id} isLiked={mii.isLiked} isLoggedIn={isLoggedIn} abbreviate />

										{!userId && (
											<Link href={`/profile/${mii.user?.id}`} className="text-sm text-right overflow-hidden text-ellipsis">
												@{mii.user?.username}
											</Link>
										)}

										{userId && sessionUserId == userId && (
											<div className="flex gap-1 text-2xl justify-end text-zinc-400">
												<Link href={`/edit/${mii.id}`} title="Edit Mii">
													<Icon icon="mdi:pencil" />
												</Link>
												<DeleteMiiButton miiId={mii.id} miiName={mii.name} likes={mii.likes} />
											</div>
										)}
									</div>
								</div>
							</div>
						))}
					</div>
				) : (
					<p className="text-xl font-semibold text-center mt-10">No results found.</p>
				)
			) : error ? (
				<p className="text-xl text-red-400 font-semibold text-center mt-10">Error: {error}</p>
			) : (
				// Show skeleton when data is loading
				<div className="grid grid-cols-4 gap-4 max-lg:grid-cols-3 max-sm:grid-cols-2 max-[25rem]:grid-cols-1">
					{Array.from({ length: 24 }).map((_, i) => (
						<Skeleton key={i} />
					))}
				</div>
			)}

			{data && <Pagination lastPage={data.lastPage} />}
		</div>
	);
}
