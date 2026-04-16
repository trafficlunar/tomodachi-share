import type { MiiPlatform } from "@tomodachi-share/shared";
import { type ChangeEvent, useState, useTransition } from "react";

export default function OtherFilters() {
	const searchParams = new URLSearchParams(window.location.search);
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
			// router.push(`?${params.toString()}`, { scroll: false });
			window.location.href = `?${params.toString()}`;
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
			// router.push(`?${params.toString()}`, { scroll: false });
			window.location.href = `?${params.toString()}`;
		});
	};

	const showAllowCopying = platform !== "SWITCH";
	const showQuarantined = !location.pathname.startsWith("/profile");

	if (!showAllowCopying && !showQuarantined) return null;

	return (
		<>
			<div className="flex items-center gap-4 text-zinc-500 text-sm font-medium w-full mt-2 mb-1">
				<hr className="grow border-zinc-300" />
				<span>Other</span>
				<hr className="grow border-zinc-300" />
			</div>

			{showAllowCopying && (
				<div className="flex justify-between items-center w-full mb-1">
					<label htmlFor="allowCopying" className="text-sm">
						Allow Copying
					</label>
					<input type="checkbox" id="allowCopying" className="checkbox-alt" checked={allowCopying} onChange={handleChangeAllowCopying} />
				</div>
			)}
			{showQuarantined && (
				<div className="flex justify-between items-center w-full">
					<label htmlFor="quarantined" className="text-sm">
						Show Controversial Miis
					</label>
					<input type="checkbox" id="quarantined" className="checkbox-alt" checked={quarantined} onChange={handleChangeQuarantined} />
				</div>
			)}
		</>
	);
}
