import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { Icon } from "@iconify/react";
import { ReportStatus } from "@prisma/client";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import BannerForm from "@/components/admin/banner-form";

export const metadata: Metadata = {
	title: "Admin - TomodachiShare",
	description: "TomodachiShare admin panel",
	robots: {
		index: false,
		follow: false,
	},
};

export default async function AdminPage() {
	const session = await auth();

	if (!session || Number(session.user.id) !== Number(process.env.NEXT_PUBLIC_ADMIN_USER_ID)) redirect("/404");

	const reports = await prisma.report.findMany();

	const updateStatus = async (formData: FormData) => {
		"use server";
		const id = Number(formData.get("id"));
		const status = formData.get("status") as ReportStatus;

		await prisma.report.update({
			where: { id },
			data: { status },
		});

		revalidatePath("/admin");
	};

	return (
		<div className="bg-amber-50 border-2 border-amber-500 rounded-2xl shadow-lg p-4 flex flex-col gap-4">
			<div>
				<h2 className="text-2xl font-bold">Admin Panel</h2>
				<p className="text-sm text-zinc-500">View reports, set banners, etc.</p>
			</div>

			{/* Separator */}
			<div className="flex items-center gap-4 text-zinc-500 text-sm font-medium my-1">
				<hr className="flex-grow border-zinc-300" />
				<span>Banners</span>
				<hr className="flex-grow border-zinc-300" />
			</div>

			<BannerForm />

			{/* Separator */}
			<div className="flex items-center gap-4 text-zinc-500 text-sm font-medium my-1">
				<hr className="flex-grow border-zinc-300" />
				<span>Reports</span>
				<hr className="flex-grow border-zinc-300" />
			</div>

			<div className="bg-orange-100 rounded-xl border-2 border-orange-400 w-full overflow-x-scroll">
				<table className="w-full text-sm table-fixed rounded-xl overflow-hidden min-w-5xl">
					<thead className="bg-orange-200 rounded">
						<tr className=" border-b-2 border-orange-300 *:px-4 *:py-2 *:font-semibold *:text-left">
							<th>Type</th>
							<th>Status</th>
							<th>Target</th>
							<th>Reason</th>
							<th>Notes</th>
							<th>Reporter</th>
							<th>Actions</th>
						</tr>
					</thead>
					<tbody>
						{reports.map((report, index) => (
							<tr key={index} className="*:px-4 *:py-2">
								<td>
									<span
										className={`text-xs font-semibold px-2 py-1 rounded-full border ${
											report.reportType == "USER" ? "bg-red-200 text-red-800" : "bg-cyan-200 text-cyan-800"
										}`}
									>
										{report.reportType}
									</span>
								</td>
								<td>
									<span
										className={`text-xs font-semibold px-2 py-1 rounded-full border ${
											report.status == "OPEN"
												? "bg-orange-200 text-orange-800"
												: report.status == "RESOLVED"
												? "bg-green-200 text-green-800"
												: "bg-zinc-200 text-zinc-800"
										}`}
									>
										{report.status}
									</span>
								</td>
								<td className="font-bold text-blue-500">
									<Link href={report.reportType === "MII" ? `/mii/${report.targetId}` : `/profile/${report.targetId}`}>{report.targetId}</Link>
								</td>
								<td>{report.reason}</td>
								<td className="italic">{report.reasonNotes}</td>
								<td className="font-bold text-blue-500">
									<Link href={`/profile/${report.authorId}`}>{report.authorId}</Link>
								</td>
								<td className="flex items-center text-2xl *:flex">
									<form action={updateStatus}>
										<input type="hidden" name="id" value={report.id} />
										<input type="hidden" name="status" value={"OPEN"} />

										<button type="submit" data-tooltip="Mark as OPEN" className="cursor-pointer text-orange-300">
											<Icon icon="mdi:alert-circle" />
										</button>
									</form>
									<form action={updateStatus}>
										<input type="hidden" name="id" value={report.id} />
										<input type="hidden" name="status" value={"RESOLVED"} />

										<button type="submit" data-tooltip="Mark as RESOLVED" className="cursor-pointer text-green-400">
											<Icon icon="mdi:check-circle" />
										</button>
									</form>
									<form action={updateStatus}>
										<input type="hidden" name="id" value={report.id} />
										<input type="hidden" name="status" value={"DISMISSED"} />

										<button type="submit" data-tooltip="Mark as DISMISSED" className="cursor-pointer text-zinc-400">
											<Icon icon="mdi:close-circle" />
										</button>
									</form>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
