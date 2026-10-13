// Increase thread pool size for heavy concurrent crypto operations (like bcrypt during load testing)
process.env.UV_THREADPOOL_SIZE = '50';
require("dotenv").config();
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const mongoose = require("mongoose");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const path = require("path");
const cron = require("node-cron");
const cookieParser = require("cookie-parser");
const { computeEngagementScores } = require("./src/services/engagementScorer");
const { computeMonthlyRevenue } = require("./src/services/revenueEngine");

const app = express();
const server = http.createServer(app);
const corsOptions = {
  origin: function (origin, callback) {
    const frontendUrls = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',').map(url => url.trim().replace(/\/$/, '')) : [];
    const localUrls = process.env.LOCAL_FRONTEND_URLS ? process.env.LOCAL_FRONTEND_URLS.split(',').map(url => url.trim().replace(/\/$/, '')) : [];
    
    const allowedOrigins = [...frontendUrls, ...localUrls].filter(Boolean);
    
    if (!origin) {
      // console.warn(`CORS: No Origin header provided (allowed for server-to-server or local scripts)`);
      return callback(null, true);
    }
    
    // Dynamically allow any localhost port during development
    if (origin.startsWith('http://localhost:')) {
      return callback(null, true);
    }
    
    const normalizedOrigin = origin.trim().replace(/\/$/, '');
    if (allowedOrigins.includes(normalizedOrigin)) {
      return callback(null, true);
    }
    console.error(`CORS Blocked: Origin '${origin}' (length: ${origin.length}) does not match allowed origins: ${JSON.stringify(allowedOrigins)}`);
    return callback(new Error(`Not allowed by CORS. Origin: ${origin}`));
  },
  credentials: true,
};

const io = socketIo(server, {
  cors: corsOptions,
});

// Map sockets to users
const userSockets = new Map();

io.on("connection", (socket) => {
  console.log("New client connected", socket.id);

  socket.on("authenticate", (userId) => {
    userSockets.set(userId, socket.id);
    console.log(`User ${userId} authenticated on socket ${socket.id}`);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected", socket.id);
    for (const [userId, socketId] of userSockets.entries()) {
      if (socketId === socket.id) {
        userSockets.delete(userId);
        break;
      }
    }
  });
});

app.set("io", io);
app.set("userSockets", userSockets);
const PORT = process.env.PORT || 5000;

// Trust the reverse proxy to get correct IP for rate limiters
app.set("trust proxy", 1);

// Middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } })); // Security headers
app.use(compression()); // Compress responses
app.use(cookieParser());
app.use(cors(corsOptions)); // CORS must be before rate limiters so they include correct headers

// CSRF Protection
const csrfProtection = require("./src/middleware/csrf");
app.use(csrfProtection);

const isLoadTesting = process.env.LOAD_TESTING === 'true';

// Global Rate Limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isLoadTesting ? 50000 : 1000, 
  message: {
    msg: "Too many requests from this IP, please try again after 15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/", globalLimiter);

// Auth Rate Limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isLoadTesting ? 10000 : 500, 
  message: { msg: "Too many authentication attempts from this network, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/auth", authLimiter);

// Strict brute-force limiter 
const bruteForceLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isLoadTesting ? 10000 : 10,
  skipSuccessfulRequests: true, 
  message: { msg: "Too many failed login attempts. Please wait 15 minutes before trying again." },
  standardHeaders: true,
  legacyHeaders: false,
});
// Applied only to the login endpoint, not register/google/facebook
app.use("/api/auth/login", bruteForceLoginLimiter);

app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ limit: "5mb", extended: true }));

// Prevent browser/proxy from caching any API response
app.use("/api/", (req, res, next) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
  res.set("Surrogate-Control", "no-store");
  next();
});

// Serve static uploads
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Database connection
if (process.env.NODE_ENV !== "test") {
  mongoose
    .connect(process.env.MONGODB_URI, {
      maxPoolSize: 500, // Handle up to 500 concurrent connections
      serverSelectionTimeoutMS: 15000, // Keep trying to send operations for 15 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    })
    .then(() =>
      console.log("Connected to MongoDB Atlas with optimized pool size"),
    )
    .catch((err) => console.error("MongoDB connection error:", err));
}

// Routes
const authRoutes = require("./src/routes/auth");
const bookRoutes = require("./src/routes/books");
const adminRoutes = require("./src/routes/admin");
const userRoutes = require("./src/routes/users");
const notificationRoutes = require("./src/routes/notifications");
const competitionRoutes = require("./src/routes/competitions");
const searchRoutes = require("./src/routes/search");
const feedbackRoutes = require("./src/routes/feedback");
const settingsRoutes = require("./src/routes/settings");
const contactRoutes = require("./src/routes/contact");

const subscriptionRoutes = require("./src/routes/subscriptions");
const revenueRoutes = require("./src/routes/revenue");
const earningsRoutes = require("./src/routes/earnings");

app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/users", userRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/competitions", competitionRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/contact", contactRoutes);

// Google AdSense verification
app.get("/ads.txt", (req, res) => {
  res.type("text/plain");
  res.send("google.com, pub-7352988656804206, DIRECT, f08c47fec0942fa0\n");
});
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/revenue", revenueRoutes);
app.use("/api", earningsRoutes);

// Basic route
app.get("/api", (req, res) => {
  res.json({ message: "Mozhibu API is running fine" });
});

// Proxy for Google Input Tools Transliteration API
app.get("/api/tools/transliterate", async (req, res) => {
  try {
    const { text, itc, num, cp, cs, ie, oe, app: appName } = req.query;
    const url = `https://inputtools.google.com/request?text=${encodeURIComponent(text)}&itc=${itc}&num=${num}&cp=${cp}&cs=${cs}&ie=${ie}&oe=${oe}&app=${appName}`;
    
    // Use dynamic import for node-fetch if native fetch isn't available, or just native fetch
    let response;
    if (typeof fetch === 'function') {
      response = await fetch(url);
    } else {
      const fetchMod = await import('node-fetch');
      const fetchFn = fetchMod.default;
      response = await fetchFn(url);
    }
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Transliteration proxy error:", error);
    res.status(500).json({ error: "Failed to fetch transliteration" });
  }
});

// Start server
if (process.env.NODE_ENV !== "test") {
  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

// ─── Cron Jobs ────────────────────────────────────────────────

// Nightly at 2:00 AM: compute engagement scores for current month
cron.schedule("0 2 * * *", async () => {
  const now = new Date();
  console.log(
    `[Cron] Running nightly engagement scorer for ${now.getFullYear()}-${now.getMonth() + 1}`,
  );
  try {
    await computeEngagementScores(now.getFullYear(), now.getMonth() + 1);
  } catch (err) {
    console.error("[Cron] Engagement scoring failed:", err.message);
  }
});

// 1st of each month at 3:00 AM: auto-compute revenue for previous month
cron.schedule("0 3 1 * *", async () => {
  const now = new Date();
  // Previous month
  const d = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  console.log(
    `[Cron] Running monthly revenue computation for ${year}-${month}`,
  );
  try {
    await computeMonthlyRevenue(year, month, "system");
    console.log(`[Cron] Revenue computation complete for ${year}-${month}`);
  } catch (err) {
    console.error(`[Cron] Error computing engagement scores:`, err);
  }
});

// Daily: expire subscriptions past end_date
cron.schedule("0 0 * * *", async () => {
  try {
    const UserSubscription = require("./src/models/UserSubscription");
    const result = await UserSubscription.updateMany(
      { status: "active", endDate: { $lt: new Date() } },
      { $set: { status: "expired" } },
    );
    if (result.modifiedCount > 0) {
      console.log(`[Cron] Expired ${result.modifiedCount} subscriptions`);
    }
  } catch (err) {
    console.error("[Cron] Subscription expiry failed:", err.message);
  }
});

// Every minute: Publish scheduled chapters
cron.schedule("* * * * *", async () => {
  try {
    const Chapter = require("./src/models/Chapter");
    const Book = require("./src/models/Book");
    const Notification = require("./src/models/Notification");
    const User = require("./src/models/User");

    const now = new Date();
    // Find chapters that are scheduled and due for publishing
    const chaptersToPublish = await Chapter.find({
      status: "scheduled",
      scheduledAt: { $lte: now },
    });

    for (const chapter of chaptersToPublish) {
      chapter.status = "published";
      await chapter.save();

      // Notify followers of the book's author
      const book = await Book.findById(chapter.book);
      if (book) {
        const followers = await User.find({ following: book.author });
        const notifications = followers.map((follower) => ({
          recipient: follower._id,
          sender: book.author,
          type: "new_chapter",
          title: "New Chapter Published",
          message: `A new chapter for "${book.title}" is now available.`,
          link: `/story/${book._id}/read/${chapter._id}`,
        }));
        if (notifications.length > 0) {
          await Notification.insertMany(notifications);
        }
        console.log(`[Cron] Published scheduled chapter ${chapter._id} for book ${book._id}`);
      }
    }
  } catch (err) {
    console.error("[Cron] Scheduled chapter publish failed:", err.message);
  }
});

module.exports = server;

// triggered restart
