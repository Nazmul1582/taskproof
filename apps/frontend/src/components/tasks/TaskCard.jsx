import { useState } from "react";
import {
  Edit2,
  Trash2,
  MessageCircle,
  Paperclip,
  ChevronDown,
  ChevronUp,
  Calendar,
  Flag,
  Folder,
} from "lucide-react";

const PriorityBadge = ({ priority }) => {
  const styles = {
    high: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800",
    medium:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800",
    low: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800",
  };
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${styles[priority]}`}
    >
      <Flag className="w-3 h-3" />
      {priority.toUpperCase()}
    </span>
  );
};

const StatusSelect = ({ currentStatus, onStatusChange, isUpdating }) => {
  const statusOptions = [
    {
      value: "todo",
      label: "To Do",
      color: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
    },
    {
      value: "in_progress",
      label: "In Progress",
      color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    },
    {
      value: "completed",
      label: "Completed",
      color:
        "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    },
  ];

  return (
    <select
      value={currentStatus}
      onChange={(e) => onStatusChange(e.target.value)}
      disabled={isUpdating}
      className={`text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
        isUpdating ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      {statusOptions.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

const TaskCard = ({
  task,
  onEdit,
  onDelete,
  onStatusChange,
  isUpdatingStatus,
  canManage = true,
}) => {
  const [expanded, setExpanded] = useState(false);
  const isOverdue =
    new Date(task.dueDate) < new Date() && task.status !== "completed";

  const getDaysRemaining = () => {
    const today = new Date();
    const dueDate = new Date(task.dueDate);
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysRemaining = getDaysRemaining();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200">
      {/* Main Row - Always Visible */}
      <div className="p-3 sm:p-4">
        <div className="flex flex-wrap items-start gap-2">
          {/* Status on mobile - top row */}
          <div className="w-full sm:w-auto sm:order-1 order-2">
            <StatusSelect
              currentStatus={task.status}
              onStatusChange={(status) => onStatusChange(task._id, status)}
              isUpdating={isUpdatingStatus}
            />
          </div>

          {/* Title and Priority */}
          <div className="flex-1 min-w-0 order-1 sm:order-2">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="text-sm sm:text-base font-semibold break-words flex-1">
                {task.title}
              </h3>
              <PriorityBadge priority={task.priority} />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1 order-3 ml-auto sm:ml-0">
            {canManage && (
              <button
                onClick={() => onEdit(task)}
                className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/50 rounded-lg transition-colors md:cursor-pointer"
                title="Edit task"
              >
                <Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            )}
            {canManage && (
              <button
                onClick={() => onDelete(task._id)}
                className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/50 rounded-lg transition-colors md:cursor-pointer"
                title="Delete task"
              >
                <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            )}
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors md:cursor-pointer"
              title={expanded ? "Show less" : "Show more"}
            >
              {expanded ? (
                <ChevronUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Quick Info Row */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-2 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span className={isOverdue ? "text-red-600 font-medium" : ""}>
              Due: {new Date(task.dueDate).toLocaleDateString()}
              {!isOverdue &&
                task.status !== "completed" &&
                daysRemaining <= 3 && (
                  <span className="ml-1 text-orange-600">
                    ({daysRemaining} days left)
                  </span>
                )}
              {isOverdue && task.status !== "completed" && (
                <span className="ml-1 text-red-600">(Overdue)</span>
              )}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <MessageCircle className="w-3 h-3" />
            <span>{task.comments?.length || 0} comments</span>
          </div>

          {task.projectId?.name && (
            <div className="flex items-center gap-1">
              <Folder className="w-3 h-3" />
              <span className="truncate max-w-[120px]">{task.projectId.name}</span>
            </div>
          )}

          {task.attachments?.length > 0 && (
            <div className="flex items-center gap-1">
              <Paperclip className="w-3 h-3" />
              <span>{task.attachments.length} files</span>
            </div>
          )}

          <div className="flex items-center gap-1">
            <span className="text-gray-400">👤</span>
            <span className="truncate max-w-[100px]">
              {task.assignedTo?.name}
            </span>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="border-t border-gray-100 dark:border-gray-700 p-3 sm:p-4 bg-gray-50 dark:bg-gray-800/50 rounded-b-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">
            {task.description}
          </p>

          {/* Comments Preview */}
          {task.comments?.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <h4 className="text-xs font-semibold text-gray-500 mb-2">
                Recent Comments
              </h4>
              <div className="space-y-2">
                {task.comments.slice(-2).map((comment) => (
                  <div key={comment._id} className="text-xs">
                    <span className="font-medium text-primary-600">
                      {comment.userName}:
                    </span>
                    <span className="text-gray-600 dark:text-gray-400 ml-1">
                      {comment.text}
                    </span>
                    <span className="text-gray-400 text-xs ml-2">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskCard;
