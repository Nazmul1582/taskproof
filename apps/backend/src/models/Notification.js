const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: [
        "task_assigned",
        "task_completed",
        "member_added",
        "deadline_reminder",
      ],
      required: true,
    },
    read: { type: Boolean, default: false },
    relatedId: { type: mongoose.Schema.Types.ObjectId, default: null },
  },
  { timestamps: true },
);

notificationSchema.index({ userId: 1, read: 1 });
notificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);
