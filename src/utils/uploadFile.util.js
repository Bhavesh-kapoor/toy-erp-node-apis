import fs from "fs/promises";
import { fileURLToPath } from "url";
import path, { dirname } from "path";
import httpStatus from "#utils/httpStatus";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default async function uploadFile(files, folder) {
  const uploadsDir = path.join(__dirname, "../uploads", folder);
  try {
    await fs.mkdir(uploadsDir, { recursive: true });
  } catch (dirError) {
    throw {
      status: false,
      message: "failed to update photos, can't create directory'",
      httpStatus: httpStatus.BAD_REQUEST,
    };
  }

  const paths = {};

  for (const file of files) {
    const filePath = path.join(uploadsDir, file.fieldname);
    await fs.writeFile(filePath, file.buffer);
    paths[file.fieldname] = filePath.split("/src")[1];
  }
  return paths;
}
