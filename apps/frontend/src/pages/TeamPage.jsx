// apps/frontend/src/pages/TeamPage.jsx
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "../services/api";
import {
  Users,
  CheckCircle,
  Clock,
  TrendingUp,
  Search,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import LoadingSpinner from "../components/common/LoadingSpinner";

const TeamPage = () => {
  const [search, setSearch] = useState("");
  const [expandedMember, setExpandedMember] = useState(null);

  const { data: workload, isLoading } = useQuery({
    queryKey: ["team-workload"],
    queryFn: () => dashboardService.getWorkload().then((res) => res.data.data),
  });

  const filteredMembers =
    workload?.memberWorkload?.filter(
      (member) =>
        member.memberName?.toLowerCase().includes(search.toLowerCase()) ||
        member.email?.toLowerCase().includes(search.toLowerCase()) ||
        member.role?.toLowerCase().includes(search.toLowerCase()),
    ) || [];

  if (isLoading) return <LoadingSpinner />;

  // Calculate team statistics
  const teamStats = {
    totalMembers: filteredMembers.length,
    totalTasks: filteredMembers.reduce((sum, m) => sum + m.total, 0),
    totalCompleted: filteredMembers.reduce((sum, m) => sum + m.completed, 0),
    avgCompletionRate:
      filteredMembers.length > 0
        ? Math.round(
            filteredMembers.reduce(
              (sum, m) =>
                sum + (m.total > 0 ? (m.completed / m.total) * 100 : 0),
              0,
            ) / filteredMembers.length,
          )
        : 0,
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold">Team Members</h1>
        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-1">
          View team workload and performance
        </p>
      </div>

      {/* Team Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs sm:text-sm">Total Members</p>
              <p className="text-xl sm:text-2xl font-bold mt-1">
                {teamStats.totalMembers}
              </p>
            </div>
            <Users className="w-6 h-6 sm:w-8 sm:h-8 text-primary-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs sm:text-sm">Total Tasks</p>
              <p className="text-xl sm:text-2xl font-bold mt-1">
                {teamStats.totalTasks}
              </p>
            </div>
            <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs sm:text-sm">Completed</p>
              <p className="text-xl sm:text-2xl font-bold mt-1 text-green-600">
                {teamStats.totalCompleted}
              </p>
            </div>
            <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs sm:text-sm">Avg Completion</p>
              <p className="text-xl sm:text-2xl font-bold mt-1">
                {teamStats.avgCompletionRate}%
              </p>
            </div>
            <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-primary-500" />
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search members by name, email, or role..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input pl-9 text-sm sm:text-base"
        />
      </div>

      {/* Members List */}
      <div className="space-y-3 sm:space-y-4">
        {filteredMembers.length > 0 ? (
          filteredMembers.map((member) => (
            <div
              key={member.memberId}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              {/* Member Header - Always Visible */}
              <div
                className="p-4 sm:p-5 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                onClick={() =>
                  setExpandedMember(
                    expandedMember === member.memberId ? null : member.memberId,
                  )
                }
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center flex-shrink-0">
                      <span className="text-lg sm:text-xl font-medium text-primary-600 dark:text-primary-400">
                        {member.memberName?.charAt(0).toUpperCase()}
                      </span>
                    </div>

                    {/* Member Info */}
                    <div>
                      <h2 className="text-base sm:text-lg font-semibold">
                        {member.memberName}
                      </h2>
                      <p className="text-xs sm:text-sm text-gray-500">
                        {member.email}
                      </p>
                      <span
                        className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                          member.role === "admin"
                            ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                            : member.role === "project_manager"
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                              : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {member.role?.replace("_", " ").toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Stats Summary */}
                  <div className="flex items-center gap-4 sm:gap-6">
                    <div className="text-center">
                      <p className="text-gray-500 text-xs">Total</p>
                      <p className="text-lg sm:text-xl font-bold">
                        {member.total}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-500 text-xs">Done</p>
                      <p className="text-lg sm:text-xl font-bold text-green-600">
                        {member.completed}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-500 text-xs">Pending</p>
                      <p className="text-lg sm:text-xl font-bold text-yellow-600">
                        {member.pending}
                      </p>
                    </div>
                    <div className="hidden sm:block">
                      {expandedMember === member.memberId ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded Content - Progress Bar */}
              {expandedMember === member.memberId && (
                <div className="p-4 sm:p-5 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 dark:text-gray-400">
                        Completion Progress
                      </span>
                      <span className="font-medium">
                        {member.total > 0
                          ? Math.round((member.completed / member.total) * 100)
                          : 0}
                        %
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div
                        className="bg-green-600 h-3 rounded-full transition-all duration-500"
                        style={{
                          width: `${member.total > 0 ? (member.completed / member.total) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div>
                      <p className="text-gray-500 text-xs mb-1">
                        Role Description
                      </p>
                      <p className="text-sm">
                        {member.role === "admin"
                          ? "Full system access and user management"
                          : member.role === "project_manager"
                            ? "Can create and manage projects, assign tasks"
                            : "Can update assigned tasks only"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs mb-1">Member Since</p>
                      <p className="text-sm">N/A</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="text-gray-500">No team members found</p>
            {search && (
              <button
                onClick={() => setSearch("")}
                className="mt-2 text-primary-600 text-sm hover:underline"
              >
                Clear search
              </button>
            )}
          </div>
        )}
      </div>

      {/* Team Insights */}
      {filteredMembers.length > 0 && (
        <div className="bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 rounded-lg p-4 sm:p-6">
          <h3 className="text-sm sm:text-base font-semibold mb-3">
            Team Insights
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-600 dark:text-gray-400">
                🏆 Top Performer
              </p>
              <p className="font-medium mt-1">
                {
                  filteredMembers.reduce((best, current) =>
                    current.completed / current.total >
                    best.completed / best.total
                      ? current
                      : best,
                  ).memberName
                }
              </p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400">📊 Most Active</p>
              <p className="font-medium mt-1">
                {
                  filteredMembers.reduce((most, current) =>
                    current.total > most.total ? current : most,
                  ).memberName
                }{" "}
                (
                {
                  filteredMembers.reduce((most, current) =>
                    current.total > most.total ? current : most,
                  ).total
                }{" "}
                tasks)
              </p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400">
                ✅ Needs Support
              </p>
              <p className="font-medium mt-1">
                {
                  filteredMembers.reduce((least, current) =>
                    current.completed / current.total <
                    least.completed / least.total
                      ? current
                      : least,
                  ).memberName
                }
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamPage;
