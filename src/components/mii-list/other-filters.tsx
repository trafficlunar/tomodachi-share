"use client";

import { useRouter, useSearchParams } from "next/navigation";
import React, { ChangeEvent, ChangeEventHandler, useState, useTransition } from "react";

export default function OtherFilters() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [, startTransition] = useTransition();

	const [allowCopying, setAllowCopying] = useState<boolean>((searchParams.get("allowCopying") as unknown as boolean) ?? false);

	const handleChangeAllowCopying = (e: ChangeEvent<HTMLInputElement>) => {
		setAllowCopying(e.target.checked);

		const params = new URLSearchParams(searchParams);
		params.set("page", "1");

		if (!allowCopying) {
			params.set("allowCopying", "true");
		} else {
			params.delete("allowCopying");
		}

		startTransition(() => {
			router.push(`?${params.toString()}`, { scroll: false });
		});
	};

	return (
		<div className="flex justify-between items-center w-full">
			<label htmlFor="allowCopying" className="text-sm">
				Allow Copying
			</label>
			<input type="checkbox" name="allowCopying" className="checkbox-alt" checked={allowCopying} onChange={handleChangeAllowCopying} />
		</div>
	);
}
