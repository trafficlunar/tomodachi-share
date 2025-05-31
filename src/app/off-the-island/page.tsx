import { Metadata } from "next";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import dayjs from "dayjs";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import ReturnToIsland from "@/components/admin/return-to-island";

export const metadata: Metadata = {
	title: "Exiled - TomodachiShare",
	description: "You have been exiled from the TomodachiShare island...",
	robots: {
		index: false,
		follow: false,
	},
};

export default async function ExiledPage() {
	const session = await auth();

	if (!session?.user) redirect("/");

	const activePunishment = await prisma.punishment.findFirst({
		where: {
			userId: Number(session?.user.id),
			returned: false,
		},
		include: {
			violatingMiis: {
				include: {
					mii: {
						select: {
							name: true,
						},
					},
				},
			},
		},
	});

	if (!activePunishment) redirect("/");

	const expiresAt = dayjs(activePunishment.expiresAt);
	const createdAt = dayjs(activePunishment.createdAt);

	const hasExpired = activePunishment.type === "TEMP_EXILE" && activePunishment.expiresAt! > new Date();
	const duration = activePunishment.type === "TEMP_EXILE" && Math.ceil(expiresAt.diff(createdAt, "days", true));

	return (
		<div className="flex-grow flex items-center justify-center">
			<div className="bg-amber-50 border-2 border-amber-500 rounded-2xl shadow-lg p-8 max-w-xl w-full flex flex-col">
				<h2 className="text-4xl font-black mb-2">
					{activePunishment.type === "PERM_EXILE"
						? "Exiled permanently"
						: activePunishment.type === "TEMP_EXILE"
						? `Exiled for ${duration} ${duration === 1 ? "day" : "days"}`
						: "Warning"}
				</h2>
				<p>
					You have been exiled from the TomodachiShare island because you violated the{" "}
					<Link href={"/terms-of-service"} className="text-blue-500">
						Terms of Service
					</Link>
					.
				</p>

				<p className="mt-3">
					<span className="font-bold">Reviewed:</span> {activePunishment.createdAt.toLocaleDateString("en-GB")} at{" "}
					{activePunishment.createdAt.toLocaleString("en-GB")}
				</p>

				<p className="mt-1">
					<span className="font-bold">Note:</span> {activePunishment.notes}
				</p>

				<div className="flex items-center gap-4 text-zinc-500 text-sm font-medium mt-4">
					<hr className="flex-grow border-zinc-300" />
					<span>Violating Items</span>
					<hr className="flex-grow border-zinc-300" />
				</div>

				<div className="flex flex-col gap-2 p-4">
					{activePunishment.reasons.map((index, reason) => (
						<div key={index} className="bg-orange-100 rounded-xl border-2 border-orange-400 p-4">
							<p>
								<span className="font-bold">Reason:</span> {reason}
							</p>
						</div>
					))}
					{activePunishment.violatingMiis.map((mii) => (
						<div key={mii.miiId} className="bg-orange-100 rounded-xl border-2 border-orange-400 flex">
							<Image src={`/mii/${mii.miiId}/image?type=mii`} alt="mii image" width={96} height={96} />
							<div className="p-4">
								<p className="text-xl font-bold line-clamp-1" title={"hello"}>
									{mii.mii.name}
								</p>
								<p className="text-sm">
									<span className="font-bold">Reason:</span> {mii.reason}
								</p>
							</div>
						</div>
					))}
				</div>

				<hr className="border-zinc-300 mt-2 mb-4" />

				{activePunishment.type !== "PERM_EXILE" ? (
					<>
						<p className="mb-2">Once your punishment ends, you can return by checking the box below.</p>
						<ReturnToIsland hasExpired={hasExpired} />
					</>
				) : (
					<>
						<p>Your punishment is permanent, therefore you cannot return.</p>
					</>
				)}
			</div>
		</div>
	);
}
