import { Metadata } from "next";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import ProfileSettings from "@/components/profile-settings";
import ProfileInformation from "@/components/profile-information";

export const metadata: Metadata = {
	title: "Profile Settings - TomodachiShare",
	description: "Change your account info or delete it",
	robots: {
		index: false,
		follow: false,
	},
};

export default async function ProfileSettingsPage() {
	const session = await auth();

	if (!session) redirect("/login");

	const user = await prisma.user.findUnique({ where: { id: Number(session.user.id!) }, select: { description: true } });

	return (
		<div>
			<ProfileInformation page="settings" />
			<ProfileSettings currentDescription={user?.description} />
		</div>
	);
}
