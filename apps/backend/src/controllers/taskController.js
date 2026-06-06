const Task = require("../models/Task");
const Project = require("../models/Project");

// Get all tasks
const getTasks = async (req, res) => {
  try {
    const {
      projectId,
      status,
      priority,
      assignedTo,
      search,
      page = 1,
      limit = 10,
    } = req.query;

    let query = {};

    if (projectId) query.projectId = projectId;
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (assignedTo) query.assignedTo = assignedTo;

    // Team members can only see their own tasks unless specified
    if (req.user.role === "team_member" && !assignedTo) {
      query.assignedTo = req.user._id;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const tasks = await Task.find(query)
      .populate("assignedTo", "name email avatar")
      .populate("createdBy", "name")
      .populate("projectId", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Task.countDocuments(query);

    res.json({
      success: true,
      data: {
        tasks,
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Get tasks error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create task
const createTask = async (req, res) => {
  try {
    const { title, description, projectId, assignedTo, dueDate, priority } =
      req.body;

    // Check if project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    }

    // Check if assignedTo is a team member
    if (
      req.user.role === "team_member" &&
      !project.teamMembers.includes(assignedTo)
    ) {
      return res.status(400).json({
        success: false,
        message: "Assigned user is not a project member",
      });
    }

    // Check for duplicate task title in same project
    const existingTask = await Task.findOne({ title, projectId });
    if (existingTask) {
      return res.status(400).json({
        success: false,
        message: "This task already exists in the project.",
      });
    }

    const task = await Task.create({
      title,
      description,
      projectId,
      assignedTo,
      dueDate,
      priority: priority || "medium",
      createdBy: req.user._id,
    });

    // Populate assignedTo details
    await task.populate("assignedTo", "name email");

    res.status(201).json({ success: true, data: { task } });
  } catch (error) {
    console.error("Create task error:", error);

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "This task already exists in the project.",
      });
    }

    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single task
const getTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id)
      .populate("assignedTo", "name email avatar")
      .populate("createdBy", "name")
      .populate("projectId", "name status");

    if (!task) {
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
    }

    // Check access
    const isAssigned =
      task.assignedTo._id.toString() === req.user._id.toString();
    const isCreator = task.createdBy._id.toString() === req.user._id.toString();

    if (req.user.role !== "admin" && !isAssigned && !isCreator) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    res.status(200).json({ success: true, data: { task } });
  } catch (error) {
    console.error("Get task error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update task
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    let task = await Task.findById(id);

    if (!task) {
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
    }

    // Check if trying to reassign a completed task
    if (
      task.status === "completed" &&
      updateData.assignedTo &&
      updateData.assignedTo !== task.assignedTo.toString()
    ) {
      return res.status(400).json({
        success: false,
        message: "Completed tasks cannot be reassigned.",
      });
    }

    // Check permission
    const canEdit =
      req.user.role === "admin" ||
      task.createdBy.toString() === req.user._id.toString();

    if (!canEdit) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    // Check for duplicate title if title is being changed
    if (updateData.title && updateData.title !== task.title) {
      const existingTask = await Task.findOne({
        title: updateData.title,
        projectId: task.projectId,
        _id: { $ne: task._id },
      });
      if (existingTask) {
        return res.status(400).json({
          success: false,
          message: "This task already exists in the project.",
        });
      }
    }

    task = await Task.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: { task } });
  } catch (error) {
    console.error("Update task error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete task
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id);

    if (!task) {
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
    }

    if (
      req.user.role !== "admin" &&
      task.createdBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    await task.deleteOne();

    res
      .status(200)
      .json({ success: true, message: "Task deleted successfully" });
  } catch (error) {
    console.error("Delete task error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update task status
const updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    let task = await Task.findById(id);

    if (!task) {
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
    }

    // Check permission - team members can only update status of assigned tasks
    const isAssigned = task.assignedTo.toString() === req.user._id.toString();

    if (req.user.role === "team_member" && !isAssigned) {
      return res.status(403).json({
        success: false,
        message: "You can only update status of tasks assigned to you",
      });
    }

    await task.save();

    res.status(200).json({ success: true, data: { task } });
  } catch (error) {
    console.error("Update task status error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getTasks,
  createTask,
  getTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
};
