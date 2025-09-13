// server.js
import express from "express";
import dotenv from "dotenv";
import MongoStore from "connect-mongo";
import session from "express-session";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import { MongoClient } from "mongodb";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import { requestContextMiddleware } from "./Utils/requestContext.js";

import { connectDB } from "./DB/connectDB.js";
import authRouter from "./Routers/auth.router.js";
import productRouter from "./Routers/product.router.js";
import cartRouter from "./Routers/cart.router.js"; // Import the new cart router
import { errorHandler, notFoundHandler } from "./Middleware/errorHandler.js";
import { config } from "./Utils/config.js";
import { logger } from "./Utils/logger.js";
import { Product } from "./Models/Product.model.js";
import { mockProducts } from "./Utils/mockProducts.js";

dotenv.config();

const app = express();
const mongoUrl = config.MONGO_URL;

// ----------------- Middleware -----------------
if (config.NODE_ENV === "development") {
  logger.debug("Running in development mode");
}
app.use(requestContextMiddleware); 
app.use(morgan("combined", { stream: logger.stream }));

app.use(helmet());
app.use(
  cors({
    origin: "http://localhost:8080",
    credentials: true,
  })
);

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
      res.status(429).json({ message: "Too many requests, slow down." });
    },
  })
);

app.use(express.json());
app.use(cookieParser());
app.set("trust proxy", 1);

// ----------------- Session Store -----------------
const mongoClient = new MongoClient(mongoUrl);
await mongoClient.connect();
logger.info("MongoClient connected for sessions.");

const sessionTTL = 60 * 60 * 24 * 30; // 30 days (seconds)

const store = MongoStore.create({
  client: mongoClient,
  collectionName: "sessions",
  ttl: sessionTTL,
  autoRemove: "native",
});

app.use(
  session({
    secret: config.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store,
    cookie: {
      maxAge: sessionTTL * 1000,
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax",
    },
  })
);

// ----------------- Routes -----------------
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/cart", cartRouter); // Register the cart router

app.use(notFoundHandler);
app.use(errorHandler);

// ----------------- Server -----------------
let server;

const startServer = async () => {
  await connectDB();

  // --- Database Seeding Logic ---
  try {
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      logger.info("No products found. Seeding database with mock data...");
      await Product.insertMany(mockProducts);
      logger.info("✅ Database seeded successfully with mock products.");
    } else {
      logger.info(`${productCount} products already exist in the database. Skipping seeding.`);
    }
  } catch (error) {
    logger.error("❌ Error during database seeding:", error);
  }
  // --- End of Seeding Logic ---

  server = app.listen(config.PORT, () => {
    logger.info(
      `🚀 Server running in ${config.NODE_ENV} mode on port ${config.PORT}`
    );
    if (config.NODE_ENV === "development") {
      logger.debug(`http://localhost:${config.PORT}`);
    }
  });
};

startServer();

// ----------------- Graceful Shutdown -----------------
async function cleanup() {
  logger.info("Starting cleanup process...");

  if (server) {
    logger.debug("Closing HTTP server...");
    try {
      await new Promise((resolve, reject) => {
        server.close((err) => {
          if (err) {
            logger.error("Error closing HTTP server:", err);
            return reject(err);
          }
          logger.info("HTTP server closed.");
          resolve();
        });
      });
    } catch (error) {
      logger.error("Failed to close HTTP server:", error);
    }
  }

  if (mongoose.connection.readyState !== 0) {
    logger.debug("Disconnecting Mongoose...");
    try {
      await mongoose.disconnect();
      logger.info("Mongoose disconnected.");
    } catch (error) {
      logger.error("Failed to disconnect Mongoose:", error);
    }
  }

  if (mongoClient) {
    logger.debug("Closing Mongo client...");
    try {
      await mongoClient.close(true);
      logger.info("MongoStore client disconnected.");
    } catch (error) {
      logger.error("Failed to close Mongo client:", error);
    }
  }

  logger.info("All connections closed successfully.");
}

async function flushLogger() {
  logger.debug("Flushing logs...");
  return new Promise((resolve) => {
    const transports = logger.transports;
    let pendingTransports = transports.length;

    if (pendingTransports === 0) {
      logger.debug("No transports to flush.");
      resolve();
      return;
    }

    const onFinish = () => {
      pendingTransports--;
      if (pendingTransports === 0) {
        logger.debug("All transports flushed.");
        resolve();
      }
    };

    transports.forEach((transport) => {
      if (transport.close) {
        transport.close(onFinish);
      } else {
        onFinish();
      }
    });

    setTimeout(() => {
      logger.warn("Flush logger timeout reached.");
      resolve();
    }, 1000);
  });
}

["SIGINT", "SIGTERM"].forEach((signal) => {
  process.on(signal, async () => {
    logger.warn(`Received ${signal}, starting graceful shutdown...`);
    
    const timeout = setTimeout(() => {
      logger.error("Force exiting after 10s...");
      process.exit(1);
    }, 20000);
    
    try {
      logger.info("Starting cleanup process...");
      await cleanup();
      logger.info("✅ Cleanup complete, exiting.");
      
      logger.info("Flushing logs...");
      await flushLogger();
      logger.info("Logs flushed successfully.");
      
      clearTimeout(timeout);
      console.log("Graceful shutdown completed.");
      
      setTimeout(() => process.exit(0), 100);
    } catch (err) {
      logger.error(`Error during shutdown: ${err.message}`);
      process.exit(1);
    }
  });
});

["uncaughtException", "unhandledRejection"].forEach((event) => {
  process.on(event, async (err) => {
    logger.error(`Fatal error due to ${event}:`, err);

    const timeout = setTimeout(() => {
      console.log("Force exiting after 10s...");
      process.exit(1);
    }, 10000);

    try {
      await cleanup();
      logger.info("Emergency cleanup completed.");
      await flushLogger();
      clearTimeout(timeout);
      process.exit(1);
    } catch (e) {
      logger.error("Error during forced shutdown:", e);
      try {
        await flushLogger();
      } catch (flushError) {
        console.error("Failed to flush logs during emergency shutdown:", flushError);
      }
      clearTimeout(timeout);
      process.exit(1);
    }
  });
});