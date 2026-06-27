const styles = {
  active:
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  completed:
    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  on_hold:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
};

const StatusBadge = ({ status }) => {
  return (
    <span
      className={`px-2 py-0.5 sm:px-2 sm:py-1 rounded-full text-xs font-medium ${styles[status] || ""}`}
    >
      {status?.replace("_", " ")?.toUpperCase()}
    </span>
  );
};

export default StatusBadge;
