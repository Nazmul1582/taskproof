const Project = require("../models/Project");

const getProjects = async (req, res) => {
  const { status, search, page = 1, limit = 10 } = req.query;
  let query = {};

  // Role-based filtering
  if (req.user.role === "team_member") {
    query.teamMembers = req.user._id;
  }

  if (status) query.status = status;
  if (search) query.name = { $regex: search, $options: "i" };

  const skip = (page - 1) * limit;

  const projects = await Project.find(query)
    .populate("createdBy", "name email")
    .populate("teamMembers", "name email avatar")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Project.countDocuments(query);

  res.status(200).json({
    success: true,
    data: {
      projects,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    },
  });
};

const createProject = async (req, res) => {
  const { name, description, deadline, status } = req.body;

  const project = await Project.create({
    name,
    description,
    deadline,
    status,
    createdBy: req.user._id,
    teamMembers: [req.user._id],
  });

  res.status(201).json({ success: true, data: { project } });
};

module.exports = {
  getProjects,
  createProject,
};
