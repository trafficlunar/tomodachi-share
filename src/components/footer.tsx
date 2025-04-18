import Link from "next/link";

export default function Footer() {
	return (
		<footer className="mt-auto text-xs flex flex-col justify-center gap-y-0.5 gap-2 text-black/50 p-8 *:text-center">
			<div className="flex justify-center gap-2">
				<span>tomodachishare is not affiliated with nintendo</span>
			</div>

			<div className="flex justify-center gap-2">
				<Link href="/terms-of-service">terms of service</Link>
				<span>&bull;</span>
				<Link href="/privacy">privacy</Link>
				<span>&bull;</span>
				<a href="https://github.com/trafficlunar/tomodachi-share">source code</a>
				<span>&bull;</span>
				<a href="https://trafficlunar.net">
					made by <span className="text-orange-400">trafficlunar</span>
				</a>
			</div>
		</footer>
	);
}
