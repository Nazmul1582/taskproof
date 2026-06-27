// apps/frontend/src/pages/ProjectDetailPage.jsx
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { projectService, taskService } from "../services/api";
import { ArrowLeft, Plus, Users, UserPlus } from "lucide-react";
import toast from "react-hot-toast";
import TaskCard from "../components/tasks/TaskCard";
import TaskForm from "../components/tasks/TaskForm";
import Modal from "../components/common/Modal";
import AddMemberModal from "../components/team/AddMemberModal";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { useAuthStore } from "../store/authStore";

const ProjectDetailPage = () => {
  const { user } = useAuthStore();
  const canManage = user?.role !== "team_member";
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["project", id],
    queryFn: () => projectService.getProject(id).then((res) => res.data.data),
  });

  // Add member mutation
  const addMemberMutation = useMutation({
    mutationFn: (userId) => projectService.addMember(id, userId),
    onSuccess: () => {
      queryClient.invalidateQueries(["project", id]);
      toast.success("Member added successfully");
      setMemberModalOpen(false);
    },
    onError: (error) => {
      const message = error.response?.data?.message || "Failed to add member";
      toast.error(message);
    },
  });

  // Remove member mutation
  const removeMemberMutation = useMutation({
    mutationFn: (userId) => projectService.removeMember(id, userId),
    onSuccess: () => {
      queryClient.invalidateQueries(["project", id]);
      toast.success("Member removed successfully");
    },
    onError: (error) => {
      const message =
        error.response?.data?.message || "Failed to remove member";
      toast.error(message);
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: (data) => taskService.createTask({ ...data, projectId: id }),
    onSuccess: () => {
      queryClient.invalidateQueries(["project", id]);
      toast.success("Task created successfully");
      setTaskModalOpen(false);
    },
    onError: (error) =>
      toast.error(error.response?.data?.message || "Failed to create task"),
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }) => taskService.updateTask(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["project", id]);
      toast.success("Task updated successfully");
      setTaskModalOpen(false);
      setEditingTask(null);
    },
    onError: (error) =>
      toast.error(error.response?.data?.message || "Failed to update task"),
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (taskId) => taskService.deleteTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries(["project", id]);
      toast.success("Task deleted successfully");
    },
    onError: (error) =>
      toast.error(error.response?.data?.message || "Failed to delete task"),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ taskId, status }) =>
      taskService.updateStatus(taskId, status),
    onSuccess: () => {
      queryClient.invalidateQueries(["project", id]);
      toast.success("Status updated");
    },
    onError: (error) =>
      toast.error(error.response?.data?.message || "Failed to update status"),
  });

  const handleTaskSubmit = (taskData) => {
    if (editingTask) {
      updateTaskMutation.mutate({ id: editingTask._id, data: taskData });
    } else {
      createTaskMutation.mutate(taskData);
    }
  };

  const handleStatusChange = (taskId, status) => {
    updateStatusMutation.mutate({ taskId, status });
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm("Delete this task?")) {
      deleteTaskMutation.mutate(taskId);
    }
  };

  const filteredTasks = data?.tasks?.filter(
    (task) => !statusFilter || task.status === statusFilter,
  );

  const statusCounts = data?.tasks?.reduce((acc, task) => {
    acc[task.status] = (acc[task.status] || 0) + 1;
    return acc;
  }, {});

  if (isLoading) return <LoadingSpinner />;

  const project = data?.project;
  const tasks = data?.tasks || [];
  const teamMembers = project?.teamMembers || [];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/projects")}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg md:cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">{project?.name}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {project?.description}
            </p>
          </div>
        </div>
        <div className="flex gap-2 self-end">
          {canManage && (
            <button
              onClick={() => setMemberModalOpen(true)}
              className="btn-secondary flex items-center gap-2 text-sm md:cursor-pointer"
            >
              <Users className="w-4 h-4" />
              Manage Team
            </button>
          )}
          {canManage && (
            <button
              onClick={() => setTaskModalOpen(true)}
              className="btn-primary flex items-center gap-2 text-sm md:cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Task
            </button>
          )}
        </div>
      </div>

      {/* Project Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm text-gray-500">Status</p>
          <p className="font-semibold capitalize mt-1">
            {project?.status?.replace("_", " ")}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm text-gray-500">Deadline</p>
          <p className="font-semibold mt-1">
            {new Date(project?.deadline).toLocaleDateString()}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm text-gray-500">Total Tasks</p>
          <p className="font-semibold mt-1">{tasks.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm text-gray-500">Completion</p>
          <p className="font-semibold mt-1">
            {tasks.length > 0
              ? Math.round(
                  (tasks.filter((t) => t.status === "completed").length /
                    tasks.length) *
                    100,
                )
              : 0}
            %
          </p>
        </div>
      </div>

      {/* Team Members Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2">
            <Users className="w-5 h-5" />
            Team Members ({teamMembers.length})
          </h2>
          {canManage && (
            <button
              onClick={() => setMemberModalOpen(true)}
              className="text-primary-600 hover:text-primary-700 text-sm flex items-center gap-1 md:cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              Manage
            </button>
          )}
        </div>

        {teamMembers.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {teamMembers.map((member) => (
              <div
                key={member._id}
                className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg"
              >
                <div className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                  <span className="text-xs font-medium">
                    {member.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-sm">{member.name}</span>
                <span className="text-xs text-gray-500 capitalize">
                  ({member.role?.replace("_", " ")})
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-2">No team members yet</p>
            <button
              onClick={() => setMemberModalOpen(true)}
              className="text-primary-600 text-sm hover:underline inline-flex items-center gap-1 md:cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              Add team members
            </button>
          </div>
        )}
      </div>

      {/* Tasks Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h2 className="text-base sm:text-lg font-semibold">Tasks</h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setStatusFilter("")}
              className={`px-3 py-1 rounded-lg text-sm md:cursor-pointer ${
                !statusFilter
                  ? "bg-primary-600 text-white"
                  : "bg-gray-100 dark:bg-gray-700"
              }`}
            >
              All ({tasks.length})
            </button>
            <button
              onClick={() => setStatusFilter("todo")}
              className={`px-3 py-1 rounded-lg text-sm md:cursor-pointer ${
                statusFilter === "todo"
                  ? "bg-primary-600 text-white"
                  : "bg-gray-100 dark:bg-gray-700"
              }`}
            >
              Todo ({statusCounts?.todo || 0})
            </button>
            <button
              onClick={() => setStatusFilter("in_progress")}
              className={`px-3 py-1 rounded-lg text-sm md:cursor-pointer ${
                statusFilter === "in_progress"
                  ? "bg-primary-600 text-white"
                  : "bg-gray-100 dark:bg-gray-700"
              }`}
            >
              In Progress ({statusCounts?.in_progress || 0})
            </button>
            <button
              onClick={() => setStatusFilter("completed")}
              className={`px-3 py-1 rounded-lg text-sm md:cursor-pointer ${
                statusFilter === "completed"
                  ? "bg-primary-600 text-white"
                  : "bg-gray-100 dark:bg-gray-700"
              }`}
            >
              Completed ({statusCounts?.completed || 0})
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {filteredTasks?.length > 0 ? (
            filteredTasks.map((task) => (
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
            <div className="text-center py-8">
              <p className="text-gray-500">No tasks found</p>
              <button
                onClick={() => setTaskModalOpen(true)}
                className="mt-2 text-primary-600 text-sm hover:underline md:cursor-pointer"
              >
                Create your first task
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <Modal
        isOpen={taskModalOpen}
        onClose={() => {
          setTaskModalOpen(false);
          setEditingTask(null);
        }}
        title={editingTask ? "Edit Task" : "Create Task"}
      >
        <TaskForm
          initialData={editingTask}
          projectId={id}
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

      <AddMemberModal
        isOpen={memberModalOpen}
        onClose={() => setMemberModalOpen(false)}
        projectId={id}
        currentMembers={teamMembers}
        onAdd={addMemberMutation.mutate}
        onRemove={removeMemberMutation.mutate}
        isLoading={
          addMemberMutation.isPending || removeMemberMutation.isPending
        }
      />
    </div>
  );
};

export default ProjectDetailPage;
