"use client";

import useSWR from "swr";
import { Icon } from "@iconify/react";

interface ApiResponse {
	message: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AdminBanner() {
	const { data } = useSWR<ApiResponse>("/api/admin/banner", fetcher);
	if (!data || !data.message) return null;

	return (
		<div className="w-full h-10 bg-orange-300 border-y-2 border-y-orange-400 mt-1 shadow-md flex justify-center items-center gap-2 text-orange-900 font-semibold">
			<Icon icon="humbleicons:exclamation" className="text-2xl" />
			<span>{data.message}</span>
		</div>
	);
}
