import { Prisma } from "@prisma/client";
import { searchSchema } from "@tomodachi-share/shared/schemas";
import { prisma } from "@/lib/prisma";
import MiiGrid from "./mii-grid";

interface Props {
	searchParams: { [key: string]: string | string[] | undefined };
}

export default async function MiiList({ searchParams }: Props) {
	const parsed = searchSchema.safeParse(searchParams);
	if (!parsed.success) return <h1>{parsed.error.issues[0].message}</h1>;

	const { page = 1, limit = 24 } = parsed.data;

	const skip = (page - 1) * limit;

	let totalCount: number;
	let miis: Prisma.MiiGetPayload<{ include: { user: { select: { id: true; name: true } } } }>[];

	[totalCount, miis] = await Promise.all([
		prisma.mii.count({ where: { in_queue: true } }),
		prisma.mii.findMany({
			where: { in_queue: true },
			include: { user: { select: { id: true, name: true } } },
			orderBy: [{ createdAt: "asc" }, { name: "asc" }],
			skip,
			take: limit,
		}),
	]);

	const lastPage = Math.ceil(totalCount / limit);

	return <MiiGrid miis={miis} totalCount={totalCount} lastPage={lastPage} />;
}
