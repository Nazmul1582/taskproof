const KPICard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-500 dark:text-gray-400 text-sm">{title}</p>
        <p className="text-3xl font-bold mt-2">{value || 0}</p>
      </div>
      <div
        className={`p-3 rounded-full bg-${color}-100 dark:bg-${color}-900/30`}
      >
        <Icon className={`w-6 h-6 text-${color}-600`} />
      </div>
    </div>
  </div>
);

export default KPICard;
