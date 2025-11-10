import Image from "next/image";
import Link from "next/link";

import { prisma } from "@/lib/prisma";

import ProfilePicture from "./profile-picture";

interface Props {
	text: string;
	className?: string;
}

export default function Description({ text, className }: Props) {
	return (
		<p className={`text-sm mt-2 bg-white/50 p-3 rounded-lg border border-orange-200 whitespace-break-spaces max-h-54 overflow-y-auto ${className}`}>
			{/* Adds fancy formatting when linking to other pages on the site */}
			{(() => {
				const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://tomodachishare.com";

				// Match both mii and profile links
				const regex = new RegExp(`(${baseUrl.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}/(?:mii|profile)/\\d+)`, "g");
				const parts = text.split(regex);

				return parts.map(async (part, index) => {
					const miiMatch = part.match(new RegExp(`^${baseUrl}/mii/(\\d+)$`));
					const profileMatch = part.match(new RegExp(`^${baseUrl}/profile/(\\d+)$`));

					if (miiMatch) {
						const id = Number(miiMatch[1]);
						const linkedMii = await prisma.mii.findUnique({
							where: {
								id,
							},
						});

						if (!linkedMii) return;

						return (
							<Link
								key={index}
								href={`/mii/${id}`}
								className="inline-flex items-center align-top gap-1.5 pr-2 bg-amber-100 border border-amber-400 rounded-lg mx-1 text-amber-800 text-sm -mt-2"
							>
								<Image src={`/mii/${id}/image?type=mii`} alt="mii" width={32} height={32} className="bg-white rounded-lg border-r border-amber-400" />
								{linkedMii.name}
							</Link>
						);
					}

					if (profileMatch) {
						const id = Number(profileMatch[1]);
						const linkedProfile = await prisma.user.findUnique({
							where: {
								id,
							},
						});

						if (!linkedProfile) return;

						return (
							<Link
								key={index}
								href={`/profile/${id}`}
								className="inline-flex items-center align-top gap-1.5 pr-2 bg-orange-100 border border-orange-400 rounded-lg mx-1 text-orange-800 text-sm -mt-2"
							>
								<ProfilePicture
									src={linkedProfile.image || "/guest.webp"}
									width={32}
									height={32}
									className="bg-white rounded-lg border-r border-orange-400"
								/>
								{linkedProfile.name}
							</Link>
						);
					}

					// Regular text
					return <span key={index}>{part}</span>;
				});
			})()}
		</p>
	);
}
