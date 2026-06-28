import { useState } from "react";
import useDebounce from "../hooks/useDebounce";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { taskService, projectService } from "../services/api";
import { Search, Filter, X, Plus } from "lucide-react";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import TaskCard from "../components/tasks/TaskCard";
import TaskForm from "../components/tasks/TaskForm";
import Modal from "../components/common/Modal";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { useAuthStore } from "../store/authStore";

const TasksPage = () => {
  const { user } = useAuthStore();
  const canManage = user?.role !== "team_member";
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [projectFilter, setProjectFilter] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [showFilters, setShowFilters] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Fetch projects for the project filter dropdown
  const { data: projectsData } = useQuery({
    queryKey: ["projects-for-filter"],
    queryFn: () =>
      projectService.getProjects({ limit: 100 }).then((res) => res.data.data),
  });

  // Build query params - only include filters that have values
  const queryParams = {
    page,
    search: debouncedSearch || undefined,
  };
  if (statusFilter && statusFilter !== "") queryParams.status = statusFilter;
  if (priorityFilter && priorityFilter !== "")
    queryParams.priority = priorityFilter;
  if (projectFilter && projectFilter !== "")
    queryParams.projectId = projectFilter;

  const { data, isLoading } = useQuery({
    queryKey: ["tasks", queryParams],
    queryFn: () =>
      taskService.getTasks(queryParams).then((res) => res.data.data),
    enabled: true,
  });

  const createTaskMutation = useMutation({
    mutationFn: (data) => taskService.createTask(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["tasks"]);
      toast.success("Task created successfully");
      setTaskModalOpen(false);
    },
    onError: (error) => {
      const message = error.response?.data?.message || "Failed to create task";
      toast.error(message);
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }) => taskService.updateTask(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["tasks"]);
      toast.success("Task updated successfully");
      setTaskModalOpen(false);
      setEditingTask(null);
    },
    onError: (error) => {
      const message = error.response?.data?.message || "Failed to update task";
      toast.error(message);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => taskService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries(["tasks"]);
      toast.success("Task status updated");
    },
    onError: (error) =>
      toast.error(error.response?.data?.message || "Failed to update status"),
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (id) => taskService.deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["tasks"]);
      toast.success("Task deleted successfully");
    },
    onError: (error) =>
      toast.error(error.response?.data?.message || "Failed to delete task"),
  });

  const handleTaskSubmit = (taskData) => {
    if (editingTask) {
      updateTaskMutation.mutate({ id: editingTask._id, data: taskData });
    } else {
      createTaskMutation.mutate(taskData);
    }
  };

  const handleStatusChange = (taskId, status) => {
    updateStatusMutation.mutate({ id: taskId, status });
  };

  const handleDeleteTask = async (taskId) => {
    const result = await Swal.fire({
      title: "Delete Task?",
      text: "Are you sure you want to delete this task?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it",
    });
    if (result.isConfirmed) {
      deleteTaskMutation.mutate(taskId);
    }
  };

  const getSortedTasks = () => {
    if (!data?.tasks) return [];
    return [...data.tasks].sort((a, b) => {
      if (sortBy === "dueDate") {
        return sortOrder === "asc"
          ? new Date(a.dueDate) - new Date(b.dueDate)
          : new Date(b.dueDate) - new Date(a.dueDate);
      }
      if (sortBy === "priority") {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return sortOrder === "asc"
          ? priorityOrder[a.priority] - priorityOrder[b.priority]
          : priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return sortOrder === "asc"
        ? new Date(a.createdAt) - new Date(b.createdAt)
        : new Date(b.createdAt) - new Date(a.createdAt);
    });
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("");
    setPriorityFilter("");
    setProjectFilter("");
    setSortBy("createdAt");
    setSortOrder("desc");
    setPage(1);
  };

  const hasActiveFilters =
    search ||
    statusFilter ||
    priorityFilter ||
    projectFilter ||
    sortBy !== "createdAt" ||
    sortOrder !== "desc";

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">All Tasks</h1>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-0.5 sm:mt-1">
            Manage and track all tasks across projects
          </p>
        </div>
        {canManage && (
          <button
            onClick={() => {
              setEditingTask(null);
              setTaskModalOpen(true);
            }}
            className="btn-primary flex items-center justify-center gap-2 text-sm sm:text-base py-2 sm:py-2.5 md:cursor-pointer"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            Add Task
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="sm:hidden btn-secondary flex items-center justify-center gap-2 md:cursor-pointer"
          >
            <Filter className="w-4 h-4" />
            {showFilters ? "Hide Filters" : "Show Filters"}
            {hasActiveFilters && (
              <span className="ml-1 w-2 h-2 bg-primary-600 rounded-full"></span>
            )}
          </button>
        </div>

        <div
          className={`space-y-3 ${showFilters ? "block" : "hidden sm:block"}`}
        >
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search tasks by title or description..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="input pl-9 text-sm sm:text-base"
              />
            </div>

            {/* Project Filter */}
            <select
              value={projectFilter}
              onChange={(e) => {
                setProjectFilter(e.target.value);
                setPage(1);
              }}
              className="input w-full sm:w-40 text-sm sm:text-base dark:bg-gray-800"
            >
              <option value="">All Projects</option>
              {projectsData?.projects?.map((project) => (
                <option key={project._id} value={project._id}>
                  {project.name}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="input w-full sm:w-36 text-sm sm:text-base dark:bg-gray-800"
            >
              <option value="">All Status</option>
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value);
                setPage(1);
              }}
              className="input w-full sm:w-36 text-sm sm:text-base dark:bg-gray-800"
            >
              <option value="">All Priority</option>
              <option value="high">High 🔴</option>
              <option value="medium">Medium 🟡</option>
              <option value="low">Low 🟢</option>
            </select>

            {/* Sort By */}
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [newSortBy, newSortOrder] = e.target.value.split("-");
                setSortBy(newSortBy);
                setSortOrder(newSortOrder);
              }}
              className="input w-full sm:w-44 text-sm sm:text-base dark:bg-gray-800"
            >
              <option value="createdAt-desc">Latest Created</option>
              <option value="createdAt-asc">Oldest Created</option>
              <option value="dueDate-asc">Nearest Deadline</option>
              <option value="dueDate-desc">Farthest Deadline</option>
              <option value="priority-desc">Highest Priority</option>
              <option value="priority-asc">Lowest Priority</option>
            </select>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="text-xs text-gray-500">Active filters:</span>
              {search && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs">
                  Search: "{search}"
                  <button
                    onClick={() => setSearch("")}
                    className="hover:text-red-500 md:cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {projectFilter && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs">
                  Project:{" "}
                  {projectsData?.projects?.find((p) => p._id === projectFilter)
                    ?.name || projectFilter}
                  <button
                    onClick={() => setProjectFilter("")}
                    className="hover:text-red-500 md:cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {statusFilter && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs">
                  Status: {statusFilter.replace("_", " ")}
                  <button
                    onClick={() => setStatusFilter("")}
                    className="hover:text-red-500 md:cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {priorityFilter && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs">
                  Priority: {priorityFilter}
                  <button
                    onClick={() => setPriorityFilter("")}
                    className="hover:text-red-500 md:cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              <button
                onClick={clearFilters}
                className="text-xs text-primary-600 hover:underline md:cursor-pointer"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-500">
        Found {data?.total || 0} task{data?.total !== 1 ? "s" : ""}
      </div>

      {/* Tasks List */}
      {isLoading ? (
        <LoadingSpinner />
      ) : (
      <div className="space-y-3">
        {getSortedTasks().length > 0 ? (
          getSortedTasks().map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onEdit={() => {
                setEditingTask(task);
                setTaskModalOpen(true);
              }}
              onDelete={handleDeleteTask}
              onStatusChange={handleStatusChange}
              isUpdatingStatus={updateStatusMutation.isPending}
              canManage={canManage}
            />
          ))
        ) : (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            {hasActiveFilters ? (
              <>
                <p className="text-gray-500 mb-2">
                  No tasks match your filters
                </p>
                <button
                  onClick={clearFilters}
                  className="text-primary-600 text-sm hover:underline md:cursor-pointer"
                >
                  Clear all filters
                </button>
              </>
            ) : (
              <>
                <p className="text-gray-500 mb-4">
                  {canManage
                    ? "No tasks found. Create your first task!"
                    : "No tasks found"}
                </p>
                {canManage && (
                  <button
                    onClick={() => {
                      setEditingTask(null);
                      setTaskModalOpen(true);
                    }}
                    className="btn-primary inline-flex items-center gap-2 md:cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Add Task
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>
      )}

      {/* Add/Edit Task Modal */}
      <Modal
        isOpen={taskModalOpen}
        onClose={() => {
          setTaskModalOpen(false);
          setEditingTask(null);
        }}
        title={editingTask ? "Edit Task" : "Create New Task"}
      >
        <TaskForm
          initialData={editingTask}
          teamMembers={[]}
          onSubmit={handleTaskSubmit}
          onCancel={() => {
            setTaskModalOpen(false);
            setEditingTask(null);
          }}
          isLoading={
            createTaskMutation.isPending || updateTaskMutation.isPending
          }
        />
      </Modal>
    </div>
  );
};

export default TasksPage;
