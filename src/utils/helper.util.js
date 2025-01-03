import env from "#configs/env";

function extractS3KeyFromUrl(url) {
  const s3Domain = "s3.ap-south-1.amazonaws.com";
  const bucketName = env.AWS_BUCKET_NAME;

  const regex = new RegExp(`https://${bucketName}\\.${s3Domain}/(.+)`);
  const match = url.match(regex);

  if (match && match[1]) {
    return decodeURIComponent(match[1]);
  }

  throw new Error("Invalid S3 URL or mismatch with bucket domain");
}

export { extractS3KeyFromUrl };
