const User = require("../models/User");
const jwt = require("jsonwebtoken");
const generateToken = require("../utils/generateToken");
const ActivityLog = require("../models/ActivityLog");

const signup = async (req, res) => {
  try {
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

    const token = generateToken(user._id);

    await ActivityLog.create({
      action: `User ${user.name} signed up`,
      user: user._id,
      userName: user.name,
      targetType: "member",
      targetId: user._id,
    });

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
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    const token = generateToken(user._id);

    await ActivityLog.create({
      action: `User ${user.name} logged in`,
      user: user._id,
      userName: user.name,
      targetType: "member",
      targetId: user._id,
    });

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
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const demoLogin = async (req, res) => {
  try {
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

    const token = generateToken(demoUser._id);

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
        message: `Logged in as ${demoUser.role.replace("_", " ")}`,
      },
    });
  } catch (error) {
    console.error("Demo login error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({ success: true, data: { user } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const logout = async (req, res) => {
  res.status(200).json({ success: true, message: "Logged out successfully" });
};

module.exports = { signup, login, demoLogin, getMe, logout };
