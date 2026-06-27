import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { projectService, userService } from "../../services/api";
import LoadingSpinner from "../common/LoadingSpinner";

const taskSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(2000),
  projectId: z.string().min(1, "Please select a project"),
  assignedTo: z.string().min(1, "Please select a team member"),
  dueDate: z.string().min(1, "Due date is required"),
  priority: z.enum(["high", "medium", "low"]),
});

const TaskForm = ({
  initialData,
  projectId: initialProjectId,
  teamMembers: initialTeamMembers,
  onSubmit,
  onCancel,
  isLoading,
}) => {
  const [teamMembers, setTeamMembers] = useState(initialTeamMembers || []);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(taskSchema),
    defaultValues: initialData
      ? {
          title: initialData.title,
          description: initialData.description,
          projectId: initialData.projectId?._id || initialData.projectId || "",
          assignedTo:
            initialData.assignedTo?._id || initialData.assignedTo || "",
          dueDate: initialData.dueDate
            ? new Date(initialData.dueDate).toISOString().split("T")[0]
            : "",
          priority: initialData.priority || "medium",
        }
      : {
          title: "",
          description: "",
          projectId: "",
          assignedTo: "",
          dueDate: "",
          priority: "medium",
        },
  });

  const watchProjectId = watch("projectId");

  // Fetch projects for dropdown
  const { data: projectsData, isLoading: projectsLoading } = useQuery({
    queryKey: ["projects-for-task-form"],
    queryFn: () =>
      projectService.getProjects({ limit: 100 }).then((res) => res.data.data),
    enabled: true,
  });

  // Fetch team members when project is selected
  const { data: projectData, isLoading: projectLoading } = useQuery({
    queryKey: ["project-team-members", watchProjectId],
    queryFn: () =>
      projectService.getProject(watchProjectId).then((res) => res.data.data),
    enabled: !!watchProjectId && watchProjectId !== "",
  });

  // Load team members when project changes
  useEffect(() => {
    if (projectData?.project?.teamMembers) {
      setTeamMembers(projectData.project.teamMembers);
    }
  }, [projectData]);

  // Sync the select DOM value after team members are rendered as options
  useEffect(() => {
    if (teamMembers.length > 0) {
      const currentAssignedTo = watch("assignedTo");
      if (currentAssignedTo) {
        if (teamMembers.some((m) => m._id === currentAssignedTo)) {
          setValue("assignedTo", currentAssignedTo);
        } else {
          setValue("assignedTo", "");
        }
      }
    }
  }, [teamMembers]); // eslint-disable-line react-hooks/exhaustive-deps

  if (projectsLoading) {
    return (
      <div className="py-8 text-center">
        <LoadingSpinner />
      </div>
    );
  }

  const projects = projectsData?.projects || [];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Task Title *</label>
        <input
          {...register("title")}
          className="input"
          placeholder="Enter task title"
        />
        {errors.title && (
          <p className="text-red-500 dark:text-red-400 text-sm mt-1">
            {errors.title.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description *</label>
        <textarea
          {...register("description")}
          rows={4}
          className="input resize-y"
          placeholder="Enter task description"
        />
        {errors.description && (
          <p className="text-red-500 dark:text-red-400 text-sm mt-1">
            {errors.description.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Project *</label>
        <select
          {...register("projectId")}
          className="input dark:bg-gray-800"
          onChange={(e) => {
            register("projectId").onChange(e);
          }}
        >
          <option value="">Select a project</option>
          {projects.map((project) => (
            <option key={project._id} value={project._id}>
              {project.name}
            </option>
          ))}
        </select>
        {errors.projectId && (
          <p className="text-red-500 dark:text-red-400 text-sm mt-1">
            {errors.projectId.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Assign To *</label>
        {projectLoading ? (
          <div className="input flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <select
            {...register("assignedTo")}
            className="input dark:bg-gray-800"
            disabled={!watchProjectId}
          >
            <option value="">
              {watchProjectId
                ? "Select a team member"
                : "Select a project first"}
            </option>
            {teamMembers.map((member) => (
              <option key={member._id} value={member._id}>
                {member.name} ({member.role?.replace("_", " ")})
              </option>
            ))}
          </select>
        )}
        {errors.assignedTo && (
          <p className="text-red-500 dark:text-red-400 text-sm mt-1">
            {errors.assignedTo.message}
          </p>
        )}
        {watchProjectId && teamMembers.length === 0 && !projectLoading && (
          <p className="text-yellow-500 text-sm mt-1">
            No team members in this project. Add members first.
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Due Date *</label>
        <input
          {...register("dueDate")}
          type="date"
          className="input"
          min={new Date().toISOString().split("T")[0]}
        />
        {errors.dueDate && (
          <p className="text-red-500 dark:text-red-400 text-sm mt-1">
            {errors.dueDate.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Priority</label>
        <select {...register("priority")} className="input dark:bg-gray-800">
          <option value="low">🟢 Low</option>
          <option value="medium">🟡 Medium</option>
          <option value="high">🔴 High</option>
        </select>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary flex-1 py-2.5 md:cursor-pointer"
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
          className="btn-secondary flex-1 py-2.5 md:cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default TaskForm;
