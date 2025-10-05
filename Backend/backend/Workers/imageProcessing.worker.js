import { Worker } from 'bullmq';
import sharp from 'sharp';
import { config } from '../Utils/config.js';
import { logger } from '../Utils/logger.js';
import s3Client from '../Utils/s3Client.js';
import { GetObjectCommand, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { Product } from '../Models/Product.model.js';
import mongoose from 'mongoose';

const S3_BUCKET_NAME = process.env.MINIO_BUCKET_NAME || "e-store-images";
const MINIO_URL = process.env.MINIO_URL || "http://localhost:9000";

const connection = {
  host: config.REDIS_HOST,
  port: Number(config.REDIS_PORT),
  username: config.REDIS_USERNAME,
  password: config.REDIS_PASSWORD,
};

// Helper to download file from S3
const downloadFileFromS3 = async (key) => {
  try {
    const command = new GetObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: key,
    });
    const response = await s3Client.send(command);
    return response.Body.transformToByteArray();
  } catch (error) {
    logger.error(`[ImageWorker] Failed to download ${key} from S3: ${error.message}`);
    throw error;
  }
};

// Helper to upload file to S3
const uploadFileToS3 = async (buffer, key, contentType) => {
  try {
    const command = new PutObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    });
    await s3Client.send(command);
    return `${MINIO_URL}/${S3_BUCKET_NAME}/${key}`;
  } catch (error) {
    logger.error(`[ImageWorker] Failed to upload ${key} to S3: ${error.message}`);
    throw error;
  }
};

export const imageProcessingWorker = new Worker(
  'image-processing',
  async (job) => {
    const { productId, originalS3Key, imageIndex } = job.data;
    logger.info(`[ImageWorker] Processing job for product ${productId}, image index ${imageIndex} with key ${originalS3Key}`);

    let product;
    try {
      product = await Product.findById(productId);
      if (!product) {
        throw new Error(`Product with ID ${productId} not found.`);
      }
    } catch (error) {
      logger.error(`[ImageWorker] Failed to find product ${productId}: ${error.message}`);
      throw error;
    }

    try {
      const originalImageBuffer = await downloadFileFromS3(originalS3Key);
      const baseFileName = originalS3Key.split('/').pop().split('.')[0]; // e.g., uuid-timestamp

      const renditions = {};
      const uploadPromises = [];

      // Define image sizes and formats
      const sizes = {
        original: null, // Keep original size
        medium: 800,
        thumbnail: 200,
      };
      const formats = ['webp', 'avif']; // Prioritize modern formats

      for (const sizeName in sizes) {
        const width = sizes[sizeName];
        let processedImage = sharp(originalImageBuffer);

        if (width) {
          processedImage = processedImage.resize(width, width, { fit: 'inside', withoutEnlargement: true });
        }

        // Process for each format
        for (const formatName of formats) {
          const outputBuffer = await processedImage.toFormat(formatName).toBuffer();
          const key = `products/${productId}/${baseFileName}-${sizeName}.${formatName}`;
          uploadPromises.push(uploadFileToS3(outputBuffer, key, `image/${formatName}`).then(url => {
            renditions[`${sizeName}_${formatName}`] = url;
            if (sizeName === 'original' && formatName === 'webp') { // Use webp as primary original
              renditions.original = url;
            } else if (sizeName === 'medium' && formatName === 'webp') { // Use webp as primary medium
              renditions.medium = url;
            } else if (sizeName === 'thumbnail' && formatName === 'webp') { // Use webp as primary thumbnail
              renditions.thumbnail = url;
            }
          }));
        }
      }

      await Promise.all(uploadPromises);

      // Update the product document with new image URLs and renditions
      // We'll update the specific image entry in imageUrls and imageRenditions array
      const newImageUrls = [...product.imageUrls];
      const newImageRenditions = [...product.imageRenditions];

      // Update the main imageUrl to point to the medium WebP version for display
      newImageUrls[imageIndex] = renditions.medium_webp || renditions.original_webp || renditions.original;
      newImageRenditions[imageIndex] = {
        original: renditions.original_webp || renditions.original,
        medium: renditions.medium_webp || renditions.medium,
        thumbnail: renditions.thumbnail_webp || renditions.thumbnail,
        webp: renditions.original_webp,
        avif: renditions.original_avif,
      };

      product.imageUrls = newImageUrls;
      product.imageRenditions = newImageRenditions;

      // Check if all images have been processed (simple check for now)
      const allImagesProcessed = product.imageRenditions.every(r => r.medium);
      if (allImagesProcessed) {
        product.imageProcessingStatus = 'completed';
      } else {
        product.imageProcessingStatus = 'pending'; // Still pending if some images are not fully processed
      }

      await product.save();
      logger.info(`[ImageWorker] Product ${productId} image ${imageIndex} processed and updated successfully.`);

      // Clean up original uploaded file from S3 if it's no longer needed
      // This is optional, depending on whether you want to keep originals
      try {
        await s3Client.send(new DeleteObjectCommand({ Bucket: S3_BUCKET_NAME, Key: originalS3Key }));
        logger.info(`[ImageWorker] Deleted original S3 object: ${originalS3Key}`);
      } catch (deleteError) {
        logger.warn(`[ImageWorker] Failed to delete original S3 object ${originalS3Key}: ${deleteError.message}`);
      }

    } catch (error) {
      logger.error(`[ImageWorker] Failed to process image for product ${productId}, image index ${imageIndex}: ${error.message}`, { error });
      // Mark product as failed processing if a critical error occurs
      product.imageProcessingStatus = 'failed';
      await product.save();
      throw error; // Re-throw to mark job as failed in BullMQ
    }
  },
  { connection }
);

imageProcessingWorker.on('completed', (job) => {
  logger.info(`[ImageWorker] Job ${job.id} completed for product ${job.data.productId}`);
});

imageProcessingWorker.on('failed', (job, err) => {
  logger.error(`[ImageWorker] Job ${job.id} failed for product ${job.data.productId}: ${err.message}`, { error: err });
});

logger.info('[ImageWorker] Image processing worker started.');