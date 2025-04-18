import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import SubmitForm from "../components/submit-form";

export default async function SubmitPage() {
	const session = await auth();

	if (!session) redirect("/login");

	return (
		<div className="flex justify-center">
			<SubmitForm />
		</div>
	);
}
