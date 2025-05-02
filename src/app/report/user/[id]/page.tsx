import { Metadata } from "next";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import ReportUserForm from "@/components/report/user-form";

interface Props {
	params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
	title: "Report User - TomodachiShare",
	description: "Report a user on TomodachiShare",
	robots: {
		index: false,
		follow: false,
	},
};

export default async function ReportUserPage({ params }: Props) {
	const session = await auth();
	const { id } = await params;

	const user = await prisma.user.findUnique({
		where: {
			id: Number(id),
		},
	});

	if (!session) redirect("/login");
	if (!user) redirect("/404");

	return (
		<div className="flex justify-center w-full">
			<ReportUserForm user={user} />
		</div>
	);
}
