import { createReadStream } from "fs";
import { stat } from "fs/promises";
import { Readable } from "stream";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteUpload, filePath } from "@/lib/storage";

async function getOwnedFile(userId: string, id: string) {
  const file = await prisma.file.findUnique({ where: { id } });
  if (!file || file.userId !== userId) return null;
  return file;
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const file = await getOwnedFile(session.user.id, id);
  if (!file) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const path = filePath(session.user.id, file.storedName);
  const stats = await stat(path).catch(() => null);
  if (!stats) {
    return NextResponse.json({ error: "File missing on disk" }, { status: 404 });
  }

  const url = new URL(request.url);
  const disposition = url.searchParams.get("download") ? "attachment" : "inline";
  const safeName = file.originalName.replace(/[^\w.\- ]/g, "_");

  const stream = Readable.toWeb(createReadStream(path)) as ReadableStream;

  return new NextResponse(stream, {
    headers: {
      "Content-Type": file.mimeType,
      "Content-Length": String(stats.size),
      "Content-Disposition": `${disposition}; filename="${safeName}"`,
    },
  });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const file = await getOwnedFile(session.user.id, id);
  if (!file) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await deleteUpload(session.user.id, file.storedName);
  await prisma.file.delete({ where: { id: file.id } });

  return NextResponse.json({ ok: true });
}
