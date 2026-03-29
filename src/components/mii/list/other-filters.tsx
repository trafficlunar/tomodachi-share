"use client";

import { Icon } from "@iconify/react";
import { MiiPlatform } from "@prisma/client";
import { useRouter, useSearchParams } from "next/navigation";
import { ChangeEvent, useState, useTransition } from "react";

export default function OtherFilters() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [, startTransition] = useTransition();

	const platform = (searchParams.get("platform") as MiiPlatform) || undefined;
	const [allowCopying, setAllowCopying] = useState<boolean>((searchParams.get("allowCopying") as unknown as boolean) ?? false);
	const [quarantined, setQuarantined] = useState<boolean>((searchParams.get("quarantined") as unknown as boolean) ?? false);

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

	const handleChangeQuarantined = (e: ChangeEvent<HTMLInputElement>) => {
		setQuarantined(e.target.checked);

		const params = new URLSearchParams(searchParams);
		params.set("page", "1");

		if (!quarantined) {
			params.set("quarantined", "true");
		} else {
			params.delete("quarantined");
		}

		startTransition(() => {
			router.push(`?${params.toString()}`, { scroll: false });
		});
	};

	return (
		<>
			{platform === "THREE_DS" && (
				<div className="flex justify-between items-center w-full">
					<label htmlFor="allowCopying" className="text-sm">
						Allow Copying
					</label>
					<input type="checkbox" id="allowCopying" className="checkbox-alt" checked={allowCopying} onChange={handleChangeAllowCopying} />
				</div>
			)}
			<div className="flex justify-between items-center w-full">
				<label htmlFor="quarantined" className="text-sm">
					Show Controversial Miis
				</label>
				<input type="checkbox" id="quarantined" className="checkbox-alt" checked={quarantined} onChange={handleChangeQuarantined} />
			</div>
		</>
	);
}
