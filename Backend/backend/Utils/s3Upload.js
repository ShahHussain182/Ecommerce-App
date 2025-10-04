import { PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import s3Client from "./s3Client.js";
import { logger } from "./logger.js";

const S3_BUCKET_NAME = process.env.MINIO_BUCKET_NAME || "e-store-images";
const MINIO_URL = process.env.MINIO_URL || "http://localhost:9000";

// Map MIME types to extensions explicitly
const extMap = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export const uploadFileToS3 = async (fileBuffer, mimetype, folder = "products") => {
  const extension = extMap[mimetype];
  if (!extension) throw new Error(`Unsupported file type: ${mimetype}`);

  const uniqueFileName = `${folder}/${uuidv4()}-${Date.now()}.${extension}`;

  const uploadParams = {
    Bucket: S3_BUCKET_NAME,
    Key: uniqueFileName,
    Body: fileBuffer,
    ContentType: mimetype,
    // ACL: "public-read", ❌ (better: bucket policy for public access)
  };

  try {
    await s3Client.send(new PutObjectCommand(uploadParams));
    logger.info(`✅ File uploaded: ${uniqueFileName}`);

    const publicUrl = `${MINIO_URL}/${S3_BUCKET_NAME}/${uniqueFileName}`;
    return publicUrl;
  } catch (error) {
    logger.error(`❌ Upload failed: ${error.message}`, { error });
    throw new Error(`Failed to upload image: ${error.message}`);
  }
};
