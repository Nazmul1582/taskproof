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

  const comparePassword = await user.comparePassword(password);

  if (!user || !comparePassword) {
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

module.exports = {
  signup,
  login,
};
