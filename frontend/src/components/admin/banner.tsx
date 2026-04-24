import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { useSearchParams } from "react-router";

interface ApiResponse {
	message: string;
}

function RedirectBanner() {
	const [searchParams] = useSearchParams();
	const from = searchParams.get("from");
	if (from !== "old-domain") return null;

	return (
		<div className="w-full h-10 bg-orange-300 border-y-2 border-y-orange-400 mt-1 pl-2 shadow-md flex justify-center items-center gap-2 text-orange-900 text-nowrap overflow-x-auto font-semibold max-sm:justify-start dark:bg-slate-700 dark:border-y-slate-600 dark:text-slate-100">
			<Icon icon="humbleicons:link" className="text-2xl min-w-6" />
			<span>We have moved URLs, welcome to tomodachishare.com!</span>
		</div>
	);
}

export default function AdminBanner() {
	const [message, setMessage] = useState<string | null>(null);
	const [shouldShow, setShouldShow] = useState(false);

	useEffect(() => {
		fetch(`${import.meta.env.VITE_API_URL}/api/admin/banner`)
			.then((res) => {
				if (!res.ok) throw new Error("Failed to get admin banner");
				return res.json() as Promise<ApiResponse>;
			})
			.then((data) => {
				if (!data.message) return;
				const closedBanner = localStorage.getItem("closedBanner");
				setMessage(data.message);
				setShouldShow(data.message !== closedBanner);
			})
			.catch((err) => {
				console.error(err);
			});
	}, []);

	const handleClose = () => {
		if (!message) return;

		// Close banner and remember it
		localStorage.setItem("closedBanner", message);
		setShouldShow(false);
	};

	return (
		<>
			{shouldShow && message && (
				<div className="relative w-full min-h-10 bg-orange-300 border-y-2 border-y-orange-400 mt-1 pl-2 shadow-md flex justify-center text-orange-900 text-nowrap overflow-x-auto font-semibold max-sm:justify-between dark:bg-slate-700 dark:border-y-slate-600 dark:text-slate-100">
					<div className="flex gap-2 h-full items-center w-fit">
						<Icon icon="humbleicons:exclamation" className="text-2xl min-w-6" />
						<span>{message}</span>
					</div>

					<button onClick={handleClose} className="sm:absolute right-2 cursor-pointer p-1.5">
						<Icon icon="humbleicons:times" className="text-2xl min-w-6" />
					</button>
				</div>
			)}
			<RedirectBanner />
		</>
	);
}
