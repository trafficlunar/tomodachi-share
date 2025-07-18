"use client";

import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";

import { useCallback, useMemo } from "react";
import { Icon } from "@iconify/react";

interface Props {
	lastPage: number;
}

export default function Pagination({ lastPage }: Props) {
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const page = Number(searchParams.get("page") ?? 1);

	const createPageUrl = useCallback(
		(pageNumber: number) => {
			const params = new URLSearchParams(searchParams);
			params.set("page", pageNumber.toString());
			return `${pathname}?${params.toString()}`;
		},
		[searchParams, pathname]
	);

	const numbers = useMemo(() => {
		const result = [];

		// Always show 5 pages, centering around the current page when possible
		const start = Math.max(1, Math.min(page - 2, lastPage - 4));
		const end = Math.min(lastPage, start + 4);

		for (let i = start; i <= end; i++) result.push(i);

		return result;
	}, [page, lastPage]);

	return (
		<div className="flex justify-center items-center w-full mt-8">
			{/* Go to first page */}
			<Link
				href={page === 1 ? "#" : createPageUrl(1)}
				aria-label="Go to First Page"
				aria-disabled={page === 1}
				tabIndex={page === 1 ? -1 : undefined}
				className={`pill button !bg-orange-100 !p-0.5 aspect-square text-2xl ${
					page === 1 ? "pointer-events-none opacity-50" : "hover:!bg-orange-400"
				}`}
			>
				<Icon icon="stash:chevron-double-left" />
			</Link>

			{/* Previous page */}
			<Link
				href={page === 1 ? "#" : createPageUrl(page - 1)}
				aria-label="Go to Previous Page"
				aria-disabled={page === 1}
				tabIndex={page === 1 ? -1 : undefined}
				className={`pill !bg-orange-100 !p-0.5 aspect-square text-2xl ${page === 1 ? "pointer-events-none opacity-50" : "hover:!bg-orange-400"}`}
			>
				<Icon icon="stash:chevron-left" />
			</Link>

			{/* Page numbers */}
			<div className="flex mx-2">
				{numbers.map((number) => (
					<Link
						key={number}
						href={createPageUrl(number)}
						aria-label={`Go to Page ${number}`}
						aria-current={number === page ? "page" : undefined}
						className={`pill !p-0 w-8 h-8 text-center !rounded-md ${number == page ? "!bg-orange-400" : "!bg-orange-100 hover:!bg-orange-400"}`}
					>
						{number}
					</Link>
				))}
			</div>

			{/* Next page */}
			<Link
				href={page === lastPage ? "#" : createPageUrl(page + 1)}
				aria-label="Go to Next Page"
				aria-disabled={page === lastPage}
				tabIndex={page === lastPage ? -1 : undefined}
				className={`pill button !bg-orange-100 !p-0.5 aspect-square text-2xl ${
					page === lastPage ? "pointer-events-none opacity-50" : "hover:!bg-orange-400"
				}`}
			>
				<Icon icon="stash:chevron-right" />
			</Link>

			{/* Go to last page */}
			<Link
				href={page === lastPage ? "#" : createPageUrl(lastPage)}
				aria-label="Go to Last Page"
				aria-disabled={page === lastPage}
				tabIndex={page === lastPage ? -1 : undefined}
				className={`pill button !bg-orange-100 !p-0.5 aspect-square text-2xl ${
					page === lastPage ? "pointer-events-none opacity-50" : "hover:!bg-orange-400"
				}`}
			>
				<Icon icon="stash:chevron-double-right" />
			</Link>
		</div>
	);
}
