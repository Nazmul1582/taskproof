import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const projectSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(100),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(1000),
  deadline: z.string().min(1, "Deadline is required"),
  status: z.enum(["active", "completed", "on_hold"]).default("active"),
});

const ProjectForm = ({ initialData, onSubmit, onCancel, isLoading }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          deadline: initialData.deadline
            ? new Date(initialData.deadline).toISOString().split("T")[0]
            : "",
        }
      : {
          name: "",
          description: "",
          deadline: "",
          status: "active",
        },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Project Name</label>
        <input
          {...register("name")}
          className="input"
          placeholder="Enter project name"
        />
        {errors.name && (
          <p className="text-red-500 dark:text-red-400 text-sm mt-1">
            {errors.name.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          {...register("description")}
          rows={4}
          className="input"
          placeholder="Enter project description"
        />
        {errors.description && (
          <p className="text-red-500 dark:text-red-400 text-sm mt-1">
            {errors.description.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Deadline</label>
        <input {...register("deadline")} type="date" className="input" />
        {errors.deadline && (
          <p className="text-red-500 dark:text-red-400 text-sm mt-1">
            {errors.deadline.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Status</label>
        <select {...register("status")} className="input">
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="on_hold">On Hold</option>
        </select>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 btn-primary md:cursor-pointer"
        >
          {isLoading ? "Saving..." : initialData ? "Update" : "Create"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 btn-secondary md:cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default ProjectForm;
