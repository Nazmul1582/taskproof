const Project = require("../models/Project");
const Task = require("../models/Task");
const ActivityLog = require("../models/ActivityLog");
const Notification = require("../models/Notification");

const getProjects = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;

    let query = {};

    if (req.user.role === "team_member") {
      query.teamMembers = req.user._id;
    }

    if (status) query.status = status;
    if (search) query.name = { $regex: search, $options: "i" };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const projects = await Project.find(query)
      .populate("createdBy", "name email")
      .populate("teamMembers", "name email avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Project.countDocuments(query);

    res.json({
      success: true,
      data: {
        projects,
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Get projects error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const createProject = async (req, res) => {
  try {
    const { name, description, deadline, status } = req.body;

    const project = await Project.create({
      name,
      description,
      deadline,
      status: status || "active",
      createdBy: req.user._id,
      teamMembers: [req.user._id],
    });

    await ActivityLog.create({
      action: `Project "${name}" created`,
      user: req.user._id,
      userName: req.user.name,
      targetType: "project",
      targetId: project._id,
    });

    res.status(201).json({ success: true, data: { project } });
  } catch (error) {
    console.error("Create project error:", error);
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ success: false, message: "Project name already exists" });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

const getProject = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await Project.findById(id)
      .populate("createdBy", "name email")
      .populate("teamMembers", "name email avatar role");

    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    }

    const isMember = project.teamMembers.some(
      (m) => m._id.toString() === req.user._id.toString(),
    );
    const isCreator =
      project.createdBy._id.toString() === req.user._id.toString();

    if (req.user.role !== "admin" && !isMember && !isCreator) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const tasks = await Task.find({ projectId: project._id })
      .populate("assignedTo", "name email avatar")
      .populate("createdBy", "name");

    res.status(200).json({ success: true, data: { project, tasks } });
  } catch (error) {
    console.error("Get project error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    let project = await Project.findById(id);

    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    }

    if (req.user.role === "team_member") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    project = await Project.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    await ActivityLog.create({
      action: `Project "${project.name}" updated`,
      user: req.user._id,
      userName: req.user.name,
      targetType: "project",
      targetId: project._id,
    });

    res.status(200).json({ success: true, data: { project } });
  } catch (error) {
    console.error("Update project error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await Project.findById(id);

    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    }

    if (req.user.role === "team_member") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    await Task.deleteMany({ projectId: project._id });
    await project.deleteOne();

    await ActivityLog.create({
      action: `Project "${project.name}" deleted`,
      user: req.user._id,
      userName: req.user.name,
      targetType: "project",
      targetId: project._id,
    });

    res
      .status(200)
      .json({ success: true, message: "Project deleted successfully" });
  } catch (error) {
    console.error("Delete project error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const addTeamMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const project = await Project.findById(id);

    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    }

    if (req.user.role === "team_member") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    if (!project.teamMembers.includes(userId)) {
      project.teamMembers.push(userId);
      await project.save();

      await Notification.create({
        userId: userId,
        title: "Added to Project",
        message: `You have been added to project "${project.name}"`,
        type: "member_added",
        relatedId: project._id,
      });

      await ActivityLog.create({
        action: `Added member to project "${project.name}"`,
        user: req.user._id,
        userName: req.user.name,
        targetType: "member",
        targetId: userId,
      });
    }

    res.status(200).json({ success: true, data: { project } });
  } catch (error) {
    console.error("Add team member error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const removeTeamMember = async (req, res) => {
  try {
    const { id, userId } = req.params;

    const project = await Project.findById(id);

    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    }

    if (req.user.role === "team_member") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    project.teamMembers = project.teamMembers.filter(
      (m) => m.toString() !== userId,
    );
    await project.save();

    res.status(200).json({ success: true, data: { project } });
  } catch (error) {
    console.error("Remove team member error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getProjects,
  createProject,
  getProject,
  updateProject,
  deleteProject,
  addTeamMember,
  removeTeamMember,
};
