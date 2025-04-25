import Link from "next/link";
import { Icon } from "@iconify/react";
import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Not Found - TomodachiShare",
	description: "The requested page could not be found on TomodachiShare",
};

export default function NotFound() {
	return (
		<div className="flex-grow flex items-center justify-center">
			<div className="bg-amber-50 border-2 border-amber-500 rounded-2xl shadow-lg p-8 max-w-xs w-full text-center flex flex-col">
				<h2 className="text-7xl font-black">404</h2>
				<p>Page not found</p>
				<Link href="/" className="pill button gap-2 mt-8 w-fit self-center">
					<Icon icon="ic:round-home" fontSize={24} />
					Return Home
				</Link>
			</div>
		</div>
	);
}
