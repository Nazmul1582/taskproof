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

// get a single project
const getProject = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await Project.findById(id)
      .populate("createdBy", "name email")
      .populate("teamMembers", "name email avatar");

    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    }

    // Check access
    const isMember = project.teamMembers.some(
      (m) => m._id.toString() === req.user._id.toString(),
    );
    const isCreator =
      project.createdBy._id.toString() === req.user._id.toString();

    if (req.user.role !== "admin" && !isMember && !isCreator) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    res.status(200).json({ success: true, data: { project } });
  } catch (error) {
    console.error("Get project error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// create project
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
  getProject,
  createProject,
};
