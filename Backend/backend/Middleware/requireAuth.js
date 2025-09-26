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

    // If session exists, touch it to keep it alive
    if (req.session) {
      req.session.touch();
    }

    next();
  } catch (error) {
    console.error("Error in requireAuth middleware:", error); // Use console.error for errors
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Access token expired" });
    } else if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ success: false, message: "Invalid token" });
    } else {
      // For any other unexpected error, send a generic 500
      return res.status(500).json({ success: false, message: "Server error during authentication" });
    }
  }
};