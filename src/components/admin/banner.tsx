"use client";

import { useSearchParams } from "next/navigation";
import useSWR from "swr";
import { Icon } from "@iconify/react";

interface ApiResponse {
	message: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const Banner = ({ icon, message }: { icon: string; message: string }) => (
	<div className="w-full h-10 bg-orange-300 border-y-2 border-y-orange-400 mt-1 shadow-md flex justify-center items-center gap-2 text-orange-900 text-nowrap overflow-x-auto font-semibold max-sm:justify-start">
		<Icon icon={icon} className="text-2xl min-w-6" />
		<span>{message}</span>
	</div>
);

export default function AdminBanner() {
	const searchParams = useSearchParams();
	const from = searchParams.get("from");

	const { data } = useSWR<ApiResponse>("/api/admin/banner", fetcher);

	return (
		<>
			{data && data.message && <Banner icon="humbleicons:exclamation" message={data.message} />}
			{from == "old-domain" && <Banner icon="humbleicons:link" message="We have moved URLs, welcome to tomodachishare.com!" />}
		</>
	);
}
