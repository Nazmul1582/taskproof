import { useQuery } from "@tanstack/react-query";
import { dashboardService, activityService } from "../services/api";
import {
  FolderKanban,
  CheckSquare,
  Clock,
  AlertCircle,
  TrendingUp,
  Calendar,
  Users,
} from "lucide-react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import LoadingSpinner from "../components/common/LoadingSpinner";
import KPICard from "../components/common/KPICard";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 text-sm text-gray-900 dark:text-gray-100 shadow-lg">
        <p className="font-medium">{label}</p>
        {payload.map((entry) => (
          <p key={entry.name} style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const Dashboard = () => {
  const { data: kpis, isLoading: kpisLoading } = useQuery({
    queryKey: ["dashboard-kpis"],
    queryFn: () => dashboardService.getKPIs().then((res) => res.data.data),
  });

  const { data: charts, isLoading: chartsLoading } = useQuery({
    queryKey: ["dashboard-charts"],
    queryFn: () => dashboardService.getCharts().then((res) => res.data.data),
  });

  const { data: workload } = useQuery({
    queryKey: ["dashboard-workload"],
    queryFn: () => dashboardService.getWorkload().then((res) => res.data.data),
  });

  const { data: upcoming } = useQuery({
    queryKey: ["dashboard-upcoming"],
    queryFn: () => dashboardService.getUpcoming().then((res) => res.data.data),
  });

  const { data: activities } = useQuery({
    queryKey: ["activities"],
    queryFn: () =>
      activityService.getActivities({ limit: 5 }).then((res) => res.data.data),
  });

  if (kpisLoading || chartsLoading) {
    return <LoadingSpinner />;
  }

  const STATUS_COLORS = {
    todo: "#0088fe",
    in_progress: "#8b5cf6",
    completed: "#00b883",
  };

  const priorityData =
    charts?.tasksByPriority?.map((item) => ({
      name: item._id,
      value: item.count,
    })) || [];

  const statusData =
    charts?.tasksByStatus?.map((item) => ({
      name:
        item._id === "todo"
          ? "To Do"
          : item._id === "in_progress"
            ? "In Progress"
            : "Completed",
      value: item.count,
      id: item._id,
    })) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Welcome back! Here's your project overview.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard
          title="Total Projects"
          value={kpis?.totalProjects}
          icon={FolderKanban}
          color="blue"
        />
        <KPICard
          title="Total Tasks"
          value={kpis?.totalTasks}
          icon={CheckSquare}
          color="green"
        />
        <KPICard
          title="Completed"
          value={kpis?.completedTasks}
          icon={TrendingUp}
          color="emerald"
        />
        <KPICard
          title="Pending"
          value={kpis?.pendingTasks}
          icon={Clock}
          color="yellow"
        />
        <KPICard
          title="Overdue"
          value={kpis?.overdueTasks}
          icon={AlertCircle}
          color="red"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold mb-4">Tasks by Priority</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00b883" />
                    <stop offset="100%" stopColor="#009970" />
                  </linearGradient>
                </defs>
                <Tooltip
                  cursor={{ fill: "rgba(0, 152, 112, 0.15)" }}
                  content={<CustomTooltip />}
                />
                <Legend />
                <Bar dataKey="value" fill="url(#barGradient)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold mb-4">
            Task Status Distribution
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({
                    cx,
                    cy,
                    midAngle,
                    innerRadius,
                    outerRadius,
                    percent,
                  }) => {
                    const RADIAN = Math.PI / 180;
                    const radius =
                      innerRadius + (outerRadius - innerRadius) * 0.5;
                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                    const y = cy + radius * Math.sin(-midAngle * RADIAN);
                    return (
                      <text
                        x={x}
                        y={y}
                        fill="#fff"
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize={14}
                        fontWeight={600}
                      >
                        {`${(percent * 100).toFixed(0)}%`}
                      </text>
                    );
                  }}
                  outerRadius={110}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry) => (
                    <Cell
                      key={entry.id}
                      fill={STATUS_COLORS[entry.id] || "#8884d8"}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Member Workload */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Users className="w-5 h-5" />
          Team Workload Summary
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-300 dark:border-gray-700">
                <th className="text-left px-2 py-3">Member</th>
                <th className="text-center px-2 py-3">Total Tasks</th>
                <th className="text-center px-2 py-3">Completed</th>
                <th className="text-center px-2 py-3">Pending</th>
                <th className="text-center px-2 py-3">Completion Rate</th>
              </tr>
            </thead>
            <tbody>
              {workload?.memberWorkload?.map((member) => (
                <tr
                  key={member.memberId}
                  className="border-b border-gray-300 dark:border-gray-700"
                >
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                        <span className="text-sm font-medium">
                          {member.memberName?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{member.memberName}</p>
                        <p className="text-xs text-gray-500 capitalize">
                          {member.role?.replace("_", " ")}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="text-center py-3">{member.total}</td>
                  <td className="text-center py-3 text-green-600">
                    {member.completed}
                  </td>
                  <td className="text-center py-3 text-yellow-600">
                    {member.pending}
                  </td>
                  <td className="text-center py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{
                            width: `${member.total > 0 ? (member.completed / member.total) * 100 : 0}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm">
                        {member.total > 0
                          ? Math.round((member.completed / member.total) * 100)
                          : 0}
                        %
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {workload?.memberWorkload?.length === 0 && (
            <p className="text-center text-gray-500 py-8">
              No team members found
            </p>
          )}
        </div>
      </div>

      {/* Recent Activities & Upcoming Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Recent Activities
          </h2>
          <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700">
            {activities?.activities?.slice(0, 5).map((activity) => (
              <div
                key={activity._id}
                className="flex items-start gap-3 text-sm p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
              >
                <div className="w-2 h-2 mt-2 rounded-full bg-primary-500"></div>
                <div className="flex-1">
                  <p className="text-gray-700 dark:text-gray-300">
                    {activity.action}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(activity.createdAt).toLocaleTimeString()} -{" "}
                    {new Date(activity.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
            {activities?.activities?.length === 0 && (
              <p className="text-center text-gray-500 py-8">
                No recent activities
              </p>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Upcoming Deadlines
          </h2>
          <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700">
            {upcoming?.upcomingDeadlines?.map((task) => (
              <div
                key={task._id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-medium">{task.title}</p>
                  <p className="text-xs text-gray-500">
                    {task.projectId?.name}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-orange-600 dark:text-orange-400">
                    Due: {new Date(task.dueDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
            {upcoming?.highPriorityTasks?.length > 0 && (
              <div className="space-y-3 ">
                <h3 className="mt-4 text-sm font-semibold text-red-600 mb-2">
                  High Priority Tasks
                </h3>
                {upcoming.highPriorityTasks.map((task) => (
                  <div
                    key={task._id}
                    className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{task.title}</p>
                      <p className="text-xs text-gray-500">
                        {task.projectId?.name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-red-600">
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {upcoming?.upcomingDeadlines?.length === 0 && (
              <p className="text-center text-gray-500 py-8">
                No upcoming deadlines
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
