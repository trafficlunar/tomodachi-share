import Link from "next/link";

export default function NotFound() {
	return (
		<div className="flex flex-col items-center">
			<h2 className="text-7xl font-black">404</h2>
			<p className="text-xl">Page not found</p>
			<Link href="/" className="pill button mt-8">
				Return Home
			</Link>
		</div>
	);
}
