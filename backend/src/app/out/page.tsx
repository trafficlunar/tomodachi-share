import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Icon } from "@iconify/react";

export const metadata: Metadata = {
	title: "Leaving TomodachiShare",
	description: "Warning: You are leaving TomodachiShare, proceed with caution",
};

interface Props {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function LinkOutPage({ searchParams }: Props) {
	const url = (await searchParams).url;
	if (!url || Array.isArray(url)) redirect("/");

	let parsed: URL;
	try {
		parsed = new URL(url);
	} catch {
		redirect("/"); // redirect if URL is invalid
	}

	// Next.js doesn't allow attacks like these but you can never be too safe
	if (!["http:", "https:"].includes(parsed.protocol)) redirect("/");

	const isSafe = Array.from(SAFE_LINKS).some((domain) => parsed.hostname === domain || parsed.hostname.endsWith(`.${domain}`));
	if (isSafe) redirect(url);

	return (
		<div className="grow flex items-center justify-center">
			<div className="bg-amber-50 border-2 border-amber-500 rounded-2xl shadow-lg py-8 px-6 max-w-md w-full text-center flex flex-col items-center">
				<h2 className="text-3xl font-black flex items-center gap-2 mb-1">
					<Icon icon="mingcute:alert-fill" className="text-5xl" />
					Warning
				</h2>
				<p>You're attempting to leave TomodachiShare island! The destination website is potentially dangerous.</p>

				<div className="bg-zinc-100 border border-zinc-300 rounded-md p-2 break-all w-full mt-4">
					<code className="font-mono text-sm">{url}</code>
				</div>

				<div className="flex justify-center gap-2">
					<Link href="/" className="pill button gap-2 mt-8 w-fit self-center bg-zinc-100! border-zinc-300! hover:bg-zinc-300!">
						<Icon icon="ic:round-home" fontSize={24} />
						Travel Back
					</Link>
					<Link href={url} target="_blank" rel="noopener noreferrer" className="pill button gap-2 mt-8 w-fit self-center">
						<Icon icon="ic:round-open-in-new" fontSize={21} />
						Continue
					</Link>
				</div>
			</div>
		</div>
	);
}

const SAFE_LINKS = new Set([
	"tomodachishare.com",
	"trafficlunar.net",
	"youtube.com",
	"youtu.be",
	"twitter.com",
	"x.com",
	"reddit.com",
	"tiktok.com",
	"tumblr.com",
	"instagram.com",
	"wikipedia.org",
]);
