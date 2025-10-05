import 'dotenv/config';
import mongoose from 'mongoose';
import { MeiliSearch } from 'meilisearch';
import { Product } from '../Models/Product.model.js';
import { logger } from '../Utils/logger.js'; // Import the logger

async function clearProducts() {
  try {
    // 1. Connect to MongoDB
    logger.info('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URL);
    logger.info('✅ Connected to MongoDB.');

    // 2. Delete all products from MongoDB
    logger.info('Deleting all products from MongoDB...');
    const deleteResult = await Product.deleteMany({});
    logger.info(`✅ Deleted ${deleteResult.deletedCount} products from MongoDB.`);

    // 3. Setup Meilisearch client
    logger.info('Connecting to Meilisearch...');
    const meiliClient = new MeiliSearch({
      host: process.env.MEILI_HOST || 'http://127.0.0.1:7700',
      apiKey: process.env.MEILI_MASTER_KEY || '',
    });
    logger.info('✅ Connected to Meilisearch.');

    // 4. Delete the 'products' index from Meilisearch
    logger.info('Deleting Meilisearch index "products"...');
    try {
      const task = await meiliClient.deleteIndex('products');
      logger.info(`📦 Meilisearch index deletion task UID: ${task.taskUid}`);
      await meiliClient.waitForTask(task.taskUid);
      logger.info('✅ Meilisearch index "products" deleted successfully.');
    } catch (error) {
      if (error.code === 'index_not_found') {
        logger.warn('⚠️ Meilisearch index "products" not found, skipping deletion.');
      } else {
        throw error; // Re-throw other errors
      }
    }

  } catch (err) {
    logger.error('❌ Error during product clearing process:', err.message);
    process.exit(1); // Exit with a failure code
  } finally {
    // 5. Disconnect from MongoDB
    if (mongoose.connection.readyState !== 0) {
      logger.info('Disconnecting from MongoDB...');
      await mongoose.disconnect();
      logger.info('✅ Disconnected from MongoDB.');
    }
    logger.info('Product clearing process finished.');
  }
}

clearProducts();