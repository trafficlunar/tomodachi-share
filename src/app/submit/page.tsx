import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
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

	return <SubmitForm />;
}
