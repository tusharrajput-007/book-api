import { MultipartFile } from "@fastify/multipart";
import { randomUUID } from "crypto";
import { writeFile } from "fs/promises";
import path from "path";

const ALLOWED_MIMETYPES = ["image/jpeg", "image/png"];
const MAX_SIZE = 2 * 1024 * 1024; // 2MB

export const saveFile = async (
  file: MultipartFile,
  folder: "books" | "students",
): Promise<string> => {
  // validate mimetype
  if (!ALLOWED_MIMETYPES.includes(file.mimetype)) {
    await file.toBuffer();
    throw { statusCode: 400, message: "Only JPEG and PNG images are allowed" };
  }

  // read into buffer
  const buffer = await file.toBuffer();

  // validate size
  if (buffer.length > MAX_SIZE) {
    throw { statusCode: 400, message: "File size must be at most 2MB" };
  }

  // generate unique filename
  const ext = path.extname(file.filename);
  const filename = `${randomUUID()}${ext}`;
  const filePath = path.join("uploads", folder, filename);

  // write to disk
  await writeFile(filePath, buffer);

  return filePath.replace(/\\/g, "/");
};

export const deleteFile = async (filePath: string) => {
  const fs = await import("fs/promises");
  try {
    await fs.unlink(filePath);
  } catch {
    // ignore if file doesn't exist
  }
};
