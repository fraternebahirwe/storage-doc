import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const UPLOAD_ROOT = path.resolve(process.cwd(), process.env.UPLOAD_DIR ?? "./storage");

function userDir(userId: string) {
  return path.join(UPLOAD_ROOT, userId);
}

export function filePath(userId: string, storedName: string) {
  return path.join(userDir(userId), storedName);
}

export async function saveUpload(userId: string, file: File) {
  const dir = userDir(userId);
  await mkdir(dir, { recursive: true });

  const ext = path.extname(file.name).slice(0, 20);
  const storedName = `${randomUUID()}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, storedName), buffer);

  return { storedName, size: buffer.length };
}

export async function deleteUpload(userId: string, storedName: string) {
  try {
    await unlink(filePath(userId, storedName));
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
  }
}
