import Image from "next/image";
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
			likedBy: session?.user
				? {
						where: {
							userId: Number(session.user.id),
						},
						select: { userId: true },
				  }
				: false,
			_count: {
				select: { likedBy: true }, // Get total like count
			},
		},
	});

	if (!mii) redirect("/404");

	const images = [`/mii/${mii.id}/mii.webp`, `/mii/${mii.id}/qr-code.webp`, ...mii.images];

	return (
		<div>
			<div className="relative grid grid-cols-5 gap-2 max-sm:grid-cols-1 max-lg:grid-cols-2">
				<div className="min-w-full flex justify-center col-span-2 max-lg:col-span-1">
					<Carousel images={images} className="shadow-lg" />
				</div>

				<div className="flex flex-col gap-1 p-4 col-span-2 max-lg:col-span-1">
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

				<section className="p-6 bg-orange-100 rounded-2xl shadow-lg border-2 border-orange-400 h-min">
					<legend className="text-lg font-semibold mb-2">Mii Info</legend>
					<ul className="text-sm *:flex *:justify-between *:items-center">
						<li>
							Name:{" "}
							<span className="text-right">
								{mii.firstName} {mii.lastName}
							</span>
						</li>
						<li>
							From: <span className="text-right">{mii.islandName} Island</span>
						</li>
						<li>
							Copying: <input type="checkbox" checked={mii.allowedCopying} disabled className="checkbox" />
						</li>
					</ul>
				</section>
			</div>

			<div className="overflow-x-scroll">
				<div className="flex gap-2 w-max py-4">
					{images.map((src, index) => (
						<Image
							key={index}
							src={src}
							width={256}
							height={1}
							alt="mii screenshots"
							className="rounded-xl bg-zinc-300 border-2 border-zinc-300 shadow-md aspect-[3/2] h-full object-contain"
						/>
					))}
				</div>
			</div>
		</div>
	);
}
