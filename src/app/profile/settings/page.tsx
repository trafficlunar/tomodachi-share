import { Metadata } from "next";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import { Icon } from "@iconify/react";

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

	const userExtra = await prisma.user.findUnique({ where: { id: Number(session.user.id) } });

	return (
		<div>
			<ProfileInformation createdAt={userExtra!.createdAt} inSettings />
			<ProfileSettings />
		</div>
	);
}
