import 'dotenv/config';
import mongoose from 'mongoose';
import { MeiliSearch } from 'meilisearch';
import { Product } from '../Models/Product.model.js';

// 1. Connect to MongoDB
await mongoose.connect(process.env.MONGO_URL);

// 2. Setup Meilisearch client
const meiliClient = new MeiliSearch({
  host: process.env.MEILI_HOST || 'http://127.0.0.1:7700',
  apiKey: process.env.MEILI_MASTER_KEY || '',
});


await meiliClient.deleteIndex('products'); 
const productsIndex = meiliClient.index('products');
async function syncProducts() {
  try {
    // ✅ Configure index before syncing
    await productsIndex.updateSettings({
      searchableAttributes: ['name', 'description', 'category'],
      filterableAttributes: ['category', 'price', 'colors', 'sizes', 'isFeatured', 'averageRating', 'numberOfReviews'], // Added averageRating, numberOfReviews
      sortableAttributes: ['price', 'name', 'averageRating', 'numberOfReviews', 'createdAt'], // Added averageRating, numberOfReviews
      rankingRules: [ // Custom ranking rules for better relevance
        'words',
        'typo',
        'proximity',
        'attribute',
        'sort',
        'exactness',
        'isFeatured:desc', // Prioritize featured products
        'averageRating:desc', // Prioritize higher-rated products
        'numberOfReviews:desc', // Prioritize products with more reviews
      ],
      synonyms: { // Example synonyms
        'phone': ['smartphone', 'mobile'],
        'tv': ['television'],
        'laptop': ['notebook', 'computer'],
        'shirt': ['t-shirt', 'tee'],
      },
      stopWords: ['a', 'an', 'the', 'is', 'are', 'and', 'or', 'for', 'with'], // Example stop words
      typoTolerance: { // Explicitly enable typo tolerance (default is usually true)
        enabled: true,
        minWordSizeForTypos: {
          oneTypo: 3,   // minimum word length before 1 typo is allowed
          twoTypos: 7,  // minimum word length before 2 typos are allowed
        },
      
        disableOnAttributes: ['_id'], // Don't apply typo tolerance to IDs
      },
    });

    // 3. Get all products from MongoDB
    const products = await Product.find().lean();

    if (products.length === 0) {
      console.log('⚠️ No products found in MongoDB.');
      return;
    }

    // ⚡ Clean & flatten MongoDB docs for Meilisearch
    const docs = products.map((p) => ({
      _id: p._id.toString(),
      name: String(p.name ?? ''),
      description: String(p.description ?? ''),
      category: String(p.category ?? ''),
      imageUrls: p.imageUrls || [], 
      isFeatured: Boolean(p.isFeatured),
      variants: (p.variants || []).map(v => ({
        _id: v._id.toString(),
        size: String(v.size ?? ''),
        color: String(v.color ?? ''),
        price: Number(v.price ?? 0),
        stock: Number(v.stock ?? 0),
      })),
      price: Number(p.variants?.[0]?.price ?? 0), 
      colors: (p.variants || []).map(v => v.color).filter(Boolean),
      sizes: (p.variants || []).map(v => v.size).filter(Boolean),
      averageRating: Number(p.averageRating ?? 0),
      numberOfReviews: Number(p.numberOfReviews ?? 0),
      createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : null,
    }));

    // 4. Push into Meilisearch
    const task = await productsIndex.addDocuments(docs);
    console.log(`📦 Sent ${docs.length} products to Meilisearch. Task UID: ${task.taskUid}`);

    // ✅ Wait for completion + log errors if any
    const status = await meiliClient.tasks.getTask(task.taskUid);
    if (status.status === 'failed') {
      console.error('❌ Sync failed:', status.error);
    } else {
      console.log('✅ Sync completed:', status.status);
    }
  } catch (err) {
    console.error('❌ Error syncing products:', err.message);
  } finally {
    await mongoose.disconnect();
  }
}

syncProducts();