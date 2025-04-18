"use client";

import { Icon } from "@iconify/react";
import { signOut } from "next-auth/react";

export default function LogoutButton() {
	return (
		<li title="Logout">
			<button onClick={() => signOut()} className="pill button !p-0 aspect-square h-full">
				<Icon icon="ic:round-logout" fontSize={24} />
			</button>
		</li>
	);
}
