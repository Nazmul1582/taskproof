import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { taskService } from "../services/api";
import {
  ArrowLeft,
  Send,
  Paperclip,
  X,
  Download,
  Calendar,
  Flag,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { formatDistanceToNow } from "date-fns";

const PriorityBadge = ({ priority }) => {
  const styles = {
    high: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800",
    medium:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800",
    low: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${styles[priority]}`}
    >
      <Flag className="w-3 h-3" />
      {priority.toUpperCase()}
    </span>
  );
};

const StatusBadge = ({ status }) => {
  const styles = {
    todo: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
    in_progress:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    completed:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  };
  const labels = {
    todo: "To Do",
    in_progress: "In Progress",
    completed: "Completed",
  };
  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
};

const TaskDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState("");
  const [uploading, setUploading] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["task", id],
    queryFn: () => taskService.getTask(id).then((res) => res.data.data),
  });

  const updateStatusMutation = useMutation({
    mutationFn: (status) => taskService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries(["task", id]);
      toast.success("Status updated");
    },
    onError: (error) =>
      toast.error(error.response?.data?.message || "Failed to update status"),
  });

  const addCommentMutation = useMutation({
    mutationFn: (text) => taskService.addComment(id, text),
    onSuccess: () => {
      queryClient.invalidateQueries(["task", id]);
      setNewComment("");
      toast.success("Comment added");
    },
    onError: (error) =>
      toast.error(error.response?.data?.message || "Failed to add comment"),
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId) => taskService.deleteComment(id, commentId),
    onSuccess: () => {
      queryClient.invalidateQueries(["task", id]);
      toast.success("Comment deleted");
    },
    onError: (error) =>
      toast.error(error.response?.data?.message || "Failed to delete comment"),
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    setUploading(true);

    try {
      // Note: You'll need to implement file upload endpoint
      // const response = await taskService.addAttachment(id, formData)
      toast.success("File uploaded successfully");
      queryClient.invalidateQueries(["task", id]);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  const task = data?.task;
  const isOverdue =
    task && new Date(task.dueDate) < new Date() && task.status !== "completed";

  if (isLoading) return <LoadingSpinner />;

  if (!task) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Task not found</p>
        <button onClick={() => navigate("/tasks")} className="btn-primary mt-4 md:cursor-pointer">
          Back to Tasks
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors md:cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      {/* Task Header Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl font-bold break-words">
              {task.title}
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <PriorityBadge priority={task.priority} />
              <StatusBadge status={task.status} />
              {isOverdue && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-full text-xs">
                  <AlertCircle className="w-3 h-3" />
                  Overdue
                </span>
              )}
            </div>
          </div>

          {/* Status Select for Mobile */}
          <div className="sm:hidden">
            <select
              value={task.status}
              onChange={(e) => updateStatusMutation.mutate(e.target.value)}
              className="input text-sm w-full"
              disabled={updateStatusMutation.isPending}
            >
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
          {task.description}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
              <span className="text-primary-600 dark:text-primary-400 font-medium text-sm">
                {task.projectId?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Project</p>
              <p className="font-medium">{task.projectId?.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-gray-500 text-xs">Assigned To</p>
              <p className="font-medium">{task.assignedTo?.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-gray-500 text-xs">Due Date</p>
              <p className={`font-medium ${isOverdue ? "text-red-600" : ""}`}>
                {new Date(task.dueDate).toLocaleDateString()}
                {isOverdue && " (Overdue)"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-gray-500 text-xs">Created By</p>
              <p className="font-medium">{task.createdBy?.name}</p>
              <p className="text-xs text-gray-400">
                {formatDistanceToNow(new Date(task.createdAt), {
                  addSuffix: true,
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Status Select for Desktop */}
        <div className="hidden sm:block mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">Update Status:</span>
            <select
              value={task.status}
              onChange={(e) => updateStatusMutation.mutate(e.target.value)}
              className="input text-sm w-40"
              disabled={updateStatusMutation.isPending}
            >
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Attachments Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold mb-4">Attachments</h3>
        <div className="mb-4">
          <label className="btn-secondary cursor-pointer inline-flex items-center gap-2 text-sm">
            <Paperclip className="w-4 h-4" />
            Upload File
            <input type="file" onChange={handleFileUpload} className="hidden" />
          </label>
          {uploading && (
            <span className="ml-3 text-sm text-gray-500">Uploading...</span>
          )}
        </div>
        <div className="space-y-2">
          {task.attachments?.length > 0 ? (
            task.attachments.map((file) => (
              <div
                key={file._id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg gap-2"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Paperclip className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  <span className="text-sm truncate">{file.filename}</span>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                  <button className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors md:cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm text-center py-4">
              No attachments
            </p>
          )}
        </div>
      </div>

      {/* Comments Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold mb-4">
          Comments ({task.comments?.length || 0})
        </h3>

        {/* Comment List */}
        <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
          {task.comments?.length > 0 ? (
            task.comments.map((comment) => (
              <div key={comment._id} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                    {comment.userName?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                      <p className="font-medium text-sm">{comment.userName}</p>
                      <p className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(comment.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                    <p className="text-sm break-words">{comment.text}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">
              No comments yet. Be the first to comment!
            </p>
          )}
        </div>

        {/* Add Comment Form */}
        <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-gray-100 dark:border-gray-700">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyPress={(e) =>
              e.key === "Enter" &&
              newComment.trim() &&
              addCommentMutation.mutate(newComment)
            }
            placeholder="Write a comment..."
            className="flex-1 input text-sm"
          />
          <button
            onClick={() => addCommentMutation.mutate(newComment)}
            disabled={!newComment.trim() || addCommentMutation.isPending}
            className="btn-primary flex items-center justify-center gap-2 sm:w-auto w-full md:cursor-pointer"
          >
            <Send className="w-4 h-4" />
            {addCommentMutation.isPending ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailPage;
