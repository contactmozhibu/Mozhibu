const express = require("express");
const { protect } = require("../middleware/auth");
const Notification = require("../models/Notification");

const router = express.Router();

// @route GET /api/notifications
// @desc Get all notifications for current user
router.get("/", protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .populate("sender", "username avatar")
      .sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

// @route PUT /api/notifications/:id/read
// @desc Mark a single notification as read
router.put("/:id/read", protect, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ msg: "Notification not found" });
    }

    if (notification.recipient.toString() !== req.user.id) {
      return res.status(401).json({ msg: "User not authorized" });
    }

    notification.isRead = true;
    await notification.save();

    res.json(notification);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

// @route PUT /api/notifications/read-all
// @desc Mark all notifications as read for current user
router.put("/read-all", protect, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, isRead: false },
      { $set: { isRead: true } },
    );
    res.json({ msg: "All notifications marked as read" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

// @route DELETE /api/notifications/clear-all
// @desc Delete all notifications for current user
router.delete("/clear-all", protect, async (req, res) => {
  try {
    await Notification.deleteMany({ recipient: req.user.id });
    res.json({ msg: "All notifications cleared" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

// @route POST /api/notifications/test
// @desc Seed test notifications for current user
router.post("/test", protect, async (req, res) => {
  try {
    const types = [
      "like",
      "comment",
      "follower",
      "new_chapter",
      "competition",
      "announcement",
      "system",
    ];
    const notifs = types.map((type, i) => ({
      recipient: req.user.id,
      type: type,
      title: `Test ${type} notification`,
      message: `This is a sample message for a ${type} notification.`,
      link: `/story/123`,
      isRead: i % 2 !== 0, // Some read, some unread
    }));
    await Notification.insertMany(notifs);
    res.json({ msg: "Test notifications created" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

// @route GET /api/notifications/broadcasts
// @desc Get recent broadcast announcements (public, latest 10)
const Broadcast = require("../models/Broadcast");
const { protectOptional } = require("../middleware/auth");

router.get("/broadcasts", protectOptional, async (req, res) => {
  try {
    let audienceFilter = ["all"];
    let dismissedIds = [];

    if (req.user) {
      if (req.user.role === "reader") {
        audienceFilter.push("readers");
      } else if (req.user.role === "writer" || req.user.role === "superadmin") {
        audienceFilter.push("writers");
      }
      
      const User = require("../models/User");
      const dbUser = await User.findById(req.user.id).select("dismissedAnnouncements");
      if (dbUser && dbUser.dismissedAnnouncements) {
        dismissedIds = dbUser.dismissedAnnouncements;
      }
    }

    const broadcasts = await Broadcast.find({
      audience: { $in: audienceFilter },
      _id: { $nin: dismissedIds }
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const lang = req.query.lang;
    const translatedBroadcasts = broadcasts.map(b => {
      if (lang && lang !== "en" && b.translations && b.translations[lang]) {
        b.title = b.translations[lang].title || b.title;
        b.message = b.translations[lang].message || b.message;
      }
      delete b.translations; // no need to send all translations to client
      return b;
    });

    res.json(translatedBroadcasts);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

// @route POST /api/notifications/broadcasts/:id/dismiss
// @desc Dismiss an announcement so it no longer shows for the user
router.post("/broadcasts/:id/dismiss", protect, async (req, res) => {
  try {
    const User = require("../models/User");
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    
    if (!user.dismissedAnnouncements) {
      user.dismissedAnnouncements = [];
    }
    
    if (!user.dismissedAnnouncements.includes(req.params.id)) {
      user.dismissedAnnouncements.push(req.params.id);
      await user.save();
    }
    
    res.json({ msg: "Announcement dismissed" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

module.exports = router;
