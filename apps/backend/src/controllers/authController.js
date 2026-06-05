const User = require("../models/User");
const jwt = require("jsonwebtoken");
const generateToken = require("../utils/generateToken");

const signup = async (req, res) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    return res
      .status(400)
      .json({ success: false, message: "Email already registered" });
  }

  const user = await User.create({
    name,
    email,
    password,
    role: "team_member", // Default role
  });

  const token = generateToken(user._id, user.role);

  res.status(201).json({
    success: true,
    data: {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    },
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid email or password" });
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid email or password" });
  }

  const token = generateToken(user._id, user.role);

  res.json({
    success: true,
    data: {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    },
  });
};

const demoLogin = async (req, res) => {
  const { role = "team_member" } = req.body;

  let demoUser;

  switch (role) {
    case "admin":
      demoUser = await User.findOne({ email: "demo-admin@example.com" });
      if (!demoUser) {
        demoUser = await User.create({
          name: "Demo Admin",
          email: "demo-admin@example.com",
          password: "demo123",
          role: "admin",
        });
      }
      break;
    case "project_manager":
      demoUser = await User.findOne({ email: "demo-pm@example.com" });
      if (!demoUser) {
        demoUser = await User.create({
          name: "Demo PM",
          email: "demo-pm@example.com",
          password: "demo123",
          role: "project_manager",
        });
      }
      break;
    default:
      demoUser = await User.findOne({ email: "demo-user@example.com" });
      if (!demoUser) {
        demoUser = await User.create({
          name: "Demo User",
          email: "demo-user@example.com",
          password: "demo123",
          role: "team_member",
        });
      }
  }

  const token = generateToken(demoUser._id, demoUser.role);

  res.json({
    success: true,
    data: {
      user: {
        _id: demoUser._id,
        name: demoUser.name,
        email: demoUser.email,
        role: demoUser.role,
      },
      token,
      message: `Logged in as ${demoUser.role}`,
    },
  });
};

const getMe = async (req, res) => {
  res.status(200).json({ success: true, data: { user: req.user } });
};

module.exports = {
  signup,
  login,
  demoLogin,
  getMe,
};
