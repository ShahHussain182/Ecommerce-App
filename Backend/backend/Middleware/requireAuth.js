import jwt from "jsonwebtoken";
import { User } from "../Models/user.model.js"; // Import the User model

export const requireAuth = async (req, res, next) => {
	const token = req.cookies?.AccessToken || req.headers['authorization']?.replace(/^Bearer\s/i, '');
    if (!token) {
      return res.status(401).json({ success: false, message: "Unauthorized - no token provided" });
    }
  
    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      
      // Attach userId and sessionId from token
      req.userId = decoded.userId;
      req.sessionId = decoded.sessionId;

      // Fetch the user from the database and attach to request
      const user = await User.findById(decoded.userId).select('-password'); // Exclude password
      if (!user) {
        return res.status(401).json({ success: false, message: "Unauthorized - user not found" });
      }
      req.user = user; // Attach the full user object to the request

      next();
		
	} catch (error) {
		console.log("Error in verifyToken ", error);
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Access token expired" });
    } else if (error.name === "JsonWebTokenError") {
      return { valid: false, status: 401, message: "Invalid token" };
    } else {
      return res.status(500).json({ success: false, message: "Server error" });
    }
		
	}
};