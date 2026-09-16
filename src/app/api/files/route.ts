import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { saveUpload } from "@/lib/storage";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const files = await prisma.file.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ files });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const entries = formData.getAll("files").filter((entry): entry is File => entry instanceof File);

  if (entries.length === 0) {
    return NextResponse.json({ error: "No files provided." }, { status: 400 });
  }

  const created = [];
  for (const file of entries) {
    const { storedName, size } = await saveUpload(session.user.id, file);
    const record = await prisma.file.create({
      data: {
        originalName: file.name || "untitled",
        storedName,
        mimeType: file.type || "application/octet-stream",
        size,
        userId: session.user.id,
      },
    });
    created.push(record);
  }

  return NextResponse.json({ files: created });
}
