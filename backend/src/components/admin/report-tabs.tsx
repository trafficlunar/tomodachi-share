"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { ReportStatus } from "@prisma/client";

export default function ReportTabs({ status }: { status?: ReportStatus }) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();

	return (
		<div className={`flex gap-2 p-3 border-b border-orange-300 transition-opacity ${isPending ? "opacity-50" : ""}`}>
			{["ALL", "OPEN", "RESOLVED", "DISMISSED"].map((s) => (
				<button
					key={s}
					onClick={() =>
						startTransition(() => {
							router.push(s === "ALL" ? "/admin" : `/admin?status=${s}`, { scroll: false });
						})
					}
					className={`text-sm px-3 py-1 rounded-full font-medium cursor-pointer border transition-colors ${
						(s === "ALL" && !status) || s === status
							? "bg-orange-400 text-white border-orange-400"
							: "bg-white text-orange-700 border-orange-300 hover:bg-orange-50"
					}`}
				>
					{s}
				</button>
			))}
		</div>
	);
}
