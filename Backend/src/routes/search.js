const express = require("express");
const Book = require("../models/Book");
const User = require("../models/User");
const { translateBooks } = require("../services/translationService");

const router = express.Router();

// @route GET /api/search
// @desc Advanced search across stories, authors, series, and tags
router.get("/", async (req, res) => {
  try {
    const {
      q = "",
      type = "stories", // stories, authors, series, tags
      genre,
      language,
      status, // completed, ongoing
      sort = "popularity", // popularity, newest
      limit = 20,
    } = req.query;

    const targetLang = req.headers["x-app-language"] || "en";

    // Helper to build book query based on filters
    const buildBookQuery = () => {
      const query = { status: "published" };
      if (q) {
        // If type is series or tags, we search specifically in those fields, else in title/desc
        if (type === "series") {
          query.series = { $regex: q, $options: "i" };
        } else if (type === "tags") {
          query.tags = { $regex: q, $options: "i" };
        } else {
          // Default: search by title
          query.title = { $regex: q, $options: "i" };
        }
      }

      if (genre && genre !== "All") query.genre = genre;
      if (language && language !== "All") query.originalLanguage = language;
      if (status && status !== "All")
        query.completionStatus = status.toLowerCase();

      return query;
    };

    // Helper for sorting
    const getSortObj = () => {
      if (sort === "popularity") {
        return { views: -1, likesCount: -1 };
      }
      return { createdAt: -1 };
    };

    if (type === "authors") {
      const authorQuery = {
        role: "writer",
        status: "active",
      };
      if (q) {
        authorQuery.username = { $regex: q, $options: "i" };
      }

      const authorSort =
        sort === "popularity" ? { followersCount: -1 } : { createdAt: -1 };

      const authors = await User.find(authorQuery)
        .select("username avatar followersCount bio role isPremium")
        .sort(authorSort)
        .limit(Number(limit));

      return res.json({ type: "authors", results: authors });
    }

    // For stories, series, and tags, we ultimately query the Book model
    const activeUsers = await User.find({ status: "active" }).select("_id");
    const activeUserIds = activeUsers.map((u) => u._id);

    const query = buildBookQuery();
    query.author = { $in: activeUserIds };

    const sortObj = getSortObj();

    let books = await Book.find(query)
      .populate("author", "username avatar")
      .sort(sortObj)
      .limit(Number(limit));

    // Translate books to target language
    const translatedBooks = await translateBooks(books, targetLang);

    res.json({ type, results: translatedBooks });
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ msg: "Server Error" });
  }
});

module.exports = router;
