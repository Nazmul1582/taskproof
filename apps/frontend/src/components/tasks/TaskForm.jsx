import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const taskSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(2000),
  assignedTo: z.string().min(1, "Please select a team member"),
  dueDate: z.string().min(1, "Due date is required"),
  priority: z.enum(["high", "medium", "low"]),
});

const TaskForm = ({
  initialData,
  projectId,
  teamMembers,
  onSubmit,
  onCancel,
  isLoading,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(taskSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          assignedTo: initialData.assignedTo?._id || initialData.assignedTo,
          dueDate: initialData.dueDate
            ? new Date(initialData.dueDate).toISOString().split("T")[0]
            : "",
        }
      : {
          title: "",
          description: "",
          assignedTo: "",
          dueDate: "",
          priority: "medium",
        },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Task Title</label>
        <input
          {...register("title")}
          className="input"
          placeholder="Enter task title"
        />
        {errors.title && (
          <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          {...register("description")}
          rows={4}
          className="input resize-y"
          placeholder="Enter task description"
        />
        {errors.description && (
          <p className="text-red-500 text-sm mt-1">
            {errors.description.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Assign To</label>
        <select {...register("assignedTo")} className="input">
          <option value="">Select a team member</option>
          {teamMembers.map((member) => (
            <option key={member._id} value={member._id}>
              {member.name} ({member.role?.replace("_", " ")})
            </option>
          ))}
        </select>
        {errors.assignedTo && (
          <p className="text-red-500 text-sm mt-1">
            {errors.assignedTo.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Due Date</label>
        <input
          {...register("dueDate")}
          type="date"
          className="input"
          min={new Date().toISOString().split("T")[0]}
        />
        {errors.dueDate && (
          <p className="text-red-500 text-sm mt-1">{errors.dueDate.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Priority</label>
        <select {...register("priority")} className="input">
          <option value="low">🟢 Low</option>
          <option value="medium">🟡 Medium</option>
          <option value="high">🔴 High</option>
        </select>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary flex-1 py-2.5"
        >
          {isLoading
            ? "Saving..."
            : initialData
              ? "Update Task"
              : "Create Task"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary flex-1 py-2.5"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default TaskForm;
