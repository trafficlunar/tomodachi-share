import { headers } from "next/headers";
import { Icon } from "@iconify/react";

export default async function RedirectBanner() {
	const headersList = await headers();
	const referer = headersList.get("Referer");

	if (referer !== "https://tomodachi-share.trafficlunar.net") return null;

	return (
		<div className="w-full h-10 bg-orange-300 border-y-2 border-y-orange-400 mt-1 shadow-md flex justify-center items-center gap-2 text-orange-900 text-nowrap overflow-x-auto font-semibold max-sm:justify-start">
			<Icon icon="humbleicons:link" className="text-2xl min-w-6" />
			<span>
				You&apos;ve been redirected — TomodachiShare is now at <strong>tomodachishare.com</strong>!
			</span>
		</div>
	);
}
