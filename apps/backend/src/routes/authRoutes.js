const express = require("express");
const {
  signup,
  login,
  demoLogin,
  getMe,
} = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");
const { validate } = require("../middlewares/validationMiddleware");
const {
  signupSchema,
  loginSchema,
  demoLoginSchema,
} = require("../validations");

const router = express.Router();

router.post("/signup", validate(signupSchema), signup);
router.post("/login", validate(loginSchema), login);
router.post("/demo", validate(demoLoginSchema), demoLogin);
router.get("/me", protect, getMe);

module.exports = router;
