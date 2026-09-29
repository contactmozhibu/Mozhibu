const express = require("express");
const multer = require("multer");
const path = require("path");
const sharp = require("sharp");
const Book = require("../models/Book");
const Chapter = require("../models/Chapter");
const Review = require("../models/Review");
const Report = require("../models/Report");
const UserSubscription = require("../models/UserSubscription");
const User = require("../models/User");
const Notification = require("../models/Notification");
const { protect, protectOptional, author } = require("../middleware/auth");
const xss = require("xss");
const rateLimit = require("express-rate-limit");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const {
  translateBooks,
  translateChapters,
} = require("../services/translationService");

const NodeCache = require("node-cache");
const bookCache = new NodeCache({ stdTTL: 60 }); // Cache books for 60 seconds (auto-invalidates)

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only images are allowed"));
    }
  },
});

// @route POST /api/books/cover
// @desc Upload a cover image and get its URL (Base64)
router.post(
  "/cover",
  protect,
  author,
  upload.single("cover"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ msg: "No file uploaded" });
      }

      // Compress the image and convert to base64
      const buffer = await sharp(req.file.buffer)
        .resize(600, 900, { fit: "cover" }) // Typical book cover ratio (2:3)
        .jpeg({ quality: 80 })
        .toBuffer();

      const coverUrl = `data:image/jpeg;base64,${buffer.toString("base64")}`;
      res.json({ coverUrl });
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: "Server Error processing image" });
    }
  },
);
const getGenAI = () => {
  const keys = process.env.GEMINI_API_KEYS
    ? process.env.GEMINI_API_KEYS.split(",")
    : [];
  const randomKey = keys[Math.floor(Math.random() * keys.length)];
  return new GoogleGenerativeAI(randomKey);
};

// @route GET /api/books/categories
// @desc Get all unique book genres with counts
router.get("/categories", async (req, res) => {
  try {
    const categories = await Book.aggregate([
      { $match: { status: "published" } },
      { $group: { _id: "$genre", count: { $sum: 1 } } },
      { $project: { _id: 0, name: "$_id", count: 1 } },
      { $sort: { count: -1 } },
    ]);
    res.json(categories);
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
});

// @route GET /api/books/me
// @desc Get all books written by the logged-in author
router.get("/me", protect, author, async (req, res) => {
  try {
    const books = await Book.find({ author: req.user.id })
      .sort({ createdAt: -1 })
      .lean();

    // Attach chapter count to each book
    const booksWithStats = await Promise.all(
      books.map(async (book) => {
        const chapterCount = await Chapter.countDocuments({ book: book._id });
        return { ...book, chapters: chapterCount };
      }),
    );

    res.json(booksWithStats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server Error" });
  }
});

// @route PUT /api/books/:id/status
// @desc Toggle the completion status of a book
router.put("/:id/status", protect, author, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ msg: "Book not found" });

    if (
      book.author.toString() !== req.user.id &&
      req.user.role !== "superadmin"
    ) {
      return res.status(403).json({ msg: "Not authorized" });
    }

    const { completionStatus } = req.body;
    if (completionStatus) {
      book.completionStatus = completionStatus;
      await book.save();
    }

    res.json(book);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server Error" });
  }
});

// @route GET /api/books
// @desc Get all published books (paginated)
router.get("/", async (req, res) => {
  try {
    const targetLang = req.headers["x-app-language"] || "en";
    
    // Create a unique cache key based on query parameters and language
    const cacheKey = `books_${req.query.q || ""}_${req.query.isAudio || ""}_${req.query.genre || ""}_${req.query.sort || ""}_${req.query.page || 1}_${req.query.limit || 20}_${targetLang}`;
    
    // Return cached response if available
    const cachedData = bookCache.get(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }

    // Get all active users - use lean for speed
    const activeUsers = await User.find({ status: "active" }).select("_id").lean();
    const activeUserIds = activeUsers.map((u) => u._id);

    let query = { status: "published", author: { $in: activeUserIds } };

    // Search query
    if (req.query.q) {
      query.title = { $regex: req.query.q, $options: "i" };
    }

    // Audio filter
    if (req.query.isAudio === "true") {
      query.isAudio = true;
    }

    // Genre filter
    if (req.query.genre) {
      query.genre = req.query.genre;
    }

    // Sorting
    let sortObj = { createdAt: -1 }; // default to latest

    if (req.query.sort === "trending") {
      sortObj = { views: -1, rating: -1 };
    } else if (req.query.sort === "popular") {
      sortObj = { views: -1 };
    }

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;

    const totalBooks = await Book.countDocuments(query);

    const books = await Book.find(query)
      .populate("author", "username avatar isPremium")
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .lean();

    const translatedBooks = await translateBooks(books, targetLang);

    const responseData = {
      books: translatedBooks,
      currentPage: page,
      totalPages: Math.ceil(totalBooks / limit),
      totalBooks,
    };

    // Cache the response
    bookCache.set(cacheKey, responseData);

    res.json(responseData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server Error" });
  }
});

// @route GET /api/books/:id
// @desc Get a single published book (or unpublished if requested by author)
router.get("/:id", protect, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)
      .populate("author", "username avatar status isPremium")
      .lean();

    if (!book) return res.status(404).json({ msg: "Book not found" });

    const isAuthor =
      req.user && book.author && book.author._id.toString() === req.user.id;
    if (
      !isAuthor &&
      (book.status !== "published" ||
        !book.author ||
        book.author.status !== "active")
    ) {
      return res.status(404).json({ msg: "Book not found or not published" });
    }

    const targetLang = req.headers["x-app-language"] || "en";
    const translatedBooks = await translateBooks([book], targetLang);

    res.json(translatedBooks[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server Error" });
  }
});

// @route PUT /api/books/:id
// @desc Update an existing book
router.put("/:id", protect, author, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ msg: "Book not found" });

    // Check if user is author or superadmin
    if (
      book.author.toString() !== req.user.id &&
      req.user.role !== "superadmin"
    ) {
      return res
        .status(403)
        .json({ msg: "Not authorized to update this book" });
    }

    // Only allow updating certain fields to prevent abuse
    const updatableFields = [
      "title",
      "genre",
      "description",
      "tags",
      "series",
      "cover",
      "status",
      "accessType",
      "isMature",
    ];
    const updateData = {};
    for (const field of updatableFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    // Deadline Enforcement for Competition Books
    if (updateData.status === "published" && book.competitionTag) {
      const Competition = require("../models/Competition");
      const comp = await Competition.findOne({ tag: book.competitionTag });
      if (comp) {
        if (!comp.isActive) {
          return res.status(400).json({ msg: "Competition already ended" });
        }
        if (comp.endDate && new Date() > new Date(comp.endDate)) {
          return res
            .status(400)
            .json({ msg: "Competition deadline has passed" });
        }
      }
    }

    // 18+ books must go through admin approval — never allow direct publish
    if (updateData.status === 'published') {
      const currentBook = await Book.findById(req.params.id).select('isMature');
      const willBeMature = updateData.isMature !== undefined ? updateData.isMature : currentBook?.isMature;
      if (willBeMature) {
        updateData.status = 'pending';
      }

      // Check if book has at least one published chapter
      const Chapter = require("../models/Chapter");
      const chapterCount = await Chapter.countDocuments({ book: req.params.id, status: "published" });
      if (chapterCount === 0) {
        return res.status(400).json({ msg: "You cannot publish a book without any published chapters." });
      }
    }

    const updatedBook = await Book.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { returnDocument: "after" },
    );

    res.json(updatedBook);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server Error" });
  }
});

// @route GET /api/books/:id/chapters
// @desc Get all chapters for a book
router.get("/:id/chapters", protectOptional, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ msg: "Book not found" });
    }

    let isSubscriber = false;
    if (req.user) {
      const activeSub = await UserSubscription.findOne({
        user: req.user.id,
        status: "active",
        endDate: { $gt: new Date() },
      });
      if (activeSub) {
        isSubscriber = true;
      }
    }

    const isAuthor =
      req.user && book.author && book.author.toString() === req.user.id;
    const isAdmin =
      req.user && ["admin", "superadmin"].includes(req.user.role);
    const isPrivileged = isAuthor || isAdmin;

    const query = { book: req.params.id };
    if (!isPrivileged) {
      query.status = "published";
    }

    const chapters = await Chapter.find(query).sort({ order: 1 }).lean();

    // Apply access control before returning
    const chaptersWithAccess = chapters.map((chapter) => {
      const isPremium =
        chapter.accessType === "premium" ||
        (chapter.accessType === "inherit" && book.accessType === "premium");

      const chapObj = chapter;

      // Privileged users (author or admin) can always read all chapters
      if (isPrivileged) {
        chapObj.isLocked = false;
        return chapObj;
      }

      if (isPremium && !isSubscriber) {
        chapObj.content = null;
        chapObj.isLocked = true;
      } else {
        chapObj.isLocked = false;
      }
      return chapObj;
    });

    const targetLang = req.headers["x-app-language"] || "en";
    const translatedChapters = await translateChapters(
      chaptersWithAccess,
      targetLang,
    );

    res.json(translatedChapters);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server Error" });
  }
});

// @route GET /api/books/:id/reviews
// @desc Get all approved reviews for a book
router.get("/:id/reviews", async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const query = {
      book: req.params.id,
      status: "approved",
      parentReview: { $exists: false },
    };
    if (req.query.chapterId) {
      query.chapter = req.query.chapterId;
    }

    const reviews = await Review.find(query)
      .populate("user", "username avatar isPremium")
      .populate({
        path: "replies",
        populate: { path: "user", select: "username avatar isPremium" },
      })
      .sort({ isPinned: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalReviews = await Review.countDocuments(query);
    const totalPages = Math.ceil(totalReviews / limit);

    res.json({
      reviews,
      currentPage: page,
      totalPages,
      totalReviews,
    });
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
});

// @route POST /api/books/:id/reviews
// @desc Post a review for a book
router.post("/:id/reviews", protect, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ msg: "Book not found" });

    // Prevent author from reviewing their own book
    if (book.author.toString() === req.user.id) {
      return res.status(403).json({ msg: "You cannot write a review for your own book" });
    }

    if (!req.body.chapterId) {
      return res.status(400).json({ msg: "chapterId is required to post a review" });
    }

    // If this is a review (has a rating), ensure the user hasn't already reviewed the chapter
    if (req.body.rating && req.body.rating > 0) {
      const existingReview = await Review.findOne({
        book: req.params.id,
        chapter: req.body.chapterId,
        user: req.user.id,
        rating: { $gt: 0 },
        parentReview: { $exists: false }
      });
      if (existingReview) {
        return res.status(400).json({ msg: "You have already reviewed this chapter. You can only leave one review per chapter, but you may leave multiple comments." });
      }
    }
    const newReview = new Review({
      book: req.params.id,
      chapter: req.body.chapterId,
      user: req.user.id,
      rating: req.body.rating,
      comment: req.body.content,
      status: "approved", // Automatically approve for now, can be changed to pending
    });

    const review = await newReview.save();

    // Update chapter rating
    const Chapter = require("../models/Chapter");
    const chapterReviews = await Review.find({
      chapter: req.body.chapterId,
      status: "approved",
      parentReview: { $exists: false },
      rating: { $gt: 0 }
    });
    
    let chapterAvgRating = 0;
    if (chapterReviews.length > 0) {
      chapterAvgRating = chapterReviews.reduce((acc, item) => item.rating + acc, 0) / chapterReviews.length;
    }
    await Chapter.updateOne({ _id: req.body.chapterId }, { $set: { rating: chapterAvgRating, reviewCount: chapterReviews.length } });

    // Update book rating based on all chapters
    const chapters = await Chapter.find({ book: req.params.id, reviewCount: { $gt: 0 } });
    let bookAvgRating = 0;
    if (chapters.length > 0) {
      bookAvgRating = chapters.reduce((acc, ch) => ch.rating + acc, 0) / chapters.length;
    }
    await Book.updateOne({ _id: book._id }, { $set: { rating: bookAvgRating } });

    if (book.author.toString() !== req.user.id) {
      await Notification.create({
        recipient: book.author,
        sender: req.user.id,
        type: "comment",
        title: "New Comment",
        message: `${req.user.username || "Someone"} commented on your book "${book.title}".`,
        link: `/story/${book._id}`,
      });
    }

    res.json(review);
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
});

// @route POST /api/books/:id/reviews/:reviewId/like
// @desc Like a comment
router.post("/:id/reviews/:reviewId/like", protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) return res.status(404).json({ msg: "Review not found" });

    const userId = req.user.id;
    // Remove from dislikes if present
    review.dislikes = review.dislikes.filter((id) => id.toString() !== userId);

    // Toggle like
    const index = review.likes.findIndex((id) => id.toString() === userId);
    if (index > -1) {
      review.likes.splice(index, 1); // unlike
    } else {
      review.likes.push(userId); // like
      if (review.user.toString() !== userId) {
        await Notification.create({
          recipient: review.user,
          sender: userId,
          type: "like",
          title: "New Like",
          message: `${req.user.username || "Someone"} liked your comment.`,
          link: `/story/${req.params.id}`,
        });
      }
    }
    await review.save();
    res.json(review);
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
});

// @route POST /api/books/:id/reviews/:reviewId/pin
// @desc Pin or unpin a comment (only author can do this)
router.post("/:id/reviews/:reviewId/pin", protect, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ msg: "Book not found" });
    if (book.author.toString() !== req.user.id) {
      return res.status(403).json({ msg: "Only the author can pin comments" });
    }

    const review = await Review.findById(req.params.reviewId);
    if (!review) return res.status(404).json({ msg: "Review not found" });

    review.isPinned = !review.isPinned;
    await review.save();

    res.json(review);
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
});

// @route PUT /api/books/:id/reviews/:reviewId
// @desc Edit a comment (one-time only)
router.put("/:id/reviews/:reviewId", protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) return res.status(404).json({ msg: "Review not found" });

    // Verify ownership
    if (review.user.toString() !== req.user.id) {
      return res.status(403).json({ msg: "Not authorized to edit this comment" });
    }

    // Allow multiple edits (removed 1-time edit limit)

    const { content, rating } = req.body;
    if (content !== undefined) review.comment = content;
    
    // Only update rating if it's a top-level review (not a reply) and rating is provided
    if (rating !== undefined && !review.parentReview) {
      review.rating = rating;
    }

    review.isEdited = true;
    await review.save();

    // If it's a top level review, we need to recalculate ratings
    if (!review.parentReview && review.chapter) {
      const Chapter = require("../models/Chapter");
      
      const chapterReviews = await Review.find({
        chapter: review.chapter,
        status: "approved",
        parentReview: { $exists: false },
        rating: { $gt: 0 }
      });
      
      let chapterAvgRating = 0;
      if (chapterReviews.length > 0) {
        chapterAvgRating = chapterReviews.reduce((acc, item) => item.rating + acc, 0) / chapterReviews.length;
      }
      await Chapter.updateOne({ _id: review.chapter }, { $set: { rating: chapterAvgRating, reviewCount: chapterReviews.length } });

      const chapters = await Chapter.find({ book: req.params.id, reviewCount: { $gt: 0 } });
      let bookAvgRating = 0;
      if (chapters.length > 0) {
        bookAvgRating = chapters.reduce((acc, ch) => ch.rating + acc, 0) / chapters.length;
      }
      await Book.updateOne({ _id: req.params.id }, { $set: { rating: bookAvgRating } });
    }

    // Populate user to return exactly what frontend expects
    await review.populate("user", "username avatar isPremium");

    res.json(review);
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
});

// @route POST /api/books/:id/reviews/:reviewId/dislike
// @desc Dislike a comment
router.post("/:id/reviews/:reviewId/dislike", protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) return res.status(404).json({ msg: "Review not found" });

    const userId = req.user.id;
    // Remove from likes if present
    review.likes = review.likes.filter((id) => id.toString() !== userId);

    // Toggle dislike
    const index = review.dislikes.findIndex((id) => id.toString() === userId);
    if (index > -1) {
      review.dislikes.splice(index, 1); // undislike
    } else {
      review.dislikes.push(userId); // dislike
    }
    await review.save();
    res.json(review);
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
});

// @route POST /api/books/:id/reviews/:reviewId/reply
// @desc Reply to a comment
router.post("/:id/reviews/:reviewId/reply", protect, async (req, res) => {
  try {
    const parentReview = await Review.findById(req.params.reviewId);
    if (!parentReview)
      return res.status(404).json({ msg: "Parent review not found" });

    const newReply = new Review({
      book: req.params.id,
      user: req.user.id,
      comment: req.body.content,
      parentReview: parentReview._id,
      status: "approved",
    });

    const reply = await newReply.save();

    // Add to parent replies
    parentReview.replies.push(reply._id);
    await parentReview.save();

    if (parentReview.user.toString() !== req.user.id) {
      await Notification.create({
        recipient: parentReview.user,
        sender: req.user.id,
        type: "comment",
        title: "New Reply",
        message: `${req.user.username || "Someone"} replied to your comment.`,
        link: `/story/${req.params.id}`,
      });
    }

    // Populate user before sending back
    await reply.populate("user", "username avatar isPremium");
    res.json(reply);
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
});

// @route POST /api/books/:id/like
// @desc Toggle like for a book
router.post("/:id/like", protect, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ msg: "Book not found" });

    if (!book.likes) {
      book.likes = [];
    }

    const isLiked = book.likes.some((id) => id.toString() === req.user.id);

    if (isLiked) {
      // Unlike
      book.likes = book.likes.filter((id) => id.toString() !== req.user.id);
    } else {
      // Like
      book.likes.push(req.user.id);
      if (book.author.toString() !== req.user.id) {
        await Notification.create({
          recipient: book.author,
          sender: req.user.id,
          type: "like",
          title: "New Like",
          message: `${req.user.username || "Someone"} liked your book "${book.title}".`,
          link: `/story/${book._id}`,
        });
      }
    }

    book.likesCount = book.likes.length;
    await book.save();

    res.json({
      msg: isLiked ? "Unliked" : "Liked",
      isLiked: !isLiked,
      likesCount: book.likesCount,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

// @route POST /api/books/:id/report
// @desc Report a book
router.post("/:id/report", protect, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ msg: "Book not found" });
    // Check if user has already reported this book
    const existingReport = await Report.findOne({ book: req.params.id, reporter: req.user.id });
    if (existingReport) {
      return res.status(400).json({ msg: "You have already reported this book" });
    }

    // Validate comment word count (max 100 words)
    if (req.body.comment) {
      const wordCount = req.body.comment.trim().split(/\s+/).filter(w => w).length;
      if (wordCount > 100) {
        return res.status(400).json({ msg: "Report comment cannot exceed 100 words" });
      }
    }

    const newReport = new Report({
      book: req.params.id,
      reporter: req.user.id,
      reason: req.body.reason || "Other",
      comment: req.body.comment,
    });

    await newReport.save();

    book.reportCount = (book.reportCount || 0) + 1;
    book.reports.push({
      user: req.user.id,
      reason: req.body.reason || "Other",
      comment: req.body.comment
    });
    if (book.reportCount >= 50) {
      book.status = "suspended";
    }
    await book.save();

    res.json({ msg: "Report submitted successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

// @route POST /api/books
// @desc Create a new book
router.post("/", protect, author, async (req, res) => {
  try {
    if (req.body.status === "published") {
      return res.status(400).json({ msg: "You cannot publish a book without any published chapters." });
    }

    const newBook = new Book({
      ...req.body,
      author: req.user.id,
      status: req.body.status || "draft",
    });

    // Deadline Enforcement for Competition Books
    if (newBook.status === "published" && newBook.competitionTag) {
      const Competition = require("../models/Competition");
      const comp = await Competition.findOne({ tag: newBook.competitionTag });
      if (comp) {
        if (!comp.isActive) {
          return res.status(400).json({ msg: "Competition already ended" });
        }
        if (comp.endDate && new Date() > new Date(comp.endDate)) {
          return res
            .status(400)
            .json({ msg: "Competition deadline has passed" });
        }
      }
    }
    const book = await newBook.save();
    res.json(book);
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
});

// @route POST /api/books/:id/chapters
// @desc Create a new chapter for a book
router.post("/:id/chapters", protect, author, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ msg: "Book not found" });
    if (
      book.author.toString() !== req.user.id &&
      req.user.role !== "superadmin"
    ) {
      return res.status(403).json({ msg: "Not authorized" });
    }

    // Automatically calculate order
    const lastChapter = await Chapter.findOne({ book: req.params.id }).sort(
      "-order",
    );
    const nextOrder = lastChapter ? lastChapter.order + 1 : 1;
    
    // Enforce first 5 chapters to be free
    if (nextOrder <= 5 && req.body.accessType === "premium") {
      return res.status(400).json({ msg: "The first 5 chapters must be free." });
    }

    // Sanitize HTML content
    const sanitizedContent = req.body.content ? xss(req.body.content) : "";



    const newChapter = new Chapter({
      ...req.body,
      content: sanitizedContent,
      order: nextOrder,
      book: req.params.id,
    });
    const chapter = await newChapter.save();
    res.json(chapter);
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
});

// @route POST /api/books/:id/view
// @desc Increment view count for a book
router.post("/:id/view", protectOptional, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ msg: "Book not found" });

    const isAuthor = req.user && book.author && book.author.toString() === req.user.id;
    
    if (!isAuthor) {
      book.views = (book.views || 0) + 1;
      await book.save();
    }
    
    res.json({ views: book.views });
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
});

// @route GET /api/books/:id/chapters/:chapterId
// @desc Get a single chapter
router.get("/:id/chapters/:chapterId", protectOptional, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ msg: "Book not found" });

    const chapter = await Chapter.findOne({
      _id: req.params.chapterId,
      book: req.params.id,
    });
    if (!chapter) return res.status(404).json({ msg: "Chapter not found" });

    const isAuthor = req.user && book.author.toString() === req.user.id;

    // Determine if premium
    const isPremium =
      chapter.accessType === "premium" ||
      (chapter.accessType === "inherit" && book.accessType === "premium");

    if (isPremium && !isAuthor) {
      let isSubscriber = false;
      if (req.user) {
        const activeSub = await UserSubscription.findOne({
          user: req.user.id,
          status: "active",
          endDate: { $gt: new Date() },
        });
        if (activeSub) isSubscriber = true;
      }
      if (!isSubscriber) {
        return res
          .status(403)
          .json({ msg: "Premium chapter. Subscription required." });
      }
    }

    res.json(chapter);
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
});

// @route PUT /api/books/:id/chapters/:chapterId
// @desc Update a chapter
router.put("/:id/chapters/:chapterId", protect, author, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ msg: "Book not found" });
    if (
      book.author.toString() !== req.user.id &&
      req.user.role !== "superadmin"
    ) {
      return res.status(403).json({ msg: "Not authorized" });
    }

    const existingChapter = await Chapter.findOne({ _id: req.params.chapterId, book: req.params.id });
    if (!existingChapter) return res.status(404).json({ msg: "Chapter not found" });

    // Enforce first 5 chapters to be free
    if (existingChapter.order <= 5 && req.body.accessType === "premium") {
      return res.status(400).json({ msg: "The first 5 chapters must be free." });
    }

    if (req.body.content) {
      req.body.content = xss(req.body.content);
    }

    const contentToCheck = req.body.content !== undefined ? req.body.content : existingChapter.content;
    const statusToCheck = req.body.status !== undefined ? req.body.status : existingChapter.status;
    


    const chapter = await Chapter.findOneAndUpdate(
      { _id: req.params.chapterId, book: req.params.id },
      { $set: req.body },
      { returnDocument: "after" },
    );
    if (!chapter) return res.status(404).json({ msg: "Chapter not found" });

    res.json(chapter);
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
});

// @route DELETE /api/books/:id/chapters/:chapterId
// @desc Delete a chapter
router.delete("/:id/chapters/:chapterId", protect, author, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ msg: "Book not found" });
    if (
      book.author.toString() !== req.user.id &&
      req.user.role !== "superadmin"
    ) {
      return res.status(403).json({ msg: "Not authorized" });
    }

    const chapter = await Chapter.findOneAndDelete({
      _id: req.params.chapterId,
      book: req.params.id,
    });
    if (!chapter) return res.status(404).json({ msg: "Chapter not found" });

    res.json({ msg: "Chapter deleted" });
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
});

// Translation Rate Limiter: max 5 requests per minute
const translationLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5,
  message: { msg: "Too many translation requests from this IP, please try again later." },
});

// @route POST /api/books/translate-html
// @desc Translate raw HTML to target language (for UI demo)
router.post("/translate-html", protect, translationLimiter, async (req, res) => {
  const { html, targetLang } = req.body;
  if (!html || !targetLang)
    return res.status(400).json({ msg: "html and targetLang required" });

  const langMap = {
    en: "English",
    ta: "Tamil",
    te: "Telugu",
    ml: "Malayalam",
    kn: "Kannada",
    bn: "Bengali",
    hi: "Hindi",
    pa: "Punjabi",
    mr: "Marathi",
    ur: "Urdu",
    gu: "Gujarati",
    or: "Odia",
  };
  const targetLangName = langMap[targetLang] || targetLang;

  try {
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });

    const prompt = `Translate the following HTML story content into ${targetLangName}. 
Only return the translated HTML. Preserve all HTML tags and structure exactly as they are. 
Do not add markdown blocks like \`\`\`html. 
Content to translate:

${html}`;

    const result = await model.generateContent(prompt);
    let translatedContent = result.response.text();
    if (translatedContent.startsWith("\`\`\`html")) {
      translatedContent = translatedContent
        .replace(/\`\`\`html\n?/, "")
        .replace(/\`\`\`\n?$/, "");
    } else if (translatedContent.startsWith("\`\`\`")) {
      translatedContent = translatedContent
        .replace(/\`\`\`\n?/, "")
        .replace(/\`\`\`\n?$/, "");
    }
    translatedContent = translatedContent.trim();
    res.json({ content: translatedContent });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ msg: "Server Error", error: err.message || err.toString() });
  }
});

// @route POST /api/books/:id/chapters/:chapterId/translate
// @desc Translate a chapter to a target language using Gemini
router.post("/:id/chapters/:chapterId/translate", protect, translationLimiter, async (req, res) => {
  try {
    const { targetLang } = req.body;
    if (!targetLang)
      return res.status(400).json({ msg: "targetLang is required" });

    const chapter = await Chapter.findById(req.params.chapterId);
    if (!chapter) return res.status(404).json({ msg: "Chapter not found" });

    // Check if we already have the translation
    if (chapter.translations && chapter.translations.has(targetLang)) {
      return res.json({ content: chapter.translations.get(targetLang) });
    }

    // Initialize Gemini
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });

    // Create language map to give Gemini more context
    const langMap = {
      en: "English",
      ta: "Tamil",
      te: "Telugu",
      ml: "Malayalam",
      kn: "Kannada",
      bn: "Bengali",
      hi: "Hindi",
      pa: "Punjabi",
      mr: "Marathi",
      ur: "Urdu",
      gu: "Gujarati",
      or: "Odia",
    };
    const targetLangName = langMap[targetLang] || targetLang;

    const prompt = `Translate the following HTML story content into ${targetLangName}. 
Only return the translated HTML. Preserve all HTML tags and structure exactly as they are. 
Do not add markdown blocks like \`\`\`html. 
Content to translate:

${chapter.content}`;

    const result = await model.generateContent(prompt);
    let translatedContent = result.response.text();

    // Clean up potential markdown formatting from Gemini
    if (translatedContent.startsWith("\`\`\`html")) {
      translatedContent = translatedContent
        .replace(/\`\`\`html\n?/, "")
        .replace(/\`\`\`\n?$/, "");
    } else if (translatedContent.startsWith("\`\`\`")) {
      translatedContent = translatedContent
        .replace(/\`\`\`\n?/, "")
        .replace(/\`\`\`\n?$/, "");
    }
    translatedContent = translatedContent.trim();

    // Save translation
    if (!chapter.translations) chapter.translations = new Map();
    chapter.translations.set(targetLang, translatedContent);
    await chapter.save();

    res.json({ content: translatedContent });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

// @route POST /api/books/:id/view
// @desc Increment book views only if the user hasn't read this chapter before
router.post("/:id/view", protectOptional, async (req, res) => {
  try {
    const { chapterId } = req.body;
    if (!chapterId) {
      return res.status(400).json({ msg: "Chapter ID is required" });
    }

    const chapter = await Chapter.findById(chapterId);
    if (!chapter) return res.status(404).json({ msg: "Chapter not found" });

    // Use req.user.id if logged in, otherwise req.ip
    const identifier = req.user ? req.user.id.toString() : req.ip;

    if (!chapter.viewers) {
      chapter.viewers = [];
    }

    if (!chapter.viewers.includes(identifier)) {
      chapter.viewers.push(identifier);
      await chapter.save();

      // Increment the book views
      await Book.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

module.exports = router;
