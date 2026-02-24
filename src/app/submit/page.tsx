import { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";

import { Icon } from "@iconify/react";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import SubmitForm from "@/components/submit-form";

export const metadata: Metadata = {
	title: "Submit a Mii - TomodachiShare",
	description: "Upload your Tomodachi Life Mii through its QR code and share it with others",
	robots: {
		index: false,
		follow: false,
	},
};

export default async function SubmitPage() {
	const session = await auth();

	if (!session) redirect("/login");
	if (!session.user.username) redirect("/create-username");
	const activePunishment = await prisma.punishment.findFirst({
		where: {
			userId: Number(session?.user.id),
			returned: false,
		},
	});
	if (activePunishment) redirect("/off-the-island");

	// Check if submissions are disabled
	let value: boolean | null = true;
	try {
		const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/can-submit`);
		value = await response.json();
	} catch (error) {
		return <p>An error occurred!</p>;
	}

	if (!value)
		return (
			<div className="grow flex items-center justify-center">
				<div className="bg-amber-50 border-2 border-amber-500 rounded-2xl shadow-lg p-8 max-w-xs w-full text-center flex flex-col">
					<h2 className="text-5xl font-black">Sorry</h2>
					<p className="mt-1">Submissions are disabled</p>
					<Link href="/" aria-label="Return to Home Page" className="pill button gap-2 mt-8 w-fit self-center">
						<Icon icon="ic:round-home" fontSize={24} />
						Return Home
					</Link>
				</div>
			</div>
		);

	return <SubmitForm />;
}
