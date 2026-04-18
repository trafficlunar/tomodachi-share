import { useState } from "react";

export default function BannerForm() {
	const [message, setMessage] = useState("");
	const API_URL = import.meta.env.VITE_API_URL;

	const onClickClear = async () => {
		await fetch(`${API_URL}/api/admin/banner`, { method: "DELETE", credentials: "include" }); // TODO
	};

	const onClickSet = async () => {
		await fetch(`${API_URL}/api/admin/banner`, { method: "POST", body: message, credentials: "include" });
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
