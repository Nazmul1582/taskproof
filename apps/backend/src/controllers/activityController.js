const ActivityLog = require("../models/ActivityLog");

const getActivities = async (req, res) => {
  try {
    const { limit = 10, page = 1 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const activities = await ActivityLog.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await ActivityLog.countDocuments();

    res.status(200).json({
      success: true,
      data: {
        activities,
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Get activities error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getActivities };
