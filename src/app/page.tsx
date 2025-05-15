import { redirect } from "next/navigation";
import { Suspense } from "react";

import { auth } from "@/lib/auth";

import MiiList from "@/components/mii-list";
import Skeleton from "@/components/mii-list/skeleton";

interface Props {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Page({ searchParams }: Props) {
	const session = await auth();

	if (session?.user && !session.user.username) {
		redirect("/create-username");
	}

	return (
		<>
			<h1 className="sr-only">TomodachiShare - index page</h1>

			<Suspense fallback={<Skeleton />}>
				<MiiList searchParams={await searchParams} />
			</Suspense>
		</>
	);
}
