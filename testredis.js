import redisClient from "./Backend/backend/Utils/redisClient.js";

(async () => {
  try {
    await redisClient.set("test-key", "hello");
    const value = await redisClient.get("test-key");
    console.log("Redis test value:", value); // should log "hello"
  } catch (err) {
    console.error("Redis test failed:", err);
  }
})();
