const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);
const { OAuth2Client } = require("google-auth-library");
const axios = require("axios");
const User = require("../models/User");
const mongoose = require("mongoose");
const { protect } = require("../middleware/auth");
const { getActiveSubscription } = require("../middleware/premiumContent");

const router = express.Router();

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

if (!process.env.JWT_SECRET) {
  console.error("FATAL ERROR: JWT_SECRET environment variable is not set.");
  process.exit(1);
}

const JWT_SECRET = process.env.JWT_SECRET;

// ─── Performance: Promise-based jwt.sign ─────────────────────────────────────
const jwtSign = (payload, secret, options) =>
  new Promise((resolve, reject) =>
    jwt.sign(payload, secret, options, (err, token) =>
      err ? reject(err) : resolve(token)
    )
  );

// ─── Performance: In-memory subscription cache (5 min TTL) ───────────────────
// Eliminates 1 DB round-trip per login for users whose subscription hasn't changed.
const subCache = new Map();
const SUB_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCachedSub(userId) {
  const entry = subCache.get(String(userId));
  if (!entry) return undefined; // not cached yet
  if (Date.now() > entry.expiresAt) {
    subCache.delete(String(userId));
    return undefined;
  }
  return entry.value; // could be null (no sub) or a document
}

function setCachedSub(userId, value) {
  subCache.set(String(userId), { value, expiresAt: Date.now() + SUB_CACHE_TTL });
}

// Export so subscription purchase/cancel routes can bust the cache
function invalidateSubCache(userId) {
  subCache.delete(String(userId));
}

async function getActiveSubscriptionCached(userId) {
  const cached = getCachedSub(userId);
  if (cached !== undefined) return cached;
  const sub = await getActiveSubscription(userId);
  setCachedSub(userId, sub);
  return sub;
}

function formatRemainingTime(ms) {
  if (ms <= 0) return "a moment";
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 1) {
    const remHours = hours % 24;
    return remHours > 0 ? `${days} days ${remHours} hours` : `${days} days`;
  }
  if (days === 1) {
    const remHours = hours % 24;
    return remHours > 0 ? `1 day ${remHours} hours` : `1 day`;
  }
  if (hours > 1) return `${hours} hours`;
  if (hours === 1) {
    const remMinutes = minutes % 60;
    return remMinutes > 0 ? `1 hour ${remMinutes} minutes` : `1 hour`;
  }
  if (minutes > 1) return `${minutes} minutes`;
  return "1 minute";
}

function getCookieOptions(req) {
  const origin = req.get("origin") || "";
  const host = req.get("host") || "";
  const isLocal = host.includes("localhost") || origin.includes("localhost");
  const isProd = process.env.NODE_ENV === "production" && !isLocal;
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: 5 * 24 * 60 * 60 * 1000,
  };
}

async function checkUserSuspension(user) {
  if (user.status === "suspended") {
    if (user.suspendedUntil && new Date() >= user.suspendedUntil) {
      user.status = "active";
      user.suspendedUntil = null;
      await user.save();
      return { isSuspended: false };
    }
    const remainingMs = user.suspendedUntil
      ? user.suspendedUntil.getTime() - Date.now()
      : null;
    const remainingText = remainingMs ? formatRemainingTime(remainingMs) : null;
    const msg = remainingText
      ? `Your account has been suspended. Please try again after ${remainingText}.`
      : `Your account has been permanently suspended. Please contact support.`;
    return {
      isSuspended: true,
      msg,
      suspendedUntil: user.suspendedUntil,
      remaining: remainingText,
    };
  }
  return { isSuspended: false };
}

// @route POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const {
      username,
      email,
      mobile,
      password,
      preferredLanguage,
      favoriteGenres,
      authProvider,
      role,
      dob,
    } = req.body;

    // Check if email or username exists
    const [userByEmail, userByUsername] = await Promise.all([
      User.findOne({ email }),
      User.findOne({ username }),
    ]);

    if (userByEmail || userByUsername) {
      return res.status(400).json({ msg: "name and email already taken" });
    }

    // Username validation
    const usernameRegex = /^(?![0-9]+$)[A-Za-z0-9_]{3,30}$/;
    if (!username || !usernameRegex.test(username)) {
      return res.status(400).json({ msg: "Username must be 3-30 characters long, alphanumeric with underscores, and cannot be only numbers." });
    }

    // Mobile validation
    const mobileRegex = /^[6-9][0-9]{9}$/;
    if (!mobile || !mobileRegex.test(mobile)) {
      return res.status(400).json({ msg: "Mobile number must be exactly 10 digits and start with 6-9." });
    }

    if (!authProvider || authProvider === "normal") {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s])[\S]{8,16}$/;
      if (!password || !passwordRegex.test(password)) {
        return res.status(400).json({
          msg: "Password must be 8-16 characters long, contain at least one uppercase letter, one lowercase letter, one number, one special character, and no spaces.",
        });
      }
    }

    let user = new User({
      username,
      email,
      mobile,
      preferredLanguage,
      favoriteGenres,
      authProvider: authProvider || "normal",
      role: role === "writer" ? "writer" : "reader",
      authorStatus: role === "writer" ? "approved" : "none",
      dob,
    });

    if (user.authProvider === "normal") {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();

    const isPremium = false; // new users never have a subscription
    const payload = { user: { id: user.id, role: user.role } };
    const token = await jwtSign(payload, JWT_SECRET, { expiresIn: "5d" });
    res.cookie("token", token, getCookieOptions(req)).json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        mobile: user.mobile,
        dob: user.dob,
        role: user.role,
        authorStatus: user.authorStatus,
        avatar: user.avatar,
        isPremium,
        isOnboarded: user.isOnboarded,
        penName: user.penName,
        legalName: user.legalName,
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server Error: " + err.message });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token — OPTIMIZED
// @access  Public
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    let user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(400).json({ msg: "Email not registered" });
    }

    const suspensionCheck = await checkUserSuspension(user);
    if (suspensionCheck.isSuspended) {
      return res.status(403).json({
        code: "ACCOUNT_SUSPENDED",
        status: "suspended",
        msg: suspensionCheck.msg,
        remaining: suspensionCheck.remaining,
        suspendedUntil: suspensionCheck.suspendedUntil,
      });
    }

    if (user.authProvider !== "normal") {
      return res.status(400).json({
        msg: `Please sign in using your ${user.authProvider} account`,
      });
    }

    // Fire-and-forget reactivation so it doesn't block login
    if (user.status === "deactivated") {
      user.status = "active";
      user.save().catch((e) => console.error("Reactivation save error:", e));
    }

    // ⚡ Run bcrypt AND subscription lookup IN PARALLEL — saves ~100-300ms per login
    const [isMatch, activeSub] = await Promise.all([
      bcrypt.compare(password, user.password),
      getActiveSubscriptionCached(user.id),
    ]);

    if (!isMatch) {
      return res.status(400).json({ msg: "Wrong password" });
    }

    const isPremium = !!activeSub;
    const payload = { user: { id: user.id, role: user.role } };
    const token = await jwtSign(payload, JWT_SECRET, { expiresIn: "5d" });

    res.cookie("token", token, getCookieOptions(req)).json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        mobile: user.mobile,
        dob: user.dob,
        role: user.role,
        authorStatus: user.authorStatus,
        avatar: user.avatar,
        isPremium,
        isOnboarded: user.isOnboarded,
        penName: user.penName,
        legalName: user.legalName,
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user and clear cookie
// @access  Public
router.post("/logout", (req, res) => {
  const opts = getCookieOptions(req);
  delete opts.maxAge;
  res.clearCookie("token", opts);
  res.json({ msg: "Logged out successfully" });
});

// @route   POST /api/auth/google
// @desc    Authenticate user with Google
// @access  Public
router.post("/google", async (req, res) => {
  try {
    const { token, dob } = req.body;

    // Verify Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payloadData = ticket.getPayload();
    const email = payloadData.email;
    const name = payloadData.name;
    const picture = payloadData.picture;

    // Check if user exists
    let user = await User.findOne({ email });

    if (user) {
      const suspensionCheck = await checkUserSuspension(user);
      if (suspensionCheck.isSuspended) {
        return res.status(403).json({
          code: "ACCOUNT_SUSPENDED",
          status: "suspended",
          msg: suspensionCheck.msg,
          remaining: suspensionCheck.remaining,
          suspendedUntil: suspensionCheck.suspendedUntil,
        });
      }
      if (user.status === "deactivated") {
        user.status = "active";
        await user.save();
      }

      // Update auth provider if they previously used normal login but now use google
      if (user.authProvider !== "google") {
        user.authProvider = "google";
        if (picture) user.avatar = picture;
        await user.save();
      }

      const activeSub = await getActiveSubscription(user.id);
      const isPremium = !!activeSub;
      const payload = { user: { id: user.id, role: user.role } };
      return jwt.sign(
        payload,
        JWT_SECRET,
        { expiresIn: "5d" },
        (err, token) => {
          if (err) throw err;
          const isProfileComplete = !!(
            user.mobile &&
            user.preferredLanguage &&
            user.mobile !== "Not Provided" &&
            user.dob
          );
          res.cookie("token", token, getCookieOptions(req)).json({
            token,
            isProfileComplete,
            user: {
              id: user.id,
              username: user.username,
              email: user.email,
              mobile: user.mobile,
            dob: user.dob,
              role: user.role,
              authorStatus: user.authorStatus,
              avatar: user.avatar,
              isPremium,
              isOnboarded: user.isOnboarded,
              penName: user.penName,
              legalName: user.legalName,
            },
          });
        },
      );
    }

    // User does not exist, directly create them in the database
    // Generate a username from name
    let baseUsername =
      name.replace(/[^a-zA-Z0-9]/g, "").toLowerCase() || "user";
    let username = baseUsername;
    let userExists = await User.findOne({ username });
    let counter = 1;
    while (userExists) {
      username = baseUsername + counter;
      userExists = await User.findOne({ username });
      counter++;
    }

    user = new User({
      username: username,
      email: email,
      mobile: "Not Provided",
      preferredLanguage: "en",
      favoriteGenres: [],
      avatar: picture,
      authProvider: "google",
      role: "reader",
      authorStatus: "none",
      dob: dob || new Date(2000, 0, 1), // Fallback if dob not provided properly
    });

    await user.save();

    const payload = { user: { id: user.id, role: user.role } };
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "5d" }, (err, token) => {
      if (err) throw err;
      res.cookie("token", token, getCookieOptions(req)).json({
        token,
        isProfileComplete: false,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          mobile: user.mobile,
            dob: user.dob,
          role: user.role,
          authorStatus: user.authorStatus,
          avatar: user.avatar,
          isPremium: false,
          isOnboarded: user.isOnboarded,
          penName: user.penName,
          legalName: user.legalName,
        },
      });
    });
  } catch (err) {
    console.error("Google auth error:", err);
    res.status(400).json({ msg: "Invalid Google token" });
  }
});

// @route   POST /api/auth/facebook
// @desc    Authenticate user with Facebook
// @access  Public
router.post("/facebook", async (req, res) => {
  try {
    const { token, dob } = req.body;

    // Verify Facebook token
    const fbResponse = await axios.get(`https://graph.facebook.com/me?access_token=${token}&fields=id,name,email,picture.type(large)`);
    const payloadData = fbResponse.data;
    
    const email = payloadData.email;
    const name = payloadData.name;
    const picture = payloadData.picture?.data?.url;

    if (!email) {
       return res.status(400).json({ msg: "Email permission is required from Facebook" });
    }

    // Check if user exists
    let user = await User.findOne({ email });

    if (user) {
      const suspensionCheck = await checkUserSuspension(user);
      if (suspensionCheck.isSuspended) {
        return res.status(403).json({
          code: "ACCOUNT_SUSPENDED",
          status: "suspended",
          msg: suspensionCheck.msg,
          remaining: suspensionCheck.remaining,
          suspendedUntil: suspensionCheck.suspendedUntil,
        });
      }
      if (user.status === "deactivated") {
        user.status = "active";
        await user.save();
      }

      // Update auth provider if they previously used normal login but now use facebook
      if (user.authProvider !== "facebook") {
        user.authProvider = "facebook";
        if (picture) user.avatar = picture;
        await user.save();
      }

      const activeSub = await getActiveSubscription(user.id);
      const isPremium = !!activeSub;
      const payload = { user: { id: user.id, role: user.role } };
      return jwt.sign(
        payload,
        JWT_SECRET,
        { expiresIn: "5d" },
        (err, token) => {
          if (err) throw err;
          const isProfileComplete = !!(
            user.mobile &&
            user.preferredLanguage &&
            user.mobile !== "Not Provided" &&
            user.dob
          );
          res.cookie("token", token, getCookieOptions(req)).json({
            token,
            isProfileComplete,
            user: {
              id: user.id,
              username: user.username,
              email: user.email,
              mobile: user.mobile,
            dob: user.dob,
              role: user.role,
              authorStatus: user.authorStatus,
              avatar: user.avatar,
              isPremium,
              isOnboarded: user.isOnboarded,
              penName: user.penName,
              legalName: user.legalName,
            },
          });
        },
      );
    }

    // User does not exist, directly create them in the database
    let baseUsername =
      name.replace(/[^a-zA-Z0-9]/g, "").toLowerCase() || "user";
    let username = baseUsername;
    let userExists = await User.findOne({ username });
    let counter = 1;
    while (userExists) {
      username = baseUsername + counter;
      userExists = await User.findOne({ username });
      counter++;
    }

    user = new User({
      username: username,
      email: email,
      mobile: "Not Provided",
      preferredLanguage: "en",
      favoriteGenres: [],
      avatar: picture,
      authProvider: "facebook",
      role: "reader",
      authorStatus: "none",
      dob: dob || new Date(2000, 0, 1),
    });

    await user.save();

    const payload = { user: { id: user.id, role: user.role } };
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "5d" }, (err, token) => {
      if (err) throw err;
      res.cookie("token", token, getCookieOptions(req)).json({
        token,
        isProfileComplete: false,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          mobile: user.mobile,
            dob: user.dob,
          role: user.role,
          authorStatus: user.authorStatus,
          avatar: user.avatar,
          isPremium: false,
          isOnboarded: user.isOnboarded,
          penName: user.penName,
          legalName: user.legalName,
        },
      });
    });
  } catch (err) {
    console.error("Facebook auth error:", err);
    res.status(400).json({ msg: "Invalid Facebook token" });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Generate 6-digit reset code and send email
// @access  Public
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ msg: "There is no user with that email" });
    }

    if (user.authProvider !== "normal") {
      return res
        .status(400)
        .json({
          msg: `You signed up with ${user.authProvider}, password reset is not applicable.`,
        });
    }

    // Generate 6-digit code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash code and set to resetPasswordToken field
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetCode)
      .digest("hex");

    // Set expire (1 hour)
    user.resetPasswordExpire = Date.now() + 60 * 60 * 1000;

    await user.save();

    // Send email using Resend
    try {
      const { data, error } = await resend.emails.send({
        from: process.env.EMAIL_FROM || "Mozhibu <support@mozhibu.com>",
        to: [user.email],
        subject: "Mozhibu - Password Reset Code",
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px;">
            <h2 style="color: #2F4F4F;">Password Reset Request</h2>
            <p>Hello ${user.username},</p>
            <p>You requested to reset your password. Please use the following 6-digit code to verify your request:</p>
            <div style="background-color: #f4f4f4; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0;">
              <span style="font-size: 28px; font-weight: bold; letter-spacing: 4px; color: #333;">${resetCode}</span>
            </div>
            <p style="margin-top: 20px; font-size: 12px; color: #666;">This code is valid for 1 hour. If you didn't request this, you can safely ignore this email.</p>
          </div>
        `,
      });

      if (error) {
        throw error;
      }

      res.json({ msg: "Password reset code has been sent to your email." });
    } catch (emailErr) {
      console.error("Email sending failed:", emailErr);

      // Reset the token fields if email fails
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
      
      console.log("\n--- EMAIL FAILED. RESET CODE ---");
      console.log(resetCode);
      console.log("----------------------------------\n");

      return res
        .status(500)
        .json({
          msg: "Email could not be sent. Please check backend console for the code.",
        });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   POST /api/auth/verify-reset-code
// @desc    Verify 6-digit reset code
// @access  Public
router.post("/verify-reset-code", async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ msg: "Please provide email and code" });
    }

    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(code)
      .digest("hex");

    const user = await User.findOne({
      email,
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ msg: "Invalid or expired reset code" });
    }

    res.json({ msg: "Code verified successfully." });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   POST /api/auth/reset-password
// @desc    Reset password using 6-digit code
// @access  Public
router.post("/reset-password", async (req, res) => {
  try {
    // Also accept email for better security with 6-digit codes
    const { email, code, password } = req.body;

    if (!email || !code || !password) {
      return res.status(400).json({ msg: "Please provide email, code, and new password" });
    }

    // Get hashed code
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(code)
      .digest("hex");

    const user = await User.findOne({
      email,
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ msg: "Invalid or expired reset code" });
    }

    // Validate new password
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s])[\S]{8,16}$/;
    if (!passwordRegex.test(password)) {
      return res
        .status(400)
        .json({
          msg: "Password must be 8-16 characters long, contain at least one uppercase letter, one lowercase letter, one number, one special character, and no spaces.",
        });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Clear reset token fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.json({ msg: "Password successfully updated! You can now log in." });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   PUT /api/auth/change-password
// @desc    Change user password
// @access  Private
router.put("/change-password", protect, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    
    // Find the user with password field
    const user = await User.findById(req.user.id).select("+password");
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    if (user.authProvider !== "normal") {
      return res.status(400).json({ msg: "Cannot change password for social login accounts." });
    }

    // Check old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Incorrect old password." });
    }

    // Validate new password
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s])[\S]{8,16}$/;
    if (!newPassword || !passwordRegex.test(newPassword)) {
      return res.status(400).json({
        msg: "Password must be 8-16 characters long, contain at least one uppercase letter, one lowercase letter, one number, one special character, and no spaces.",
      });
    }

    // Hash and save new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ msg: "Password successfully updated!" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET /api/auth/check-penname
// @desc    Check if a pen name is available
// @access  Public
router.get("/check-penname", async (req, res) => {
  try {
    const { name, excludeUserId } = req.query;
    if (!name) return res.status(400).json({ msg: "Pen name is required" });

    // Enforce valid characters — only lowercase letters, numbers, underscore
    if (/[^a-z0-9_]/.test(name)) {
      return res.json({ available: false, invalid: true });
    }

    // Build query: exact case-insensitive match
    const query = { penName: { $regex: new RegExp(`^${name}$`, "i") } };

    // Exclude the current user's own record so their existing pen name doesn't show as taken
    if (excludeUserId && mongoose.Types.ObjectId.isValid(excludeUserId)) {
      query._id = { $ne: new mongoose.Types.ObjectId(excludeUserId) };
    }

    const user = await User.findOne(query);
    return res.json({ available: !user });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   POST /api/auth/onboard
// @desc    Submit onboarding details (pen name, legal name)
// @access  Private
router.post("/onboard", protect, async (req, res) => {
  try {
    const { penName, legalName } = req.body;
    
    if (!penName || penName.trim() === "") {
      return res.status(400).json({ msg: "Pen name is required" });
    }
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    
    // Check pen name uniqueness
    const existing = await User.findOne({ 
      penName: { $regex: new RegExp(`^${penName}$`, "i") },
      _id: { $ne: user._id }
    });
    
    if (existing) {
      return res.status(400).json({ msg: "Pen name already exists. Please choose another." });
    }
    
    user.penName = penName.trim();
    user.username = penName.trim();
    if (legalName) user.legalName = legalName.trim();
    user.isOnboarded = true;
    
    await user.save();
    res.json({ msg: "Onboarding complete", user });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   POST /api/auth/complete-profile
// @desc    Complete profile for social login users
// @access  Private
router.post("/complete-profile", protect, async (req, res) => {
  try {
    const { mobile, dob, preferredLanguage, favoriteGenres, role } = req.body;
    
    let user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    if (mobile) user.mobile = mobile;
    if (dob) user.dob = dob;
    if (preferredLanguage) user.preferredLanguage = preferredLanguage;
    if (favoriteGenres) user.favoriteGenres = favoriteGenres;
    
    if (role === "writer" || role === "reader") {
      user.role = role;
      if (role === "writer" && user.authorStatus === "none") {
        user.authorStatus = "approved"; 
      }
    }

    await user.save();

    const activeSub = await getActiveSubscription(user.id);
    const isPremium = !!activeSub;

    res.json({
      msg: "Profile completed successfully",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        mobile: user.mobile,
            dob: user.dob,
        role: user.role,
        authorStatus: user.authorStatus,
        avatar: user.avatar,
        isPremium,
        isOnboarded: user.isOnboarded,
        penName: user.penName,
        legalName: user.legalName,
      }
    });
  } catch (err) {
    console.error("Complete profile error:", err.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

module.exports = router;
