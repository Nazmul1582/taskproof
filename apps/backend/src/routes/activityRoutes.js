const express = require("express");
const { getActivities } = require("../controllers/activityController");
const { protect } = require("../middlewares/authMiddleware");
const validate = require("../middlewares/validationMiddleware");
const { z } = require("zod");

const activityQuerySchema = z.object({
  limit: z.string().transform(Number).optional(),
  page: z.string().transform(Number).optional(),
});

const router = express.Router();

router.get("/", protect, validate(activityQuerySchema, "query"), getActivities);

module.exports = router;
