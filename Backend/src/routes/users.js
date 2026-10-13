const express = require("express");
const { protect } = require("../middleware/auth");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const sharp = require("sharp");
const cryptoUtils = require("../utils/crypto");
const User = require("../models/User");
const Book = require("../models/Book");
const ReadingProgress = require("../models/ReadingProgress");
const { translateBooks } = require("../services/translationService");
const { getActiveSubscription } = require("../middleware/premiumContent");

const router = express.Router();
if (!process.env.JWT_SECRET) {
  console.error("FATAL ERROR: JWT_SECRET environment variable is not set.");
  process.exit(1);
}
const JWT_SECRET = process.env.JWT_SECRET;

// Configure Multer for Avatar Uploads (Memory Storage)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only images are allowed"));
    }
  },
});

// @route PUT /api/users/upgrade-role
// @desc Upgrade a reader to a writer
router.put("/upgrade-role", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    if (user.role === "writer" || user.role === "superadmin") {
      return res
        .status(400)
        .json({ msg: "User is already an author or admin" });
    }

    user.authorStatus = "approved";
    user.role = "writer";
    await user.save();

    // Issue a new token with the updated authorStatus
    const payload = { user: { id: user.id, role: user.role } };
    jwt.sign(payload, JWT_SECRET, { expiresIn: "5d" }, (err, token) => {
      if (err) throw err;
      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          mobile: user.mobile,
          role: user.role,
          authorStatus: user.authorStatus,
        },
      });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

// @route GET /api/users/me
// @desc Get current user's full profile
router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password").lean();
    if (!user) return res.status(404).json({ msg: "User not found" });
    const activeSub = await getActiveSubscription(user._id);
    const userObj = user;
    userObj.isPremium = !!activeSub;
    
    // Decrypt and mask monetization data if it exists
    if (userObj.monetization) {
      if (userObj.monetization.accountNumber) {
        const decryptedAcc = cryptoUtils.decrypt(userObj.monetization.accountNumber);
        userObj.monetization.accountNumber = cryptoUtils.maskData(decryptedAcc);
      }
      if (userObj.monetization.ifscCode) {
        const decryptedIfsc = cryptoUtils.decrypt(userObj.monetization.ifscCode);
        userObj.monetization.ifscCode = cryptoUtils.maskData(decryptedIfsc, 4);
      }
      if (userObj.monetization.accountName) {
        userObj.monetization.accountName = cryptoUtils.decrypt(userObj.monetization.accountName) || "";
      }
      if (userObj.monetization.bankName) {
        userObj.monetization.bankName = cryptoUtils.decrypt(userObj.monetization.bankName) || "";
      }
    }
    
    res.json(userObj);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

// @route GET /api/users/me/library
// @desc Get current user's saved books
router.get("/me/library", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: "savedBooks",
      populate: { path: "author", select: "username avatar" },
    });
    if (!user) return res.status(404).json({ msg: "User not found" });

    const targetLang = req.headers["x-app-language"] || "en";
    const translatedBooks = await translateBooks(user.savedBooks, targetLang);

    res.json(translatedBooks);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

// @route POST /api/users/me/bookmarks/:bookId
// @desc Toggle bookmark status for a book
router.post("/me/bookmarks/:bookId", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const book = await Book.findById(req.params.bookId);

    if (!user || !book) {
      return res.status(404).json({ msg: "User or Book not found" });
    }

    const isBookmarked = user.savedBooks.some(
      (id) => id.toString() === req.params.bookId,
    );

    if (isBookmarked) {
      // Remove bookmark
      user.savedBooks = user.savedBooks.filter(
        (id) => id.toString() !== req.params.bookId,
      );
      await user.save();
      if (book.bookmarksCount > 0) book.bookmarksCount -= 1;
      await book.save();
      res.json({ msg: "Bookmark removed", isBookmarked: false });
    } else {
      // Add bookmark
      user.savedBooks.push(req.params.bookId);
      await user.save();
      book.bookmarksCount = (book.bookmarksCount || 0) + 1;
      await book.save();
      res.json({ msg: "Bookmarked successfully", isBookmarked: true });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

// @route GET /api/users/me/favorites
// @desc Get current user's favorite books
router.get("/me/favorites", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: "favoriteBooks",
      populate: { path: "author", select: "username avatar" },
    });
    if (!user) return res.status(404).json({ msg: "User not found" });

    const targetLang = req.headers["x-app-language"] || "en";
    const translatedBooks = await translateBooks(user.favoriteBooks, targetLang);

    res.json(translatedBooks);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

// @route POST /api/users/me/favorites/:bookId
// @desc Toggle favorite status for a book
router.post("/me/favorites/:bookId", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const book = await Book.findById(req.params.bookId);

    if (!user || !book) {
      return res.status(404).json({ msg: "User or Book not found" });
    }

    const isFavorited = user.favoriteBooks.some(
      (id) => id.toString() === req.params.bookId,
    );

    if (isFavorited) {
      // Remove favorite
      user.favoriteBooks = user.favoriteBooks.filter(
        (id) => id.toString() !== req.params.bookId,
      );
      await user.save();
      if (book.favoritesCount > 0) book.favoritesCount -= 1;
      await book.save();
      res.json({ msg: "Favorite removed", isFavorited: false });
    } else {
      // Add favorite
      user.favoriteBooks.push(req.params.bookId);
      await user.save();
      book.favoritesCount = (book.favoritesCount || 0) + 1;
      await book.save();
      res.json({ msg: "Favorited successfully", isFavorited: true });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

// @route GET /api/users/me/following
// @desc Get current user's followed authors
router.get("/me/following", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate(
      "following",
      "username avatar followersCount",
    );
    if (!user) return res.status(404).json({ msg: "User not found" });
    res.json(user.following);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

// @route GET /api/users/me/followers
// @desc Get current user's followers
router.get("/me/followers", protect, async (req, res) => {
  try {
    const followers = await User.find({ following: req.user.id }).select(
      "username avatar followersCount",
    );
    res.json(followers);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

// @route GET /api/users/authors
// @desc Get all platform authors
router.get("/authors", async (req, res) => {
  try {
    const authors = await User.find({
      role: "writer",
      status: "active",
    })
      .select("username avatar followersCount bio role isPremium")
      .sort({ followersCount: -1 });
    res.json(authors);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

// @route GET /api/users/author/:id
// @desc Get author profile and their published books
router.get("/author/:id", async (req, res) => {
  try {
    const author = await User.findOne({
      _id: req.params.id,
      status: "active",
    }).select("username avatar followersCount bio role createdAt isPremium");

    if (!author) {
      return res.status(404).json({ msg: "User not found" });
    }

    const books = await Book.find({
      author: req.params.id,
      status: "published",
    })
      .populate("author", "username avatar")
      .sort({ createdAt: -1 });

    const targetLang = req.headers["x-app-language"] || "en";
    const translatedBooks = await translateBooks(books, targetLang);

    res.json({ author, books: translatedBooks });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

// @route GET /api/users/author/:id/followers
// @desc Get author's followers
router.get("/author/:id/followers", async (req, res) => {
  try {
    const followers = await User.find({ following: req.params.id, status: "active" }).select(
      "username avatar followersCount isPremium"
    );
    res.json(followers);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

// @route GET /api/users/author/:id/following
// @desc Get author's following
router.get("/author/:id/following", async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id, status: "active" }).populate(
      "following",
      "username avatar followersCount isPremium"
    );
    if (!user) return res.status(404).json({ msg: "User not found" });
    // Filter out inactive users from populated array if needed, but simple return is okay
    res.json(user.following);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

// @route GET /api/users/author/:id/reviews
// @desc Get reviews written by the user
router.get("/author/:id/reviews", async (req, res) => {
  try {
    const Review = require("../models/Review");
    const reviews = await Review.find({ user: req.params.id, parentReview: null })
      .populate("user", "username avatar isPremium")
      .populate("book", "title cover")
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

// @route POST /api/users/follow/:authorId
// @desc Follow or unfollow an author
router.post("/follow/:authorId", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const authorToFollow = await User.findById(req.params.authorId);

    if (!user || !authorToFollow) {
      return res.status(404).json({ msg: "User not found" });
    }

    if (
      authorToFollow.role !== "writer" &&
      authorToFollow.role !== "superadmin"
    ) {
      return res.status(400).json({ msg: "Can only follow authors" });
    }

    if (req.user.id === req.params.authorId) {
      return res.status(400).json({ msg: "Cannot follow yourself" });
    }

    const isFollowing = user.following.some(
      (id) => id.toString() === req.params.authorId,
    );

    if (isFollowing) {
      // Unfollow
      user.following = user.following.filter(
        (id) => id.toString() !== req.params.authorId,
      );
      authorToFollow.followersCount = Math.max(
        0,
        authorToFollow.followersCount - 1,
      );
      await user.save({ validateModifiedOnly: true });
      await authorToFollow.save({ validateModifiedOnly: true });
      res.json({ msg: "Unfollowed successfully", following: false });
    } else {
      // Follow
      if (!user.following.some((id) => id.toString() === req.params.authorId)) {
        user.following.push(req.params.authorId);
      }
      authorToFollow.followersCount += 1;
      await user.save({ validateModifiedOnly: true });
      await authorToFollow.save({ validateModifiedOnly: true });

      const Notification = require("../models/Notification");
      await Notification.create({
        recipient: authorToFollow._id,
        sender: user._id,
        type: "follower",
        title: "New Follower",
        message: `${user.username} started following you.`,
        link: `/author/${user._id}`,
      });

      res.json({ msg: "Followed successfully", following: true });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
});



// @route GET /api/users/me/progress
// @desc Get reading progress for user
router.get("/me/progress", protect, async (req, res) => {
  try {
    const progress = await ReadingProgress.find({ user: req.user.id })
      .populate({
        path: "book",
        select: "title cover author chapters genre",
        populate: {
          path: "author",
          select: "username avatar"
        }
      })
      .populate("currentChapter", "title order")
      .sort({ lastReadAt: -1 });

    const targetLang = req.headers["x-app-language"] || "en";

    // We only need to translate the populated book titles here
    const booksToTranslate = progress.map((p) => p.book).filter((b) => b);
    await translateBooks(booksToTranslate, targetLang);

    const Chapter = require("../models/Chapter");
    const progressWithCounts = await Promise.all(
      progress.map(async (p) => {
        const plainP = p.toObject();
        if (plainP.book) {
          const count = await Chapter.countDocuments({ book: plainP.book._id, status: "published" });
          plainP.book.chaptersCount = count;
        }
        return plainP;
      })
    );

    res.json(progressWithCounts);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

// @route POST /api/users/me/progress
// @desc Update reading progress for a book
router.post("/me/progress", protect, async (req, res) => {
  try {
    const { bookId, chapterId, progressPercentage } = req.body;
    let progress = await ReadingProgress.findOne({
      user: req.user.id,
      book: bookId,
    });

    if (progress) {
      if (chapterId) progress.currentChapter = chapterId;
      if (progressPercentage !== undefined)
        progress.progressPercentage = progressPercentage;
      progress.lastReadAt = Date.now();
      await progress.save();
    } else {
      progress = await ReadingProgress.create({
        user: req.user.id,
        book: bookId,
        currentChapter: chapterId,
        progressPercentage: progressPercentage || 0,
      });
    }

    res.json(progress);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

// @route POST /api/users/me/avatar
// @desc Upload a user avatar
router.post(
  "/me/avatar",
  protect,
  upload.single("avatar"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ msg: "No file uploaded" });
      }

      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ msg: "User not found" });
      }

      // Compress the image and convert to base64
      const buffer = await sharp(req.file.buffer)
        .resize(256, 256, { fit: "cover" }) // Avatars are small
        .jpeg({ quality: 80 })
        .toBuffer();

      const avatarUrl = `data:image/jpeg;base64,${buffer.toString("base64")}`;

      user.avatar = avatarUrl;
      await user.save();

      // Issue a new token just in case we are embedding avatar in token in future
      res.json({
        msg: "Avatar uploaded successfully",
        avatar: avatarUrl,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
        },
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ msg: "Server Error" });
    }
  },
);

// @route PUT /api/users/me/profile
// @desc Update user profile (bio)
router.put("/me/profile", protect, async (req, res) => {
  try {
    const { bio, dob, penName, legalName } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    if (bio !== undefined) {
      user.bio = bio;
    }
    if (dob !== undefined) {
      user.dob = dob;
    }
    if (req.body.avatar === null || req.body.avatar === "") {
      user.avatar = "";
    }

    if (penName !== undefined && penName.trim() !== "" && penName !== user.penName) {
      // Validate uniqueness
      const existing = await User.findOne({ 
        penName: { $regex: new RegExp(`^${penName.trim()}$`, "i") },
        _id: { $ne: user._id }
      });
      if (existing) {
        return res.status(400).json({ msg: "Pen name already exists. Please choose another." });
      }
      user.penName = penName.trim();
      user.username = penName.trim();
    }

    if (legalName !== undefined) {
      user.legalName = legalName.trim();
    }

    await user.save();

    res.json({
      msg: "Profile updated successfully",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio,
        dob: user.dob,
        penName: user.penName,
        legalName: user.legalName,
        isOnboarded: user.isOnboarded,
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

// @route PUT /api/users/me/monetization
// @desc Update user monetization bank details securely
router.put("/me/monetization", protect, async (req, res) => {
  try {
    const { accountName, bankName, accountNumber, ifscCode } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    if (!user.monetization) {
      user.monetization = {};
    }

    if (accountName !== undefined) {
      user.monetization.accountName = cryptoUtils.encrypt(accountName);
    }
    if (bankName !== undefined) {
      user.monetization.bankName = cryptoUtils.encrypt(bankName);
    }
    if (accountNumber !== undefined) {
      user.monetization.accountNumber = cryptoUtils.encrypt(accountNumber);
    }
    if (ifscCode !== undefined) {
      user.monetization.ifscCode = cryptoUtils.encrypt(ifscCode);
    }

    await user.save();

    res.json({
      msg: "Monetization details securely updated",
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

// @route PUT /api/users/me/deactivate
// @desc Deactivate user's own account
router.put("/me/deactivate", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    user.status = "deactivated";
    await user.save();

    res.json({ msg: "Account deactivated successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

// @route DELETE /api/users/me
// @desc Delete user's own account permanently
router.delete("/me", protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: "User not found" });

    // Find and delete all books of the user
    const books = await Book.find({ author: userId });
    const bookIds = books.map((b) => b._id);

    // Delete chapters
    const Chapter = require("../models/Chapter");
    await Chapter.deleteMany({ book: { $in: bookIds } });

    // Delete reviews on author's books or written by user
    const Review = require("../models/Review");
    await Review.deleteMany({ book: { $in: bookIds } });
    await Review.deleteMany({ user: userId });

    // Delete reading progress
    await ReadingProgress.deleteMany({
      $or: [{ user: userId }, { book: { $in: bookIds } }],
    });

    // Delete books
    await Book.deleteMany({ author: userId });

    // Remove user from other users' following arrays
    await User.updateMany({}, { $pull: { following: userId } });

    // Delete the user itself
    await User.findByIdAndDelete(userId);

    res.json({ msg: "Account deleted successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

module.exports = router;
