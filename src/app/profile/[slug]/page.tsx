import Image from "next/image";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import MiiList from "@/app/components/mii-list";

interface Props {
	params: Promise<{ slug: string }>;
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ProfilePage({ params, searchParams }: Props) {
	const { slug } = await params;

	const user = await prisma.user.findFirst({
		where: {
			id: Number(slug),
		},
	});

	const likedMiis = await prisma.like.count({ where: { userId: Number(slug) } });

	if (!user) redirect("/404");

	return (
		<div>
			<div className="flex gap-4 mb-2">
				<Image
					src={user?.image ?? "/missing.webp"}
					alt="profile picture"
					width={128}
					height={128}
					className="aspect-square rounded-full border-2 border-amber-500 shadow"
				/>

				<div className="flex flex-col">
					<h1 className="text-4xl font-extrabold w-full break-words">{user?.name}</h1>
					<h2 className="text-lg font-semibold break-words">@{user?.username}</h2>

					<h4 className="mt-auto">
						Liked <span className="font-bold">{likedMiis}</span> Miis
					</h4>
					<h4 className="text-sm" title={`${user?.createdAt.toLocaleTimeString("en-GB", { timeZone: "UTC" })} UTC`}>
						Created: {user?.createdAt.toLocaleDateString("en-GB", { month: "long", day: "2-digit", year: "numeric" })}
					</h4>
				</div>
			</div>

			<MiiList searchParams={searchParams} userId={user?.id} />
		</div>
	);
}
