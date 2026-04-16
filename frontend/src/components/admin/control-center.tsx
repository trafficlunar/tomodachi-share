// import { settings } from "@/lib/settings";
// import { useState } from "react";

// export default function ControlCenter() {
// 	const [canSubmit, setCanSubmit] = useState(settings.canSubmit);
// 	const [isQueueEnabled, setIsQeueueEnabled] = useState(settings.queueEnabled);

// 	const onClickSet = async () => {
// 		await fetch("/api/admin/can-submit", { method: "PATCH", body: JSON.stringify(canSubmit) });
// 		await fetch("/api/admin/queue", { method: "PATCH", body: JSON.stringify(isQueueEnabled) });
// 	};

// 	return (
// 		<div className="bg-orange-100 rounded-xl border-2 border-orange-400 p-2 flex flex-col gap-2">
// 			<div className="flex items-center gap-2">
// 				<input
// 					id="submit"
// 					type="checkbox"
// 					className="checkbox size-6!"
// 					placeholder="Enter banner text"
// 					checked={canSubmit}
// 					onChange={(e) => setCanSubmit(e.target.checked)}
// 				/>
// 				<label htmlFor="submit">Enable Submissions</label>
// 			</div>
// 			<div className="flex items-center gap-2">
// 				<input
// 					id="queue"
// 					type="checkbox"
// 					className="checkbox size-6!"
// 					placeholder="Enter banner text"
// 					checked={isQueueEnabled}
// 					onChange={(e) => setIsQeueueEnabled(e.target.checked)}
// 				/>
// 				<label htmlFor="queue">Enable Queue</label>
// 			</div>

// 			<div className="flex gap-2 self-end">
// 				<button type="submit" className="pill button" onClick={onClickSet}>
// 					Set
// 				</button>
// 			</div>
// 		</div>
// 	);
// }
