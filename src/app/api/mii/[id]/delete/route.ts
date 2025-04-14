import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import fs from "fs/promises";
import path from "path";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const uploadsDirectory = path.join(process.cwd(), "public", "mii");

const slugSchema = z.coerce
	.number({ message: "Mii ID must be a number" })
	.int({ message: "Mii ID must be an integer" })
	.positive({ message: "Mii ID must be valid" });

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	const session = await auth();
	if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const { id: slugId } = await params;
	const parsed = slugSchema.safeParse(slugId);

	if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
	const miiId = parsed.data;

	const miiUploadsDirectory = path.join(uploadsDirectory, miiId.toString());

	try {
		await prisma.mii.delete({
			where: { id: miiId },
		});
	} catch (error) {
		console.error("Failed to delete Mii from database:", error);
		return NextResponse.json({ error: "Failed to delete Mii" }, { status: 500 });
	}

	try {
		await fs.rm(miiUploadsDirectory, { recursive: true, force: true });
	} catch (error) {
		console.warn("Failed to delete Mii image files:", error);
	}

	return NextResponse.json({ success: true });
}
