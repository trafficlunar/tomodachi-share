"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";

import SortSelect from "./sort-select";
import Carousel from "../carousel";
import LikeButton from "../like-button";
import FilterSelect from "./filter-select";

interface Props {
	isLoggedIn: boolean;
	// Profiles
	userId?: number;
}

interface ApiResponse {
	total: number;
	filtered: number;
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

export default function MiiList({ isLoggedIn, userId }: Props) {
	const searchParams = useSearchParams();

	const [data, setData] = useState<ApiResponse>();
	const [error, setError] = useState<string | undefined>();

	const getData = async () => {
		const response = await fetch(`/api/mii/list?${searchParams.toString()}`);
		const data = await response.json();

		if (!response.ok) {
			setError(data.error);
			return;
		}

		setData(data);
	};

	useEffect(() => {
		getData();
	}, [searchParams.toString()]);

	// todo: show skeleton when data is undefined

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
										`/mii/${mii.id}/mii.webp`,
										`/mii/${mii.id}/qr-code.webp`,
										...Array.from({ length: mii.imageCount }, (_, index) => `/mii/${mii.id}/image${index}.webp`),
									]}
								/>

								<div className="p-4 flex flex-col gap-1 h-full">
									<Link href={`/mii/${mii.id}`} className="font-bold text-2xl overflow-hidden text-ellipsis line-clamp-2" title={mii.name}>
										{mii.name}
									</Link>
									<div id="tags" className="flex gap-1 *:px-2 *:py-1 *:bg-orange-300 *:rounded-full *:text-xs">
										{mii.tags.map((tag) => (
											<Link href={{ query: { tags: tag } }} key={tag}>
												{tag}
											</Link>
										))}
									</div>

									<div className="mt-auto grid grid-cols-2 items-center">
										<LikeButton likes={mii.likes} miiId={mii.id} isLiked={mii.isLiked} isLoggedIn={isLoggedIn} />

										{userId == null && (
											<Link href={`/profile/${mii.user?.id}`} className="text-sm text-right overflow-hidden text-ellipsis">
												@{mii.user?.username}
											</Link>
										)}
									</div>
								</div>
							</div>
						))}
					</div>
				) : (
					<p className="text-xl font-semibold text-center mt-10">No results found.</p>
				)
			) : (
				<>{error && <p className="text-xl text-red-400 font-semibold text-center mt-10">Error: {error}</p>}</>
			)}
		</div>
	);
}
