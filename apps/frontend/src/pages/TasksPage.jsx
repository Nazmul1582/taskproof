import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { taskService } from "../services/api";
import { Search, Filter, X, ChevronDown, ChevronUp } from "lucide-react";
import toast from "react-hot-toast";
import TaskCard from "../components/tasks/TaskCard";
import LoadingSpinner from "../components/common/LoadingSpinner";

const TasksPage = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: [
      "tasks",
      { page, search, status: statusFilter, priority: priorityFilter },
    ],
    queryFn: () =>
      taskService
        .getTasks({
          page,
          search,
          status: statusFilter,
          priority: priorityFilter,
        })
        .then((res) => res.data.data),
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

  const handleStatusChange = (taskId, status) => {
    updateStatusMutation.mutate({ id: taskId, status });
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("");
    setPriorityFilter("");
    setSortBy("createdAt");
    setSortOrder("desc");
    setPage(1);
  };

  const hasActiveFilters =
    search ||
    statusFilter ||
    priorityFilter ||
    sortBy !== "createdAt" ||
    sortOrder !== "desc";

  if (isLoading) return <LoadingSpinner />;

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
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="sm:hidden btn-secondary flex items-center justify-center gap-2 text-sm py-2"
        >
          <Filter className="w-4 h-4" />
          {showFilters ? "Hide Filters" : "Show Filters"}
          {hasActiveFilters && (
            <span className="ml-1 w-2 h-2 bg-primary-600 rounded-full"></span>
          )}
        </button>
      </div>

      {/* Search and Filters */}
      <div className={`space-y-3 ${showFilters ? "block" : "hidden sm:block"}`}>
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

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="input w-full sm:w-36 text-sm sm:text-base"
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
            className="input w-full sm:w-36 text-sm sm:text-base"
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
            className="input w-full sm:w-44 text-sm sm:text-base"
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
                  className="hover:text-red-500"
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
                  className="hover:text-red-500"
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
                  className="hover:text-red-500"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <button
              onClick={clearFilters}
              className="text-xs text-primary-600 hover:underline"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-500">
        Found {data?.total || 0} task{data?.total !== 1 ? "s" : ""}
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {getSortedTasks().length > 0 ? (
          getSortedTasks().map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onEdit={() => (window.location.href = `/tasks/${task._id}`)}
              onDelete={async (id) => {
                if (window.confirm("Delete this task?")) {
                  try {
                    await taskService.deleteTask(id);
                    queryClient.invalidateQueries(["tasks"]);
                    toast.success("Task deleted successfully");
                  } catch (error) {
                    toast.error(
                      error.response?.data?.message || "Failed to delete task",
                    );
                  }
                }
              }}
              onStatusChange={handleStatusChange}
              isUpdatingStatus={updateStatusMutation.isPending}
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
                  className="text-primary-600 text-sm hover:underline"
                >
                  Clear all filters
                </button>
              </>
            ) : (
              <p className="text-gray-500">
                No tasks found. Create your first task from a project!
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TasksPage;
