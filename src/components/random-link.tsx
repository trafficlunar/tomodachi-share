"use client";

import Link from "next/link";
import { redirect } from "next/navigation";
import { Icon } from "@iconify/react";

export default function RandomLink() {
	return (
		<Link href={"/random"} onClick={() => redirect("/random")} className="pill button !p-0 h-full aspect-square" data-tooltip="Go to a Random Mii">
			<Icon icon="mdi:dice-3" fontSize={28} />
		</Link>
	);
}
