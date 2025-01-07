// Import the AWS SDK
import AWS from "aws-sdk";
import fs from "fs";
import env from "#configs/env";

// Set up AWS SDK with your credentials (for local development)
AWS.config.update({
  accessKeyId: env.AWS_ACCESS_KEY_ID,
  secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  region: env.AWS_REGION || "us-west-2", // Replace with your desired region
});

// Create an S3 instance
const s3 = new AWS.S3();

// S3 Bucket Name
const BUCKET_NAME = "your-bucket-name";

// Upload a file to S3
export function uploadFile(filePath, key) {
  const fileContent = fs.readFileSync(filePath);
  const params = {
    Bucket: BUCKET_NAME,
    Key: key,
    Body: fileContent,
    ContentType: "application/octet-stream", // Modify content type if necessary
  };

  s3.upload(params, (err, data) => {
    if (err) {
      console.error("Error uploading file:", err);
    } else {
      console.log("File uploaded successfully:", data.Location);
    }
  });
}

// List objects in a bucket
export function listFiles() {
  const params = {
    Bucket: BUCKET_NAME,
  };

  s3.listObjectsV2(params, (err, data) => {
    if (err) {
      console.error("Error listing files:", err);
    } else {
      console.log("Files in S3 bucket:", data.Contents);
    }
  });
}

// Delete a file from S3
export function deleteFile(key) {
  const params = {
    Bucket: BUCKET_NAME,
    Key: key,
  };

  s3.deleteObject(params, (err, data) => {
    if (err) {
      console.error("Error deleting file:", err);
    } else {
      console.log("File deleted successfully:", data);
    }
  });
}

// Example usage
// uploadFile('path/to/your/local/file.txt', 'folder-name/file.txt');
// listFiles();
// deleteFile('folder-name/file.txt');
