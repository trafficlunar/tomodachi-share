"use client";

import { Icon } from "@iconify/react";
import { signOut } from "next-auth/react";

export default function LogoutButton() {
	return (
		<li title="Logout">
			<button onClick={() => signOut()} aria-label="Log Out" className="pill button !p-0 aspect-square h-full" data-tooltip="Log Out">
				<Icon icon="ic:round-logout" fontSize={24} />
			</button>
		</li>
	);
}
