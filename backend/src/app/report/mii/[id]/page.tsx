import { Metadata } from "next";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import ReportMiiForm from "@/components/report/mii-form";

interface Props {
	params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
	title: "Report Mii - TomodachiShare",
	description: "Report a Mii on TomodachiShare",
	robots: {
		index: false,
		follow: false,
	},
};

export default async function ReportMiiPage({ params }: Props) {
	const session = await auth();
	const { id } = await params;

	const mii = await prisma.mii.findUnique({
		where: {
			id: Number(id),
		},
		include: {
			_count: {
				select: {
					likedBy: true,
				},
			},
		},
	});

	if (!session) redirect("/login");
	if (!mii) redirect("/404");

	return (
		<div className="flex justify-center w-full">
			<ReportMiiForm mii={mii} likes={mii._count.likedBy} />
		</div>
	);
}
