import Image from "next/image";
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

	return (
		<div>
			<div className="flex gap-4">
				<Image
					src={user?.image ?? "/missing.webp"}
					alt="profile picture"
					width={128}
					height={128}
					className="rounded-full border-2 border-amber-500 shadow"
				/>

				<div className="flex flex-col">
					<h1 className="text-4xl font-extrabold">{user?.name}</h1>
					<h2 className="text-lg font-semibold">@{user?.username}</h2>

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
