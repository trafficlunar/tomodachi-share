import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import MiiList from "./components/mii-list";

export default async function Page() {
	const session = await auth();

	if (session?.user && !session.user.username) {
		redirect("/create-username");
	}

	return <MiiList isLoggedIn={session?.user != null} />;
}
