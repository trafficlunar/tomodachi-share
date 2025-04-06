import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import SubmitForm from "../components/submit-form";

export default async function SubmitPage() {
	const session = await auth();

	if (!session) redirect("/login");

	return (
		<div>
			<h1 className="text-2xl font-bold text-center">Submit your Mii</h1>
			<SubmitForm />
		</div>
	);
}
