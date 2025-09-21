import express from "express";
import { checkAuth, forgotPassword, login, logout, refresh, resetPassword, signup, updateUserProfile, verifyEmail } from "../Controllers/auth.controller.js";
import { requireAuth } from "../Middleware/requireAuth.js";
const authRouter = express.Router();


authRouter.post("/signup",signup )
authRouter.post("/protected-route",requireAuth,async (req,res,next) => {
    res.send("Hello")
} )

authRouter.post("/verify-email",verifyEmail);
authRouter.post("/login", login);
authRouter.post("/logout",logout);
authRouter.post("/forgot-password",forgotPassword);
authRouter.post("/reset-password/:token",resetPassword);
authRouter.get("/check-auth",requireAuth,checkAuth);

authRouter.get("/refresh", refresh);
authRouter.put("/profile", requireAuth, updateUserProfile); // New route for profile updates


 
export default authRouter;