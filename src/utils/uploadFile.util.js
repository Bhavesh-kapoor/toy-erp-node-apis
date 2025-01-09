import fs from "fs/promises";
import { fileURLToPath } from "url";
import path, { dirname } from "path";
import httpStatus from "#utils/httpStatus";
import { session } from "#middlewares/session";
import { bucket } from "#configs/awsS3";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function saveFile(files, folder, allowedFiles) {
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

  for (const file of files) {
    const ext = path.extname(file.originalname).toLowerCase();
    const newFileName = `${file.fieldname}${ext}`;
    const filePath = path.join(uploadsDir, newFileName);
    await fs.writeFile(filePath, file.buffer);
    paths[file.fieldname] = filePath.split("/src")[1];
  }

  return paths;
}

/** NOTE: This function will be used only by mongoose model.
 * 	  This has to be defined as a pre hook in mongoose models where you want to handle image upload automatically
 * 	  If you want to upload manually then there is no need to call this one
 * @example
 * someMongooseSchema.pre("save",uploadFile)
 */
export default async function uploadFile(next) {
  try {
    const files = session?.get("files");
    if (!files || !files?.length) return next();
    const modelKeys = this.constructor.schema.tree;
    const modelName = this.constructor.modelName;
    const filePaths = {};
    let filesPathArr = [];
    for (const file of files) {
      if (!modelKeys[file.fieldname]?.file) continue;
      const filePath =
        `${modelName}/${this.id}/${file.fieldname}`.toLowerCase();

      filePaths[file.fieldname] = filesPathArr.length;
      filesPathArr.push(bucket.uploadFile(file, filePath));
    }

    filesPathArr = await Promise.all(filesPathArr);
    for (let i in filePaths) {
      this[i] = filesPathArr[filePaths[i]].url;
    }
    next();
  } catch (err) {
    next(err);
  }
}
