import { Link } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="text-center max-w-md">
        {/* 404 Animation */}
        <div className="mb-8">
          <div className="text-8xl sm:text-9xl font-bold text-primary-600 mb-4">
            404
          </div>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 dark:bg-gray-900 text-gray-500">
                Page not found
              </span>
            </div>
          </div>
        </div>

        {/* Message */}
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Oops! Page not found
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          The page you are looking for might have been removed, had its name
          changed, or is temporarily unavailable.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => window.history.back()}
            className="btn-secondary flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
          <Link
            to="/dashboard"
            className="btn-primary flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
