"use client";

import Link from "next/link";
import { Prisma } from "@prisma/client";
import { useSession } from "next-auth/react";
import { Icon } from "@iconify/react";

import DeleteMiiButton from "./delete-mii-button";

interface Props {
	mii: Prisma.MiiGetPayload<{
		include: {
			_count: {
				select: {
					likedBy: true;
				};
			};
		};
	}>;
}

export default function AuthorButtons({ mii }: Props) {
	const session = useSession();

	if (!session.data || Number(session.data.user?.id) !== mii.userId || Number(session.data.user?.id) !== Number(process.env.NEXT_PUBLIC_ADMIN_USER_ID))
		return null;

	return (
		<>
			<Link aria-label="Edit Mii" href={`/edit/${mii.id}`}>
				<Icon icon="mdi:pencil" />
				<span>Edit</span>
			</Link>
			<DeleteMiiButton miiId={mii.id} miiName={mii.name} likes={mii._count.likedBy ?? 0} inMiiPage />
		</>
	);
}
