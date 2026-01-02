"use client";

import Image from "next/image";
import { redirect } from "next/navigation";

import { useState } from "react";
import { Mii, ReportReason } from "@prisma/client";

import ReasonSelector from "./reason-selector";
import SubmitButton from "../submit-button";
import LikeButton from "../like-button";

interface Props {
	mii: Mii;
	likes: number;
}

export default function ReportMiiForm({ mii, likes }: Props) {
	const [reason, setReason] = useState<ReportReason>();
	const [notes, setNotes] = useState<string>();
	const [error, setError] = useState<string | undefined>(undefined);

	const handleSubmit = async () => {
		const response = await fetch(`/api/report`, {
			method: "POST",
			body: JSON.stringify({ id: mii.id, type: "mii", reason: reason?.toLowerCase(), notes }),
		});
		const { error } = await response.json();

		if (!response.ok) {
			setError(error);
			return;
		}

		redirect(`/`);
	};

	return (
		<div className="bg-amber-50 border-2 border-amber-500 rounded-2xl shadow-lg p-4 flex flex-col gap-4 w-full max-w-2xl">
			<div>
				<h2 className="text-2xl font-bold">Report a Mii</h2>
				<p className="text-sm text-zinc-500">If you encounter a rule-breaking Mii, please report it here</p>
			</div>

			<hr className="border-zinc-300" />

			<div className="bg-orange-100 rounded-xl border-2 border-orange-400 flex">
				<Image src={`/mii/${mii.id}/image?type=mii`} alt="mii image" width={128} height={128} />
				<div className="p-4">
					<p className="text-xl font-bold line-clamp-1">{mii.name}</p>
					<LikeButton likes={likes} isLiked={true} disabled />
				</div>
			</div>

			<div className="w-full grid grid-cols-3 items-center">
				<label htmlFor="reason" className="font-semibold">
					Reason
				</label>
				<ReasonSelector reason={reason} setReason={setReason} />
			</div>

			<div className="w-full grid grid-cols-3">
				<label htmlFor="reason-note" className="font-semibold">
					Reason notes
				</label>
				<textarea
					rows={3}
					maxLength={256}
					placeholder="Type notes here for the report..."
					className="pill input rounded-xl! resize-none col-span-2"
					value={notes}
					onChange={(e) => setNotes(e.target.value)}
				/>
			</div>

			<hr className="border-zinc-300" />
			<div className="flex justify-between items-center">
				{error && <span className="text-red-400 font-bold">Error: {error}</span>}

				<SubmitButton onClick={handleSubmit} className="ml-auto" />
			</div>
		</div>
	);
}
