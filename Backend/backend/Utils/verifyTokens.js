import jwt from "jsonwebtoken";



export const verifyAccessToken = async () =>  {
	const token = req.cookies.AccessToken;
	if (!token) return res.status(401).json({ success: false, message: "Unauthorized - no token provided" });
	try {
		const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

		if (!decoded) return res.status(401).json({ success: false, message: "Unauthorized - invalid token" });

		req.userId = decoded.userId;
      
		return token
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
export const verifyRefreshToken = (req) => {
    const token = req.cookies.RefreshToken;
    if (!token) {
      return { valid: false, status: 401, message: "Unauthorized - no token provided" };
    }
  
    try {
      const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
      return { valid: true, userId: decoded.userId , sessionId : decoded.sessionId};
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return { valid: false, status: 401, message: "Refresh token expired" };
      } else if (error.name === "JsonWebTokenError") {
        return { valid: false, status: 401, message: "Invalid token" };
      } else {
        return { valid: false, status: 500, message: "Server error" };
      }
    }
  };
  