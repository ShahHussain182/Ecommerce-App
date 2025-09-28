import { User } from "../Models/user.model.js";
import { codeSchema, forgotPasswordSchema, loginSchema, loginSchema1, resetPasswordSchema, resetPasswordSchema1, signupSchema, updateUserSchema, changePasswordSchema, resendVerificationCodeSchema } from "../Schemas/authSchema.js";
import { VerificationCodeModel } from "../Models/verificationCode.model.js";
import catchErrors from "../Utils/catchErrors.js";
import verificationCodeType from "../Constants/verificationCodeType.js";
import { oneHourFromNow } from "../Utils/date.js";
import { signAccessToken, signRefreshToken } from "../Utils/generateTokens.js";
import { setCookies } from "../Utils/setCookie.js";
import { sendVerificationEmail, sendWelcomeEmail,sendPasswordResetEmail ,sendResetSuccessEmail} from "../mailtrap/emails.js";
import { ResetCode } from "../Models/resetCode.model.js";
import { verifyRefreshToken } from "../Utils/verifyTokens.js";
import redisClient from "../Utils/redisClient.js";
import jwt from "jsonwebtoken";
export const signup = catchErrors(async (req, res, next) => {


  const data = signupSchema.parse({
    ...req.body,
  });
  const { userName,  email, password, phoneNumber } = data;
  const existingUser = await User.findOne({
    $or: [{ email }, { userName }, { phoneNumber }],
  });

  if (existingUser) {
    if (existingUser.email === email) {
      return res.status(400).json({
        success: false,
        message: "Email already exists.",
      });
    } else if (existingUser.userName === userName) {
      return res.status(400).json({
        success: false,
        message: "Username already exists.",
      });
    } else if (existingUser.phoneNumber === phoneNumber) {
      return res.status(400).json({
        success: false,
        message: "Phone number already exists.",
      });
    }
  }
  const user = await User.create({
    userName,
   
    email,
    password,
    phoneNumber,
  });


  const verificationCode = await VerificationCodeModel.create({
    userId: user._id,
    type: verificationCodeType.EmailVerification,
    expiresAt: oneHourFromNow(),
  });


  const accessToken = await signAccessToken({ userId: user._id.toString(), sessionId: req.sessionID });
  const refreshToken = await signRefreshToken({
    userId: user._id.toString(),
    sessionId: req.sessionID,
  });
  await redisClient.set(
    `rt:${user._id}:${req.sessionID}`,
    refreshToken,
    "EX",
    60 * 60 * 24 * 30 // 30 days
  );

  req.session.userId = user._id;
  req.session.token = accessToken;
  setCookies(res, accessToken, "AccessToken");
  setCookies(res, refreshToken, "RefreshToken");

   /* await sendVerificationEmail(user.email, verificationCode.code);  */
  console.log(user)
  res.status(200).json({
    success: true,
    user: user.pomitPassword(),
    messaage: "User Created Successfully",
    session: req.session
  });
});

export const verifyEmail = catchErrors(async (req, res) => {
  const verificationCode = codeSchema.parse(req.body.code);
  const validCode = await VerificationCodeModel.findOne({
    code: verificationCode,
    type: verificationCodeType.EmailVerification,
    expiresAt: { $gt: Date.now() },
  });
  if (!validCode) {
    return res.status(400).json({
      success: false,
      message: "Invalid or Expired Code.",
    });
  }
  const updatedUser = await User.findByIdAndUpdate(
    validCode.userId,
    { isVerified: true },
    { new: true }
  );
  if (!updatedUser) {
    return res.status(400).json({
      success: false,
      message: "Failed to verify email.",
    });
  }
  await validCode.deleteOne();
  /* await sendWelcomeEmail(updatedUser.email, updatedUser.name) */
  res.status(200).json({
    success: true,
    user: updatedUser.pomitPassword(),
    messaage: "Email verified Successfully",
    session: req.session,
  });
});
export const login = catchErrors(async (req, res) => {
  console.log(req.session);

  // 1) initial lightweight parse (ensures fields exist)
  const { emailOrUsername, password: rawPassword } = loginSchema1.parse({
    ...req.body,
  });
  console.log(emailOrUsername, rawPassword);

  // 2) determine whether it's an email or username and fully validate
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  let parsedData;
  if (emailRegex.test(emailOrUsername)) {
    parsedData = loginSchema.parse({
      email: emailOrUsername.toLowerCase(),
      password: rawPassword,
    });
  } else {
    parsedData = loginSchema.parse({
      userName: emailOrUsername,
      password: rawPassword,
    });
  }

  // parsedData will contain either `email` or `userName` and `password`
  const { email: mail, userName: username, password } = parsedData;
  console.log(mail, username, password);

  // 3) quick anti-automation/hack check (keeps your original logic)
  if (req.body.email || req.body.phoneNumber) {
    console.log("hackr");
    return res.status(403).json({
      success: false,
      message: "Something is wrong.",
    });
  }

  // 4) find user (make sure to select password if schema hides it)
  const user = await User.findOne({
    $or: [{ email: mail }, { userName: username }],
  }).select("+password");

  if (!user) {
    return res.status(400).json({
      success: false,
      message: "Invalid credentials.",
    });
  }

  // 5) compare password (uses your model method)
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(400).json({
      success: false,
      message: "Invalid credentials.",
    });
  }

  // 6) check verification
  if (!user.isVerified) {
    return res.status(403).json({
      success: false,
      message: "Please verify your email before logging in",
    });
  }

  // 7) regenerate session to prevent fixation attacks
  req.session.regenerate((err) => {
    if (err) {
      console.error("Session regeneration failed:", err);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }

    // Use an async IIFE to keep awaits inside the regenerate callback
    (async () => {
      try {
        // generate tokens (sessionId is the regenerated req.sessionID)
        const accessToken = await signAccessToken({
          userId: user._id.toString(),
          sessionId: req.sessionID,
        });
        const refreshToken = await signRefreshToken({
          userId: user._id.toString(),
          sessionId: req.sessionID,
        });
        const key = `rt:${user._id}:${req.sessionID}`;
await redisClient.setex(key, 60 * 60 * 24 * 30, refreshToken);

const stored = await redisClient.get(key);
const ttl = await redisClient.ttl(key); // returns seconds remaining, -2 = missing, -1 = no TTL

console.log("redis stored:", !!stored, "ttl:", ttl, "valueSample:", stored?.slice(0,10));
        // store session values
        req.session.userId = user._id;
        req.session.token = accessToken;

        // set cookies (your helper)
        setCookies(res, accessToken, "AccessToken");
        setCookies(res, refreshToken, "RefreshToken");

        // update last login and save
        user.lastLogin = new Date();
        await user.save({ validateBeforeSave: false });

        // final response (inside regenerate callback)
        res.status(200).json({
          success: true,
          user: user.pomitPassword(), // preserved your method name
          message: "Login successful",
          session: req.session,
        });
      } catch (e) {
        console.error("Error during post-regenerate login steps:", e);
        return res.status(500).json({
          success: false,
          message: "Internal server error",
        });
      }
    })();
  });
});


export const logout = catchErrors(async (req, res) => {
  const sessionId = req.sessionID;
  const refreshToken = req.cookies.RefreshToken;
  req.session.destroy(async (err) => {
    if (err) {
      console.error("❌ Failed to destroy session:", err);
      return res.status(500).json({
        success: false,
        message: "Internal server error during logout",
      });
    }
    if (refreshToken) {
      // store it in Redis with same expiry (30d)
      const decoded = jwt.decode(refreshToken);
      const expiresInSec = decoded?.exp ? decoded.exp - Math.floor(Date.now() / 1000) : 60 * 60 * 24 * 30;
      await redisClient.setex(`bl_rt:${refreshToken}`, expiresInSec, "blacklisted");
    }
    res.clearCookie("AccessToken", {
      sameSite: "strict",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production"
    });

    res.clearCookie("RefreshToken", {
      sameSite: "strict",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production"
    });
    res.clearCookie("connect.sid", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });
    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  res.send("logout route");
})
});
export const forgotPassword = catchErrors(async (req, res) => {

  const { email } = forgotPasswordSchema.strict().parse({
    ...req.body,
  });
  
	
		const user = await User.findOne({ email });

		if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials.",
      });
    }
    
    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email before logging in",
      });
    }
		// Generate reset token
		
    const resetCode = await ResetCode.create({
      userId: user._id,
      type: verificationCodeType.PasswordReset,
      expiresAt: oneHourFromNow(),
    });
		

		

		// send email
		/* await sendPasswordResetEmail(user.email, `${process.env.CLIENT_URL}/reset-password/${resetCode.code}`); */

		res.status(200).json({ success: true, message: "Password reset link sent to your email" });
	 
	}
);
export const resetPassword = catchErrors(async (req, res) => {

  
		const { token } = req.params;
    console.log(token)
    const { code } = resetPasswordSchema1.strict().parse({
      
      code:token
    });
   
    const resetCode = await ResetCode.findOne({
			code : code,
			expiresAt : { $gt: Date.now() },
		});
    if (!resetCode) {
			return res.status(400).json({ success: false, message: "Invalid or expired reset token" });
		}
		const {password } = resetPasswordSchema.strict().parse({
      ...req.body,
      
    });
     
		
   
	
    const user = await User.findOne({ _id : resetCode.userId });
    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email before logging in",
      });
    }
		// update password
		
    const updatedUser = await User.findByIdAndUpdate(
      user._id ,
      { password : password },
      { new: true }
    );
		console.log(updatedUser)
    await ResetCode.deleteOne({ _id: resetCode._id });
		/* await sendResetSuccessEmail(updatedUser.email); */


		res.status(200).json({ success: true, message: "Password reset successful" });
	 
});
export const refresh = catchErrors(async (req, res) => {
  const refreshToken = req.cookies.RefreshToken;
  const result = await verifyRefreshToken(refreshToken); // ⬅️ await now
  
  if (!result.valid) {
    return res.status(result.status).json({ success: false, message: result.message });
  }
  const stored = await redisClient.get(`rt:${result.userId}:${req.sessionID}`);
if (!stored || stored !== refreshToken) {
  return res.status(401).json({ message: "Invalid refresh token" });
}
  const blacklisted = await redisClient.get(`bl_rt:${req.cookies.RefreshToken}`);
  if (blacklisted) {
    return res.status(401).json({ success: false, message: "Refresh token is revoked" });
  }

  // check session still valid
  const session = await new Promise((resolve, reject) => {
    req.sessionStore.get(result.sessionId, (err, session) => {
      if (err) return reject(err);
      resolve(session);
    });
  });

  if (!session) {
    return res.status(401).json({ success: false, message: "Session expired or invalid" });
  }

  req.session.touch();

  // Issue new tokens
  const newAccessToken = await signAccessToken({
    userId: result.userId.toString(),
    sessionId: req.sessionID,
  });
  const newRefreshToken = await signRefreshToken({
    userId: result.userId.toString(),
    sessionId: req.sessionID,
  });

  await redisClient.set(
    `rt:${result.userId}:${req.sessionID}`,
    newRefreshToken,
    "EX",
    60 * 60 * 24 * 30 // 30 days
  );
  
  // (Optional) blacklist old refresh token for replay detection
  const oldToken = req.cookies.RefreshToken;
  if (oldToken) {
    const decoded = jwt.decode(oldToken);
    const expiresInSec = decoded?.exp ? decoded.exp - Math.floor(Date.now() / 1000) : 60 * 60 * 24 * 30;
    await redisClient.setex(`bl_rt:${oldToken}`, expiresInSec, "rotated");
  }

  setCookies(res, newAccessToken, "AccessToken");
  setCookies(res, newRefreshToken, "RefreshToken");

  res.status(200).json({ success: true, message: "Tokens refreshed successfully" });
});

export const checkAuth = catchErrors(async (req, res) => {
  // req.user is populated by requireAuth middleware
  if (!req.user) {
    return res.status(401).json({ success: false, message: "User not authenticated" });
  }

  // Return the user object, which now includes the role
  res.status(200).json({ success: true, user: req.user.pomitPassword() });
  
});

export const updateUserProfile = catchErrors(async (req, res) => {
  const userId = req.userId; // From requireAuth middleware
  const updates = updateUserSchema.parse(req.body);

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found." });
  }

  // Handle unique constraint checks for email, userName, phoneNumber
  if (updates.email && updates.email !== user.email) {
    const emailExists = await User.findOne({ email: updates.email });
    if (emailExists && !emailExists._id.equals(userId)) {
      return res.status(400).json({ success: false, message: "Email already in use." });
    }
    user.email = updates.email;
    user.isVerified = false; // Mark as unverified if email changes
    // Optionally send new verification email here
    const verificationCode = await VerificationCodeModel.create({
      userId: user._id,
      type: verificationCodeType.EmailVerification,
      expiresAt: oneHourFromNow(),
    });
    /* await sendVerificationEmail(user.email, verificationCode.code); */
  }

  if (updates.userName && updates.userName !== user.userName) {
    const userNameExists = await User.findOne({ userName: updates.userName });
    if (userNameExists && !userNameExists._id.equals(userId)) {
      return res.status(400).json({ success: false, message: "Username already in use." });
    }
    user.userName = updates.userName;
  }

  if (updates.phoneNumber && updates.phoneNumber !== user.phoneNumber) {
    const phoneNumberExists = await User.findOne({ phoneNumber: updates.phoneNumber });
    if (phoneNumberExists && !phoneNumberExists._id.equals(userId)) {
      return res.status(400).json({ success: false, message: "Phone number already in use." });
    }
    user.phoneNumber = updates.phoneNumber;
  }

  await user.save({ validateBeforeSave: false }); // Skip password hashing pre-save hook

  res.status(200).json({
    success: true,
    message: "Profile updated successfully.",
    user: user.pomitPassword(),
  });
});

export const changePassword = catchErrors(async (req, res) => {
  const userId = req.userId; // From requireAuth middleware
  const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);

  const user = await User.findById(userId).select('+password'); // Select password to compare
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found." });
  }

  // Compare current password
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    return res.status(400).json({ success: false, message: "Incorrect current password." });
  }

  // Update password
  user.password = newPassword; // Pre-save hook will hash it
  await user.save();

  res.status(200).json({ success: true, message: "Password updated successfully." });
});

export const resendVerificationCode = catchErrors(async (req, res) => {
  const { email } = resendVerificationCodeSchema.parse(req.body);

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found." });
  }

  if (user.isVerified) {
    return res.status(400).json({ success: false, message: "Email is already verified." });
  }

  // Delete any existing unexpired verification codes for this user
  await VerificationCodeModel.deleteMany({
    userId: user._id,
    type: verificationCodeType.EmailVerification,
    expiresAt: { $gt: Date.now() },
  });

  // Generate a new verification code
  const newVerificationCode = await VerificationCodeModel.create({
    userId: user._id,
    type: verificationCodeType.EmailVerification,
    expiresAt: oneHourFromNow(),
  });

  /* await sendVerificationEmail(user.email, newVerificationCode.code); */
  console.log(`New verification code for ${user.email}: ${newVerificationCode.code}`);

  res.status(200).json({ success: true, message: "New verification code sent. Please check your email." });
});