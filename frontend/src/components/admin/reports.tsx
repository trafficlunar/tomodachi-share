// import { revalidatePath } from "next/cache";

// import { Icon } from "@iconify/react";
// import { ReportStatus } from "@prisma/client";

// import { prisma } from "@/lib/prisma";
// import ReportTabs from "./report-tabs";

// const PAGE_SIZE = 20;

// export default async function Reports({ searchParams }: { searchParams: { status?: string; page?: string } }) {
// 	const status = searchParams.status as ReportStatus | undefined;
// 	const page = Number(searchParams.page ?? 1);

// 	const [reports, total] = await Promise.all([
// 		prisma.report.findMany({
// 			where: status ? { status } : undefined,
// 			orderBy: { createdAt: "desc" },
// 			skip: (page - 1) * PAGE_SIZE,
// 			take: PAGE_SIZE,
// 		}),
// 		prisma.report.count({
// 			where: status ? { status } : undefined,
// 		}),
// 	]);

// 	const totalPages = Math.ceil(total / PAGE_SIZE);

// 	const updateStatus = async (formData: FormData) => {
// 		"use server";
// 		const id = Number(formData.get("id"));
// 		const status = formData.get("status") as ReportStatus;

// 		await prisma.report.update({
// 			where: { id },
// 			data: { status },
// 		});

// 		revalidatePath("/admin");
// 	};

// 	return (
// 		<div className="bg-orange-100 rounded-xl border-2 border-orange-400">
// 			<ReportTabs status={status} />

// 			{/* Grid */}
// 			<div className="grid grid-cols-2 gap-2 p-2 max-lg:grid-cols-1">
// 				{reports.map((report) => (
// 					<div key={report.id} className="p-4 bg-white border border-orange-300 shadow-sm rounded-md">
// 						<div className="w-full overflow-x-scroll">
// 							<div className="flex gap-1 w-max">
// 								<span
// 									className={`text-xs font-semibold px-2 py-1 rounded-full border ${
// 										report.reportType == "USER" ? "bg-red-200 text-red-800 border-red-400" : "bg-cyan-200 text-cyan-800 border-cyan-400"
// 									}`}
// 								>
// 									{report.reportType}
// 								</span>

// 								<span
// 									className={`text-xs font-semibold px-2 py-1 rounded-full border ${
// 										report.status == "OPEN"
// 											? "bg-orange-200 text-orange-800 border-orange-400"
// 											: report.status == "RESOLVED"
// 												? "bg-green-200 text-green-800 border-green-400"
// 												: "bg-zinc-200 text-zinc-800 border-zinc-400"
// 									}`}
// 								>
// 									{report.status}
// 								</span>

// 								<span className="ml-2 flex items-center gap-1 text-sm text-zinc-500">
// 									<Icon icon="lucide:calendar" className="text-base" />
// 									{report.createdAt.toLocaleString("en-GB", {
// 										day: "2-digit",
// 										month: "long",
// 										year: "numeric",
// 										hour: "2-digit",
// 										minute: "2-digit",
// 										second: "2-digit",
// 										timeZone: "UTC",
// 									})}{" "}
// 									UTC
// 								</span>
// 							</div>
// 						</div>

// 						<div className="grid grid-cols-4 text-xs text-zinc-600 mt-4 max-sm:grid-cols-2">
// 							<div>
// 								<p>Target ID</p>
// 								<a href={report.reportType === "MII" ? `/mii/${report.targetId}` : `/profile/${report.targetId}`} className="text-blue-600 text-sm">
// 									{report.targetId}
// 								</a>
// 							</div>

// 							<div>
// 								<p>Creator ID</p>
// 								<a href={`/profile/${report.creatorId}`} className="text-blue-600 text-sm">
// 									{report.creatorId}
// 								</a>
// 							</div>

// 							<div>
// 								<p>Reporter</p>
// 								<a href={`/profile/${report.authorId}`} className="text-blue-600 text-sm">
// 									{report.authorId}
// 								</a>
// 							</div>

// 							<div>
// 								<p>Reason</p>
// 								<p className="font-medium text-black text-sm">{report.reason}</p>
// 							</div>
// 						</div>

// 						<div className="mt-4 border border-orange-200 bg-orange-100/50 rounded-md p-2">
// 							<p className="text-zinc-600 text-xs">Notes</p>
// 							<p>{report.reasonNotes}</p>
// 						</div>

// 						<div className="mt-4 flex gap-4">
// 							<form action={updateStatus}>
// 								<input type="hidden" name="id" value={report.id} />
// 								<input type="hidden" name="status" value={"OPEN"} />

// 								<button
// 									type="submit"
// 									aria-label="Open"
// 									className="cursor-pointer text-orange-400 flex items-center gap-1 p-1.5 rounded-lg transition-colors hover:bg-orange-400/15"
// 								>
// 									<Icon icon="mdi:alert-circle" className="text-xl" />
// 									<span className="text-sm">Open</span>
// 								</button>
// 							</form>
// 							<form action={updateStatus}>
// 								<input type="hidden" name="id" value={report.id} />
// 								<input type="hidden" name="status" value={"RESOLVED"} />

// 								<button
// 									type="submit"
// 									aria-label="Resolve"
// 									className="cursor-pointer text-green-500 flex items-center gap-1 p-1.5 rounded-lg transition-colors hover:bg-green-500/15"
// 								>
// 									<Icon icon="mdi:check-circle" className="text-xl" />
// 									<span className="text-sm">Resolve</span>
// 								</button>
// 							</form>
// 							<form action={updateStatus}>
// 								<input type="hidden" name="id" value={report.id} />
// 								<input type="hidden" name="status" value={"DISMISSED"} />

// 								<button
// 									type="submit"
// 									aria-label="Dismiss"
// 									className="cursor-pointer text-zinc-400 flex items-center gap-1 p-1.5 rounded-lg transition-colors hover:bg-zinc-400/15"
// 								>
// 									<Icon icon="mdi:close-circle" className="text-xl" />
// 									<span className="text-sm">Dismiss</span>
// 								</button>
// 							</form>
// 						</div>
// 					</div>
// 				))}
// 			</div>

// 			{reports.length === 0 && (
// 				<div className="text-center py-12 text-gray-500">
// 					<p className="text-lg font-medium">No reports to display</p>
// 					<p className="text-sm">Reports will appear here when users submit them</p>
// 				</div>
// 			)}

// 			{/* Pagination */}
// 			{totalPages > 1 && (
// 				<div className="flex justify-between items-center p-3 border-t border-orange-300">
// 					<span className="text-sm text-orange-700">{total} total</span>
// 					<div className="flex items-center gap-3">
// 						{page > 1 && (
// 							<a
// 								href={`/admin?${new URLSearchParams({ ...(status && { status }), page: String(page - 1) })}`}
// 								className="text-sm px-3 py-1 rounded-full font-medium border bg-white text-orange-700 border-orange-300 hover:bg-orange-50 transition-colors"
// 							>
// 								Previous
// 							</a>
// 						)}
// 						<span className="text-sm text-orange-700">
// 							Page {page} of {totalPages}
// 						</span>
// 						{page < totalPages && (
// 							<a
// 								href={`/admin?${new URLSearchParams({ ...(status && { status }), page: String(page + 1) })}`}
// 								className="text-sm px-3 py-1 rounded-full font-medium border bg-white text-orange-700 border-orange-300 hover:bg-orange-50 transition-colors"
// 							>
// 								Next
// 							</a>
// 						)}
// 					</div>
// 				</div>
// 			)}
// 		</div>
// 	);
// }
