import { Metadata } from "next";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

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

	return (
		<div>
			<ProfileInformation inSettings />
			<ProfileSettings />
		</div>
	);
}
