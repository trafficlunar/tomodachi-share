"use client";

import { useState } from "react";

export default function BannerForm() {
	const [message, setMessage] = useState("");

	const onClickClear = async () => {
		await fetch("/api/admin/banner", { method: "DELETE" });
	};

	const onClickSet = async () => {
		await fetch("/api/admin/banner", { method: "POST", body: message });
	};

	return (
		<div className="bg-orange-100 rounded-xl border-2 border-orange-400 p-2 flex gap-2">
			<input type="text" className="pill input w-full" placeholder="Enter banner text" value={message} onChange={(e) => setMessage(e.target.value)} />
			<button type="button" className="pill button" onClick={onClickClear}>
				Clear
			</button>
			<button type="submit" className="pill button" onClick={onClickSet}>
				Set
			</button>
		</div>
	);
}
