import Link from "next/link";
import { revalidatePath } from "next/cache";

import { Icon } from "@iconify/react";
import { ReportStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export default async function Reports() {
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
		<div className="bg-orange-100 rounded-xl border-2 border-orange-400">
			<div className="grid grid-cols-2 gap-2 p-2 max-lg:grid-cols-1">
				{reports.map((report) => (
					<div key={report.id} className="p-4 bg-white border border-orange-300 shadow-sm rounded-md">
						<div className="w-full overflow-x-scroll">
							<div className="flex gap-1 w-max">
								<span
									className={`text-xs font-semibold px-2 py-1 rounded-full border ${
										report.reportType == "USER" ? "bg-red-200 text-red-800 border-orange-400" : "bg-cyan-200 text-cyan-800 border-cyan-400"
									}`}
								>
									{report.reportType}
								</span>

								<span
									className={`text-xs font-semibold px-2 py-1 rounded-full border ${
										report.status == "OPEN"
											? "bg-orange-200 text-orange-800 border-orange-400"
											: report.status == "RESOLVED"
											? "bg-green-200 text-green-800 border-green-400"
											: "bg-zinc-200 text-zinc-800 border-zinc-400"
									}`}
								>
									{report.status}
								</span>

								<span className="ml-2 flex items-center gap-1 text-sm text-zinc-500">
									<Icon icon="lucide:calendar" className="text-base" />
									{report.createdAt.toLocaleString("en-GB", {
										day: "2-digit",
										month: "long",
										year: "numeric",
										hour: "2-digit",
										minute: "2-digit",
										second: "2-digit",
										timeZone: "UTC",
									})}{" "}
									UTC
								</span>
							</div>
						</div>

						<div className="grid grid-cols-4 text-xs text-zinc-600 mt-4 max-sm:grid-cols-2">
							<div>
								<p>Target ID</p>
								<Link
									href={report.reportType === "MII" ? `/mii/${report.targetId}` : `/profile/${report.targetId}`}
									className="text-blue-600 text-sm"
								>
									{report.targetId}
								</Link>
							</div>

							<div>
								<p>Creator ID</p>
								<Link href={`/profile/${report.creatorId}`} className="text-blue-600 text-sm">
									{report.creatorId}
								</Link>
							</div>

							<div>
								<p>Reporter</p>
								<Link href={`/profile/${report.authorId}`} className="text-blue-600 text-sm">
									{report.authorId}
								</Link>
							</div>

							<div>
								<p>Reason</p>
								<p className="font-medium text-black text-sm">{report.reason}</p>
							</div>
						</div>

						<div className="mt-4 border border-orange-200 bg-orange-100/50 rounded-md p-2">
							<p className="text-zinc-600 text-xs">Notes</p>
							<p>{report.reasonNotes}</p>
						</div>

						<div className="mt-4 flex gap-4">
							<form action={updateStatus}>
								<input type="hidden" name="id" value={report.id} />
								<input type="hidden" name="status" value={"OPEN"} />

								<button
									type="submit"
									aria-label="Open"
									className="cursor-pointer text-orange-400 flex items-center gap-1 p-1.5 rounded-lg transition-colors hover:bg-orange-400/15"
								>
									<Icon icon="mdi:alert-circle" className="text-xl" />
									<span className="text-sm">Open</span>
								</button>
							</form>
							<form action={updateStatus}>
								<input type="hidden" name="id" value={report.id} />
								<input type="hidden" name="status" value={"RESOLVED"} />

								<button
									type="submit"
									aria-label="Resolve"
									className="cursor-pointer text-green-500 flex items-center gap-1 p-1.5 rounded-lg transition-colors hover:bg-green-500/15"
								>
									<Icon icon="mdi:check-circle" className="text-xl" />
									<span className="text-sm">Resolve</span>
								</button>
							</form>
							<form action={updateStatus}>
								<input type="hidden" name="id" value={report.id} />
								<input type="hidden" name="status" value={"DISMISSED"} />

								<button
									type="submit"
									aria-label="Dismiss"
									className="cursor-pointer text-zinc-400 flex items-center gap-1 p-1.5 rounded-lg transition-colors hover:bg-zinc-400/15"
								>
									<Icon icon="mdi:close-circle" className="text-xl" />
									<span className="text-sm">Dismiss</span>
								</button>
							</form>
						</div>
					</div>
				))}
			</div>

			{reports.length === 0 && (
				<div className="text-center py-12 text-gray-500">
					<p className="text-lg font-medium">No reports to display</p>
					<p className="text-sm">Reports will appear here when users submit them</p>
				</div>
			)}
		</div>
	);
}
