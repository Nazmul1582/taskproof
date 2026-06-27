import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { projectService } from "../services/api";
import { Plus, Search, Edit2, Trash2, Eye, Filter } from "lucide-react";
import toast from "react-hot-toast";
import Modal from "../components/common/Modal";
import ProjectForm from "../components/projects/ProjectForm";
import LoadingSpinner from "../components/common/LoadingSpinner";
import StatusBadge from "../components/projects/StatusBadge";
import { useAuthStore } from "../store/authStore";
import { Link } from "react-router-dom";

const ProjectsPage = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const canManage = user?.role !== "team_member";

  const queryParams = {
    page,
    search,
  };
  if (statusFilter && statusFilter !== "") {
    queryParams.status = statusFilter;
  }

  const { data, isLoading } = useQuery({
    queryKey: ["projects", queryParams],
    queryFn: () =>
      projectService.getProjects(queryParams).then((res) => res.data.data),
    enabled: true,
  });

  const createMutation = useMutation({
    mutationFn: (data) => projectService.createProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["projects"]);
      toast.success("Project created successfully");
      setModalOpen(false);
    },
    onError: (error) => {
      const message =
        error.response?.data?.message || "Failed to create project";
      toast.error(message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => projectService.updateProject(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["projects"]);
      toast.success("Project updated successfully");
      setModalOpen(false);
      setEditingProject(null);
    },
    onError: (error) => {
      const message =
        error.response?.data?.message || "Failed to update project";
      toast.error(message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => projectService.deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["projects"]);
      toast.success("Project deleted successfully");
    },
    onError: (error) => {
      const message =
        error.response?.data?.message || "Failed to delete project";
      toast.error(message);
    },
  });

  const handleSubmit = (data) => {
    if (editingProject) {
      updateMutation.mutate({ id: editingProject._id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleStatusChange = (e) => {
    const value = e.target.value;
    setStatusFilter(value);
    setPage(1);
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Projects</h1>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-0.5 sm:mt-1">
            Manage all your projects
          </p>
        </div>
        {canManage && (
          <button
            onClick={() => {
              setEditingProject(null);
              setModalOpen(true);
            }}
            className="btn-primary flex items-center justify-center gap-2 text-sm sm:text-base py-2 sm:py-2.5 md:cursor-pointer"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            New Project
          </button>
        )}
      </div>

      {/* Search and Filter Section */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search projects..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="input pl-9 sm:pl-10 text-sm sm:text-base"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="sm:hidden btn-secondary flex items-center justify-center gap-2 md:cursor-pointer"
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
          <select
            value={statusFilter}
            onChange={handleStatusChange}
            className={`input w-full sm:w-48 text-sm sm:text-base dark:bg-gray-800 ${showFilters ? "block" : "hidden sm:block"}`}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="on_hold">On Hold</option>
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {data?.projects?.map((project) => (
          <Link
            key={project._id}
            to={`/projects/${project._id}`}
            className="block bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-5 md:p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between gap-2 mb-3">
              <h3 className="text-base sm:text-lg font-semibold wrap-break-word flex-1">
                {project.name}
              </h3>
              <StatusBadge status={project.status} />
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">
              {project.description}
            </p>
            <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-gray-500">Deadline:</span>
                <span
                  className={
                    new Date(project.deadline) < new Date()
                      ? "text-red-600 dark:text-red-500"
                      : ""
                  }
                >
                  {new Date(project.deadline).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-gray-500">Team Members:</span>
                <span>{project.teamMembers?.length || 0}</span>
              </div>
            </div>
            <div className="flex gap-2 pt-3 sm:pt-4 border-t border-gray-100 dark:border-gray-700">
              <button className="flex-1 btn-secondary flex items-center justify-center gap-1 text-xs sm:text-sm py-1.5 sm:py-2 md:cursor-pointer">
                <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                View
              </button>
              {canManage && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(project);
                  }}
                  className="p-1.5 sm:p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/50 rounded-lg transition-colors md:cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              )}
              {canManage && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(project._id);
                  }}
                  className="p-1.5 sm:p-2 text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/50 rounded-lg transition-colors md:cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              )}
            </div>
          </Link>
        ))}
      </div>

      {data?.projects?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No projects found</p>
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingProject(null);
        }}
        title={editingProject ? "Edit Project" : "Create Project"}
      >
        <ProjectForm
          initialData={editingProject}
          onSubmit={handleSubmit}
          onCancel={() => {
            setModalOpen(false);
            setEditingProject(null);
          }}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      </Modal>
    </div>
  );
};

export default ProjectsPage;
