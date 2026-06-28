const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center min-h-[calc(100dvh-80px)]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  );
};

export default LoadingSpinner;
