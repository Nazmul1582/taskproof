import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { userService } from "../../services/api";
import { UserPlus, Search, X } from "lucide-react";
import Modal from "../common/Modal";

const AddMemberModal = ({
  isOpen,
  onClose,
  projectId,
  currentMembers,
  onAdd,
  isLoading,
}) => {
  const [search, setSearch] = useState("");

  const { data, isLoading: usersLoading } = useQuery({
    queryKey: ["users", search],
    queryFn: () =>
      userService.getUsers({ params: { search } }).then((res) => res.data.data),
    enabled: isOpen,
  });

  const availableUsers =
    data?.users?.filter(
      (user) => !currentMembers.some((member) => member._id === user._id),
    ) || [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Team Member">
      <div className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-9"
          />
        </div>

        {/* Users List */}
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {usersLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
            </div>
          ) : availableUsers.length > 0 ? (
            availableUsers.map((user) => (
              <div
                key={user._id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                      {user.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{user.name}</p>
                    <p className="text-xs text-gray-500 truncate">
                      {user.email}
                    </p>
                    <p className="text-xs text-gray-400 capitalize mt-0.5">
                      {user.role?.replace("_", " ")}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onAdd(user._id)}
                  disabled={isLoading}
                  className="btn-secondary text-sm py-1.5 px-3 flex items-center gap-1 whitespace-nowrap ml-2 md:cursor-pointer"
                >
                  <UserPlus className="w-3 h-3" />
                  Add
                </button>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              {search ? (
                <>
                  <p className="text-gray-500 text-sm">
                    No users found matching "{search}"
                  </p>
                  <button
                    onClick={() => setSearch("")}
                    className="text-primary-600 text-sm mt-2 hover:underline md:cursor-pointer"
                  >
                    Clear search
                  </button>
                </>
              ) : (
                <p className="text-gray-500 text-sm">
                  No users available to add
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default AddMemberModal;
