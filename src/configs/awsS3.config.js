import { Upload } from "@aws-sdk/lib-storage";
import {
  S3Client,
  DeleteObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { extractS3KeyFromUrl } from "#utils/helper";
import env from "#configs/env";

class s3ServiceWithProgress {
  constructor(region, accessKeyId, secretAccessKey) {
    this.s3Client = new S3Client({
      region: region ?? env.AWS_REGION,
      credentials: {
        accessKeyId: accessKeyId ?? env.AWS_ACCESS_KEY_ID,
        secretAccessKey: secretAccessKey ?? env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }

  async uploadFile(file, path, progressCallback) {
    const upload = new Upload({
      client: this.s3Client,
      params: {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: path,
        Body: file.buffer,
        ContentType: file.mimetype,
        // ACL: "public-read", // Consider making this configurable
        Metadata: {
          "original-filename": file.originalname,
          "upload-date": new Date().toISOString(),
        },
        ServerSideEncryption: "AES256",
      },
      queueSize: 4,
      partSize: 5 * 1024 * 1024, // 5 MB
      leavePartsOnError: false,
    });

    let lastProgress = 0;

    if (progressCallback) {
      upload.on("httpUploadProgress", (progress) => {
        const total = progress.total || file.size; // Fallback if `total` is undefined
        const percentage = Math.round((progress.loaded * 100) / total);

        if (percentage >= lastProgress + 5 || percentage === 100) {
          lastProgress = percentage;
          progressCallback(percentage);
        }
      });
    }

    try {
      const result = await upload.done();
      return {
        url: result.Location,
        key: result.Key,
        versionId: result.VersionId,
        etag: result.ETag,
      };
    } catch (error) {
      if (error.name === "AbortError") {
        console.log("Upload aborted");
      }
      throw error;
    }
  }

  async listFiles(prefix = "") {
    try {
      const listParams = {
        Bucket: env.AWS_BUCKET_NAME,
        Prefix: prefix, // Optional: List files under a specific "folder"
      };

      const command = new ListObjectsV2Command(listParams);
      const data = await this.s3Client.send(command);

      const files = (data.Contents || []).map((file) => ({
        key: file.Key,
        lastModified: file.LastModified,
        size: file.Size,
        storageClass: file.StorageClass,
      }));

      console.log("Files in S3 bucket:", files);
      return files;
    } catch (error) {
      console.error("Error listing files from S3:", error.message);
      throw new Error("Failed to list files from S3");
    }
  }

  async deleteFile(s3Path) {
    const key = extractS3KeyFromUrl(s3Path);
    try {
      const deleteParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
      };

      const deleteCommand = new DeleteObjectCommand(deleteParams);
      await this.s3Client.send(deleteCommand);

      console.log(`File ${key} deleted successfully.`);
    } catch (error) {
      console.error("Error deleting file from S3:", error.message);
      throw new Error("Failed to delete file from S3");
    }
  }
}

export const bucket = new s3ServiceWithProgress();

export default s3ServiceWithProgress;
