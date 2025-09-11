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
import { errorHandler, notFoundHandler } from "./Middleware/errorHandler.js";
import { config } from "./Utils/config.js";
import { logger } from "./Utils/logger.js"; // ✅ central logger

dotenv.config();

const app = express();
const mongoUrl = config.MONGO_URL;

// ----------------- Middleware -----------------
if (config.NODE_ENV === "development") {
  logger.debug("Running in development mode");
}
app.use(requestContextMiddleware); 
// ✅ Morgan piped into Winston
app.use(morgan("combined", { stream: logger.stream }));

app.use(helmet());
app.use(
  cors({
    origin: "http://localhost:5173",
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

// sync cookie maxAge and store ttl
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
      secure: config.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax",
    },
  })
);

// ----------------- Routes -----------------
app.use("/api/v1/auth", authRouter);

app.use(notFoundHandler);
app.use(errorHandler);

// ----------------- Server -----------------
const startServer = async () => {
  await connectDB();
  app.listen(config.PORT, () => {
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
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    logger.info("Mongoose disconnected.");
  }
  if (mongoClient) {
    await mongoClient.close();
    logger.info("MongoStore client disconnected.");
  }
}

["SIGINT", "SIGTERM"].forEach((signal) => {
  process.on(signal, async () => {
    logger.warn(`Received ${signal}, starting graceful shutdown...`);

    const timeout = setTimeout(() => {
      logger.error("Force exiting after 5s...");
      process.exit(1);
    }, 5000);

    try {
      await cleanup();
      clearTimeout(timeout);
      logger.info("✅ Cleanup complete, exiting.");
      process.exit(0);
    } catch (e) {
      logger.error("Error during shutdown:", e);
      process.exit(1);
    }
  });
});

// Handle unexpected errors separately
["uncaughtException", "unhandledRejection"].forEach((event) => {
  process.on(event, async (err) => {
    logger.error(`Fatal error due to ${event}:`, err);

    const timeout = setTimeout(() => {
      logger.error("Force exiting after 5s...");
      process.exit(1);
    }, 5000);

    try {
      await cleanup();
      clearTimeout(timeout);
      process.exit(1); // exit with failure code for fatal errors
    } catch (e) {
      logger.error("Error during forced shutdown:", e);
      process.exit(1);
    }
  });
});

