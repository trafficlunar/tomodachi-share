import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminPage() {
	const session = await auth();

	if (!session || Number(session.user.id) !== Number(process.env.NEXT_PUBLIC_ADMIN_USER_ID)) redirect("/404");

	return (
		<div className="bg-amber-50 border-2 border-amber-500 rounded-2xl shadow-lg p-4 flex flex-col gap-4">
			<div>
				<h2 className="text-2xl font-bold">Admin Panel</h2>
				<p className="text-sm text-zinc-500">View reports, set banners, etc.</p>
			</div>

			{/* Separator */}
			<div className="flex items-center gap-4 text-zinc-500 text-sm font-medium my-1">
				<hr className="flex-grow border-zinc-300" />
				<span>Reports</span>
				<hr className="flex-grow border-zinc-300" />
			</div>
		</div>
	);
}
