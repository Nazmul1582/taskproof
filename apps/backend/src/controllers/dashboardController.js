const Project = require("../models/Project");
const Task = require("../models/Task");
const ActivityLog = require("../models/ActivityLog");
const User = require("../models/User");

// Get KPI data
const getKPIs = async (req, res) => {
  let projectQuery = {};
  let taskQuery = {};

  // Team members can only see their own data
  if (req.user.role === "team_member") {
    projectQuery.teamMembers = req.user._id;
    taskQuery.assignedTo = req.user._id;
  }

  const totalProjects = await Project.countDocuments(projectQuery);
  const totalTasks = await Task.countDocuments(taskQuery);
  const completedTasks = await Task.countDocuments({
    ...taskQuery,
    status: "completed",
  });
  const pendingTasks = await Task.countDocuments({
    ...taskQuery,
    status: { $ne: "completed" },
  });
  const overdueTasks = await Task.countDocuments({
    ...taskQuery,
    dueDate: { $lt: new Date() },
    status: { $ne: "completed" },
  });

  res.json({
    success: true,
    data: {
      totalProjects,
      totalTasks,
      completedTasks,
      pendingTasks,
      overdueTasks,
    },
  });
};

// Get chart data
const getCharts = async (req, res) => {
  let taskQuery = {};

  if (req.user.role === "team_member") {
    taskQuery.assignedTo = req.user._id;
  }

  // Tasks by priority
  const tasksByPriority = await Task.aggregate([
    { $match: taskQuery },
    { $group: { _id: "$priority", count: { $sum: 1 } } },
  ]);

  // Tasks by status
  const tasksByStatus = await Task.aggregate([
    { $match: taskQuery },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  // Project progress
  let projectQuery = {};
  if (req.user.role === "team_member") {
    projectQuery.teamMembers = req.user._id;
  }

  const projects = await Project.find(projectQuery).limit(5);
  const projectProgress = [];

  for (const project of projects) {
    const total = await Task.countDocuments({ projectId: project._id });
    const completed = await Task.countDocuments({
      projectId: project._id,
      status: "completed",
    });
    projectProgress.push({
      name: project.name,
      total,
      completed,
      percentage: total > 0 ? (completed / total) * 100 : 0,
    });
  }

  res.json({
    success: true,
    data: {
      tasksByPriority,
      tasksByStatus,
      projectProgress,
    },
  });
};

// Get member workload
const getWorkload = async (req, res) => {
  let users = [];

  if (req.user.role === "admin" || req.user.role === "project_manager") {
    users = await User.find({}, "name email avatar role");
  } else {
    users = [req.user];
  }

  const memberWorkload = [];

  for (const user of users) {
    const total = await Task.countDocuments({ assignedTo: user._id });
    const completed = await Task.countDocuments({
      assignedTo: user._id,
      status: "completed",
    });
    const pending = total - completed;

    memberWorkload.push({
      memberId: user._id,
      memberName: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      total,
      completed,
      pending,
    });
  }

  res.json({ success: true, data: { memberWorkload } });
};

// Get upcoming deadlines
const getUpcoming = async (req, res) => {
  let taskQuery = {};

  if (req.user.role === "team_member") {
    taskQuery.assignedTo = req.user._id;
  }

  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

  const upcomingDeadlines = await Task.find({
    ...taskQuery,
    dueDate: { $gte: new Date(), $lte: sevenDaysFromNow },
    status: { $ne: "completed" },
  })
    .populate("assignedTo", "name")
    .populate("projectId", "name")
    .sort({ dueDate: 1 })
    .limit(5);

  const highPriorityTasks = await Task.find({
    ...taskQuery,
    priority: "high",
    status: { $ne: "completed" },
  })
    .populate("assignedTo", "name")
    .populate("projectId", "name")
    .sort({ dueDate: 1 })
    .limit(5);

  res.json({
    success: true,
    data: {
      upcomingDeadlines,
      highPriorityTasks,
    },
  });
};

module.exports = { getKPIs, getCharts, getWorkload, getUpcoming };
