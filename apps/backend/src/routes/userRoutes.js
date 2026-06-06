const express = require("express");
const { protect, adminOnly } = require("../middlewares/authMiddleware");
const validate = require("../middlewares/validationMiddleware");
const { updateUserSchema, userIdParamSchema } = require("../validations");

const router = express.Router();

// Get all users (admin only)
router.get("/", protect, adminOnly, async (req, res) => {
  try {
    const User = require("../models/User");
    const users = await User.find({}, "-password");
    res.status(200).json({ success: true, data: { users } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single user
router.get(
  "/:id",
  protect,
  validate(userIdParamSchema, "params"),
  async (req, res) => {
    try {
      const User = require("../models/User");
      const user = await User.findById(req.params.id).select("-password");
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }
      res.status(200).json({ success: true, data: { user } });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
);

// Update user (admin only)
router.put(
  "/:id",
  protect,
  adminOnly,
  validate(userIdParamSchema, "params"),
  validate(updateUserSchema),
  async (req, res) => {
    try {
      const User = require("../models/User");
      const user = await User.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      }).select("-password");
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }
      res.status(200).json({ success: true, data: { user } });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
);

// Delete user (admin only)
router.delete(
  "/:id",
  protect,
  adminOnly,
  validate(userIdParamSchema, "params"),
  async (req, res) => {
    try {
      const User = require("../models/User");
      const user = await User.findByIdAndDelete(req.params.id);
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }
      res
        .status(200)
        .json({ success: true, message: "User deleted successfully" });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
);

module.exports = router;
