import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Icon } from "@iconify/react";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import LikeButton from "@/components/like-button";
import ImageViewer from "@/components/image-viewer";
import DeleteMiiButton from "@/components/delete-mii";
import ShareMiiButton from "@/components/share-mii-button";
import ThreeDsScanTutorialButton from "@/components/tutorial/3ds-scan";
import SwitchScanTutorialButton from "@/components/tutorial/switch-scan";
import Description from "@/components/description";

interface Props {
	params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { id } = await params;

	const mii = await prisma.mii.findUnique({
		where: {
			id: Number(id),
		},
		include: {
			user: {
				select: {
					name: true,
					username: true,
				},
			},
			_count: {
				select: { likedBy: true }, // Get total like count
			},
		},
	});

	// Bots get redirected anyways
	if (!mii) return {};

	const metadataImageUrl = `/mii/${mii.id}/image?type=metadata`;

	return {
		metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL!),
		title: `${mii.name} - TomodachiShare`,
		description: `Check out '${mii.name}', a Tomodachi Life Mii created by ${mii.user.name} on TomodachiShare with ${mii._count.likedBy} likes.`,
		keywords: ["mii", "tomodachi life", "nintendo", "tomodachishare", "tomodachi-share", "mii creator", "mii collection", ...mii.tags],
		creator: mii.user.username,
		openGraph: {
			type: "article",
			title: `${mii.name} - TomodachiShare`,
			description: `Check out '${mii.name}', a Tomodachi Life Mii created by ${mii.user.name} on TomodachiShare with ${mii._count.likedBy} likes.`,
			images: [
				{
					url: metadataImageUrl,
					alt: `${mii.name}, ${mii.tags.join(", ")} ${mii.gender} Mii character`,
				},
			],
			publishedTime: mii.createdAt.toISOString(),
			authors: mii.user.username,
		},
		twitter: {
			card: "summary_large_image",
			title: `${mii.name} - TomodachiShare`,
			description: `Check out '${mii.name}', a Tomodachi Life Mii created by ${mii.user.name} on TomodachiShare with ${mii._count.likedBy} likes.`,
			images: [
				{
					url: metadataImageUrl,
					alt: `${mii.name}, ${mii.tags.join(", ")} ${mii.gender} Mii character`,
				},
			],
			creator: mii.user.username!,
		},
		alternates: {
			canonical: `/mii/${mii.id}`,
		},
	};
}

export default async function MiiPage({ params }: Props) {
	const { id } = await params;
	const session = await auth();

	const mii = await prisma.mii.findUnique({
		where: {
			id: Number(id),
		},
		include: {
			user: {
				select: {
					name: true,
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

	const images = [...Array.from({ length: mii.imageCount }, (_, index) => `/mii/${mii.id}/image?type=image${index}`)];

	return (
		<div className="flex flex-col items-center">
			<div className="max-w-5xl w-full flex flex-col gap-4">
				<div className="relative grid grid-cols-3 gap-4 max-md:grid-cols-1">
					<div className="bg-amber-50 rounded-3xl border-2 border-amber-500 shadow-lg p-4 flex flex-col items-center max-w-md w-full max-md:place-self-center max-md:row-start-2">
						{/* Mii Image */}
						<div className="bg-linear-to-b from-amber-100 to-amber-200 overflow-hidden rounded-xl w-full mb-4 flex justify-center">
							<ImageViewer
								src={`/mii/${mii.id}/image?type=mii`}
								alt="mii headshot"
								width={200}
								height={200}
								className="drop-shadow-lg hover:scale-105 transition-transform"
							/>
						</div>
						{/* QR Code */}
						<div className="bg-amber-200 overflow-hidden rounded-xl w-full mb-4 flex justify-center p-2">
							<ImageViewer
								src={`/mii/${mii.id}/image?type=qr-code`}
								alt="mii qr code"
								width={128}
								height={128}
								className="border-2 border-amber-300 rounded-lg hover:brightness-90 transition-all"
							/>
						</div>
						<hr className="w-full border-t-2 border-t-amber-400" />

						{/* Mii Info */}
						{mii.platform === "THREE_DS" && (
							<ul className="text-sm w-full p-2 *:flex *:justify-between *:items-center *:my-1">
								<li>
									Name:{" "}
									<span className="text-right font-medium">
										{mii.firstName} {mii.lastName}
									</span>
								</li>
								<li>
									From: <span className="text-right font-medium">{mii.islandName} Island</span>
								</li>
								<li>
									Allowed Copying: <input type="checkbox" checked={mii.allowedCopying ?? false} disabled className="checkbox cursor-auto!" />
								</li>
							</ul>
						)}

						{/* Mii Platform */}
						<div className={`flex items-center gap-4 text-zinc-500 text-sm font-medium mb-2 w-full ${mii.platform !== "THREE_DS" && "mt-2"}`}>
							<hr className="grow border-zinc-300" />
							<span>Platform</span>
							<hr className="grow border-zinc-300" />
						</div>

						<div data-tooltip-span title={mii.platform} className="grid grid-cols-2 gap-2 mb-2">
							<div
								className={`tooltip mt-1! ${
									mii.platform === "THREE_DS" ? "bg-sky-400! border-sky-400! before:border-b-sky-400!" : "bg-red-400! border-red-400! before:border-b-red-400!"
								}`}
							>
								{mii.platform === "THREE_DS" ? "3DS" : "Switch"}
							</div>

							<div
								className={`rounded-xl flex justify-center items-center size-16 text-4xl border-2 shadow-sm ${
									mii.platform === "THREE_DS" ? "bg-sky-100 border-sky-400" : "bg-white border-gray-300"
								}`}
							>
								<Icon icon="cib:nintendo-3ds" className="text-sky-500" />
							</div>

							<div
								className={`rounded-xl flex justify-center items-center size-16 text-4xl border-2 shadow-sm ${
									mii.platform === "SWITCH" ? "bg-red-100 border-red-400" : "bg-white border-gray-300"
								}`}
							>
								<Icon icon="cib:nintendo-switch" className="text-red-400" />
							</div>
						</div>

						{/* Mii Gender */}
						<div className="flex items-center gap-4 text-zinc-500 text-sm font-medium mb-2 w-full">
							<hr className="grow border-zinc-300" />
							<span>Gender</span>
							<hr className="grow border-zinc-300" />
						</div>

						<div data-tooltip-span title={mii.gender ?? "NULL"} className="grid grid-cols-2 gap-2">
							<div
								className={`tooltip mt-1! ${
									mii.gender === "MALE" ? "bg-blue-400! border-blue-400! before:border-b-blue-400!" : "bg-pink-400! border-pink-400! before:border-b-pink-400!"
								}`}
							>
								{mii.gender === "MALE" ? "Male" : "Female"}
							</div>

							<div
								className={`rounded-xl flex justify-center items-center size-16 text-5xl border-2 shadow-sm ${
									mii.gender === "MALE" ? "bg-blue-100 border-blue-400" : "bg-white border-gray-300"
								}`}
							>
								<Icon icon="foundation:male" className="text-blue-400" />
							</div>

							<div
								className={`rounded-xl flex justify-center items-center size-16 text-5xl border-2 shadow-sm ${
									mii.gender === "FEMALE" ? "bg-pink-100 border-pink-400" : "bg-white border-gray-300"
								}`}
							>
								<Icon icon="foundation:female" className="text-pink-400" />
							</div>
						</div>
					</div>

					<div className="col-span-2 flex flex-col gap-4 max-md:col-span-1">
						{/* Information */}
						<div className="bg-amber-50 border-2 border-amber-500 rounded-2xl shadow-lg p-4 flex flex-col gap-1">
							<div className="flex justify-between items-start">
								{/* Submission name */}
								<h1 className="text-4xl font-extrabold wrap-break-word text-amber-700">{mii.name}</h1>
								{/* Like button */}
								<LikeButton likes={mii._count.likedBy ?? 0} miiId={mii.id} isLiked={(mii.likedBy ?? []).length > 0} isLoggedIn={session?.user != null} big />
							</div>
							{/* Tags */}
							<div id="tags" className="flex flex-wrap gap-1 mt-1 *:px-2 *:py-1 *:bg-orange-300 *:rounded-full *:text-xs">
								{mii.tags.map((tag) => (
									<Link href={{ pathname: "/", query: { tags: tag } }} key={tag}>
										{tag}
									</Link>
								))}
							</div>

							{/* Author and Created date */}
							<div className="mt-2">
								<Link href={`/profile/${mii.userId}`} className="text-lg">
									By <span className="font-bold">{mii.user.name}</span>
								</Link>
								<h4 className="text-sm">
									Created:{" "}
									{mii.createdAt.toLocaleString("en-GB", {
										day: "2-digit",
										month: "long",
										year: "numeric",
										hour: "2-digit",
										minute: "2-digit",
										second: "2-digit",
										timeZone: "UTC",
									})}{" "}
									UTC
								</h4>
							</div>

							{/* Description */}
							{mii.description && <Description text={mii.description} className="ml-2" />}
						</div>

						{/* Buttons */}
						<div className="flex gap-3 w-fit bg-amber-50 border-2 border-amber-500 rounded-2xl shadow-lg p-4 text-3xl text-orange-400 max-md:place-self-center *:size-12 *:flex *:flex-col *:items-center *:gap-1 **:transition-discrete **:duration-150 *:hover:brightness-75 *:hover:scale-[1.08] *:[&_span]:text-xs">
							{session && (Number(session.user.id) === mii.userId || Number(session.user.id) === Number(process.env.NEXT_PUBLIC_ADMIN_USER_ID)) && (
								<>
									<Link aria-label="Edit Mii" href={`/edit/${mii.id}`}>
										<Icon icon="mdi:pencil" />
										<span>Edit</span>
									</Link>
									<DeleteMiiButton miiId={mii.id} miiName={mii.name} likes={mii._count.likedBy ?? 0} inMiiPage />
								</>
							)}

							<ShareMiiButton miiId={mii.id} />
							<Link aria-label="Report Mii" href={`/report/mii/${mii.id}`}>
								<Icon icon="material-symbols:flag-rounded" />
								<span>Report</span>
							</Link>
							{mii.platform === "THREE_DS" ? <ThreeDsScanTutorialButton /> : <SwitchScanTutorialButton />}
						</div>
					</div>
				</div>

				{/* Images */}
				<div className="bg-amber-50 rounded-3xl border-2 border-amber-500 shadow-lg p-4 flex flex-col">
					<h2 className="text-xl font-semibold text-amber-700 mb-3 flex items-center gap-2">
						<Icon icon="material-symbols:photo-library" />
						Gallery
					</h2>

					{images.length > 0 ? (
						<div className="grid grid-cols-3 gap-2 w-full max-md:grid-cols-2 max-[24rem]:grid-cols-1">
							{images.map((src, index) => (
								<div
									key={index}
									className="relative aspect-3/2 rounded-xl bg-black/65 border-2 border-amber-400 shadow-md overflow-hidden transition hover:shadow-lg shadow-black/30"
								>
									<Image
										src={src}
										alt="mii screenshot background blur"
										width={256}
										height={170}
										className="absolute size-full blur-sm contrast-150 brightness-[0.65] object-cover"
									/>

									<ImageViewer
										src={src}
										alt="mii screenshot"
										width={256}
										height={170}
										className="aspect-3/2 w-full object-contain hover:scale-105 duration-300 transition-transform relative z-10"
										images={images}
									/>
								</div>
							))}
						</div>
					) : (
						<p className="indent-8 text-black/50">There is nothing here...</p>
					)}
				</div>
			</div>

			{/* Offscreen metadata image for search engines; hidden from users */}
			<Image
				src={`/mii/${mii.id}/image?type=metadata`}
				alt={`${mii.name}, a ${mii.gender ? mii.gender.toLowerCase() : ""} Mii ${mii.tags.length ? ` with tags: ${mii.tags.join(", ")}` : ""}`}
				loading="lazy"
				unoptimized
				width={1}
				height={1}
				className="absolute left-[-999999]"
			/>
		</div>
	);
}
