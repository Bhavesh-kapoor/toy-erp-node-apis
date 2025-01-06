import fs from "fs/promises";
import { fileURLToPath } from "url";
import path, { dirname } from "path";
import httpStatus from "#utils/httpStatus";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default async function uploadFile(files, folder, allowedFiles) {
  if (allowedFiles) {
    files = files.filter((file) => allowedFiles.has(file.fieldname));
  }

  const uploadsDir = path.join(__dirname, "../uploads", folder);
  try {
    await fs.mkdir(uploadsDir, { recursive: true });
  } catch (dirError) {
    throw {
      status: false,
      message: "failed to update photos, can't create directory'",
      httpStatus: httpStatus.INTERNAL_SERVER_ERROR,
    };
  }

  const paths = {};

  //TODO: Update file extension

  for (const file of files) {
    const ext = path.extname(file.originalname).toLowerCase();
    const newFileName = `${file.fieldname}${ext}`;
    const filePath = path.join(uploadsDir, newFileName);
    await fs.writeFile(filePath, file.buffer);
    paths[file.fieldname] = filePath.split("/src")[1];
  }

  return paths;
}
