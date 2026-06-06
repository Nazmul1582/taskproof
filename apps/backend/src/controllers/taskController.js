const Task = require("../models/Task");
const Project = require("../models/Project");
const ActivityLog = require("../models/ActivityLog");
const Notification = require("../models/Notification");

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

const createTask = async (req, res) => {
  try {
    const { title, description, projectId, assignedTo, dueDate, priority } =
      req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    }

    if (
      req.user.role === "team_member" &&
      !project.teamMembers.includes(assignedTo)
    ) {
      return res.status(400).json({
        success: false,
        message: "Assigned user is not a project member",
      });
    }

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

    await task.populate("assignedTo", "name email");

    await Notification.create({
      userId: assignedTo,
      title: "New Task Assigned",
      message: `You have been assigned task "${title}" in project "${project.name}"`,
      type: "task_assigned",
      relatedId: task._id,
    });

    await ActivityLog.create({
      action: `Task "${title}" assigned to ${task.assignedTo.name}`,
      user: req.user._id,
      userName: req.user.name,
      targetType: "task",
      targetId: task._id,
    });

    res.status(201).json({ success: true, data: { task } });
  } catch (error) {
    console.error("Create task error:", error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "This task already exists in the project.",
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

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

    const canEdit =
      req.user.role === "admin" ||
      task.createdBy.toString() === req.user._id.toString();

    if (!canEdit) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

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

    await ActivityLog.create({
      action: `Task "${task.title}" updated`,
      user: req.user._id,
      userName: req.user.name,
      targetType: "task",
      targetId: task._id,
    });

    res.status(200).json({ success: true, data: { task } });
  } catch (error) {
    console.error("Update task error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

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

    const taskTitle = task.title;
    await task.deleteOne();

    await ActivityLog.create({
      action: `Task "${taskTitle}" deleted`,
      user: req.user._id,
      userName: req.user.name,
      targetType: "task",
      targetId: id,
    });

    res
      .status(200)
      .json({ success: true, message: "Task deleted successfully" });
  } catch (error) {
    console.error("Delete task error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

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

    const isAssigned = task.assignedTo.toString() === req.user._id.toString();

    if (req.user.role === "team_member" && !isAssigned) {
      return res.status(403).json({
        success: false,
        message: "You can only update status of tasks assigned to you",
      });
    }

    task.status = status;
    await task.save();

    if (status === "completed") {
      await Notification.create({
        userId: task.createdBy,
        title: "Task Completed",
        message: `Task "${task.title}" has been marked as completed`,
        type: "task_completed",
        relatedId: task._id,
      });
    }

    await ActivityLog.create({
      action: `Task "${task.title}" status changed to ${status}`,
      user: req.user._id,
      userName: req.user.name,
      targetType: "task",
      targetId: task._id,
    });

    res.status(200).json({ success: true, data: { task } });
  } catch (error) {
    console.error("Update task status error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const addComment = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { text } = req.body;

    const task = await Task.findById(taskId);

    if (!task) {
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
    }

    const isAssigned = task.assignedTo.toString() === req.user._id.toString();
    const isCreator = task.createdBy.toString() === req.user._id.toString();

    if (req.user.role !== "admin" && !isAssigned && !isCreator) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const comment = {
      userId: req.user._id,
      userName: req.user.name,
      text: text,
      createdAt: new Date(),
    };

    task.comments.push(comment);
    await task.save();

    res.status(201).json({
      success: true,
      data: { comment: task.comments[task.comments.length - 1] },
    });
  } catch (error) {
    console.error("Add comment error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteComment = async (req, res) => {
  try {
    const { taskId, commentId } = req.params;

    const task = await Task.findById(taskId);

    if (!task) {
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
    }

    const comment = task.comments.id(commentId);

    if (!comment) {
      return res
        .status(404)
        .json({ success: false, message: "Comment not found" });
    }

    const isAuthor = comment.userId.toString() === req.user._id.toString();

    if (req.user.role !== "admin" && !isAuthor) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    comment.deleteOne();
    await task.save();

    res
      .status(200)
      .json({ success: true, message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Delete comment error:", error);
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
  addComment,
  deleteComment,
};
