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
		<div className="w-full h-10 bg-orange-300 border-y-2 border-y-orange-400 mt-1 shadow-md flex justify-center items-center gap-2 text-orange-900 text-nowrap overflow-x-auto font-semibold max-sm:justify-start">
			<Icon icon="humbleicons:exclamation" className="text-2xl min-w-6" />
			<span>{data.message}</span>
		</div>
	);
}
