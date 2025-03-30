import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import MiiList from "./components/mii-list";

export default async function Page({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
	const session = await auth();

	if (session?.user && !session.user.username) {
		redirect("/create-username");
	}

	// await prisma.mii.create({
	// 	data: {
	// 		userId: 1,
	// 		name: "Himmel",
	// 		pictures: ["https://placehold.co/600x400", "/missing.webp"],
	// 		tags: ["Anime", "Osaka"],
	// 	},
	// });

	return <MiiList searchParams={searchParams} />;
}
