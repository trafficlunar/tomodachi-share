import type { MiiPlatform } from "@tomodachi-share/shared";
import { type ChangeEvent, useState, useTransition } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router";

export default function OtherFilters() {
	const location = useLocation();
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const [, startTransition] = useTransition();

	const platform = (searchParams.get("platform") as MiiPlatform) || undefined;
	const [hasShareMiiFile, setHasShareMiiFile] = useState<boolean>((searchParams.get("sharemii") as unknown as boolean) ?? false);
	const [allowCopying, setAllowCopying] = useState<boolean>((searchParams.get("allowCopying") as unknown as boolean) ?? false);
	const [quarantined, setQuarantined] = useState<boolean>((searchParams.get("quarantined") as unknown as boolean) ?? false);

	const handleChangeHasShareMiiFile = (e: ChangeEvent<HTMLInputElement>) => {
		setHasShareMiiFile(e.target.checked);

		const params = new URLSearchParams(searchParams);
		params.set("page", "1");

		if (!hasShareMiiFile) {
			params.set("isFromSaveFile", "true");
		} else {
			params.delete("isFromSaveFile");
		}

		startTransition(() => {
			navigate(`?${params.toString()}`);
		});
	};

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
			navigate(`?${params.toString()}`);
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
			navigate(`?${params.toString()}`);
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

			{platform !== "THREE_DS" && (
				<div className="flex justify-between items-center w-full mb-1">
					<label htmlFor="ltdfile" className="text-sm">
						Has ShareMii File
					</label>
					<input type="checkbox" id="ltdfile" className="checkbox-alt" checked={hasShareMiiFile} onChange={handleChangeHasShareMiiFile} />
				</div>
			)}
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
