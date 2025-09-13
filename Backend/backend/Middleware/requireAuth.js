import { verifyAccessToken } from "../Utils/verifyTokens.js";
export const requireAuth = async (req, res, next) => {
	
	try {
		const result = verifyAccessToken(req);
    if (!result.valid) {
      return res.status(result.status).json({ success: false, message: result.message });
    }
		req.userId = result.userId;
    req.sessionId = result.sessionId;
		next();
	} catch (error) {
		console.log("Error in verifyToken ", error);
        if (error.name === "TokenExpiredError") {
            // Access token expired
            return res.status(401).json({ success: false, message: "Access token expired" });
          } else if (error.name === "JsonWebTokenError") {
            // Invalid token (tampered or wrong secret)
            return res.status(401).json({ success: false, message: "Invalid token" });
          } else {
            // Other JWT-related error
            return res.status(500).json({ success: false, message: "Server error" });
          }
		
	}
};