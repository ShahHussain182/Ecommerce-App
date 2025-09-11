import express from "express";
import { forgotPassword, login, logout, refresh, resetPassword, signup, verifyEmail } from "../Controllers/auth.controller.js";
import { verifyAccessToken } from "../Middleware/verifyAccessToken.js";
const authRouter = express.Router();


authRouter.post("/signup",signup )
authRouter.post("/protected-route",verifyAccessToken,async (req,res,next) => {
    res.send("Hello")
} )

authRouter.post("/verify-email",verifyEmail);
authRouter.post("/login", login);
authRouter.post("/logout",logout);
authRouter.post("/forgot-password",forgotPassword);
authRouter.post("/reset-password/:token",resetPassword);
/* authRouter.get("/check-auth",resetPassword); */

authRouter.get("/refresh", refresh);



 
export default authRouter;