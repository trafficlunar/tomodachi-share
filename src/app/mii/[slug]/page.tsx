import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import Carousel from "@/app/components/carousel";
import LikeButton from "@/app/components/like-button";

interface Props {
	params: Promise<{ slug: string }>;
}

export default async function MiiPage({ params }: Props) {
	const { slug } = await params;
	const session = await auth();

	const mii = await prisma.mii.findFirst({
		where: {
			id: Number(slug),
		},
		include: {
			user: {
				select: {
					id: true,
					username: true,
				},
			},
			likedBy: {
				where: {
					userId: Number(session?.user.id),
				},
				select: { userId: true },
			},
			_count: {
				select: { likedBy: true }, // Get total like count
			},
		},
	});

	if (!mii) redirect("/404");

	return (
		<div className="flex gap-2 max-sm:flex-col">
			<Carousel images={mii?.images && mii?.images.length > 0 ? mii?.images : ["/missing.webp"]} className="shadow-lg" />

			<div className="flex flex-col gap-1 p-4">
				<h1 className="text-5xl font-extrabold break-words">{mii?.name}</h1>
				<div id="tags" className="flex gap-1 mt-1 *:px-2 *:py-1 *:bg-orange-300 *:rounded-full *:text-xs">
					{mii?.tags.map((tag) => (
						<Link href={{ pathname: "/", query: { tags: tag } }} key={tag}>
							{tag}
						</Link>
					))}
				</div>

				<div className="mt-2">
					<Link href={`/profile/${mii?.userId}`} className="text-lg">
						By: <span className="font-bold">@{mii?.user.username}</span>
					</Link>
					<h4 title={`${mii?.createdAt.toLocaleTimeString("en-GB", { timeZone: "UTC" })} UTC`}>
						Created: {mii?.createdAt.toLocaleDateString("en-GB", { month: "long", day: "2-digit", year: "numeric" })}
					</h4>
				</div>

				<div className="mt-auto">
					<LikeButton
						likes={mii?._count.likedBy ?? 0}
						miiId={mii?.id}
						isLiked={(mii?.likedBy ?? []).length > 0}
						isLoggedIn={session?.user != null}
						big
					/>
				</div>
			</div>
		</div>
	);
}
