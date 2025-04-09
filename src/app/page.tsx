import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import MiiList from "./components/mii-list";

export default async function Page({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
	const session = await auth();

	if (session?.user && !session.user.username) {
		redirect("/create-username");
	}

	return <MiiList searchParams={searchParams} />;
}
