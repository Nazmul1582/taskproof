import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { authService } from "../services/api";
import { useAuthStore } from "../store/authStore";
import { LogIn, Mail, Lock } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const LoginPage = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await authService.login(data);
      const { user, token } = response.data.data;
      setAuth(user, token);
      toast.success("Login successful!");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (role) => {
    setIsLoading(true);
    try {
      const response = await authService.demoLogin(role);
      const { user, token } = response.data.data;
      setAuth(user, token);
      toast.success(`Logged in as ${role.replace("_", " ")}`);
      navigate("/dashboard");
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      toast.error("Demo login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
      {/* Background layer - behind glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-gray-100 dark:from-[#0e2342] dark:to-[#0b1b33] -z-20" />
      {/* Background glow effects - top right & bottom left */}
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden -z-10"
        aria-hidden="true"
      >
        <div className="absolute -top-20 -right-20 sm:-top-30 sm:-right-30 md:-top-40 md:-right-40 w-[260px] h-[260px] sm:w-[400px] sm:h-[400px] md:w-[600px] md:h-[600px] bg-emerald-400/15 dark:bg-emerald-400/30 rounded-full blur-3xl animate-glow-slow" />
        <div className="absolute -bottom-20 -left-20 sm:-bottom-30 sm:-left-30 md:-bottom-40 md:-left-40 w-[260px] h-[260px] sm:w-[400px] sm:h-[400px] md:w-[600px] md:h-[600px] bg-emerald-400/15 dark:bg-emerald-400/30 rounded-full blur-3xl animate-glow-slower" />
      </div>
      <div className="relative max-w-md w-full bg-white/90 dark:bg-white/5 backdrop-blur-sm rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-600 dark:text-primary-500">
            TaskProof
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Project & Task Collaboration System
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                {...register("email")}
                type="email"
                className="input pl-10"
                placeholder="you@example.com"
              />
            </div>
            {errors.email && (
              <p className="text-red-500 dark:text-red-400 text-sm mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                {...register("password")}
                type="password"
                className="input pl-10"
                placeholder="••••••"
              />
            </div>
            {errors.password && (
              <p className="text-red-500 dark:text-red-400 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-primary flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-white rounded">
                Demo Login
              </span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <button
              onClick={() => handleDemoLogin("team_member")}
              className="btn-info text-sm md:cursor-pointer"
            >
              Member
            </button>
            <button
              onClick={() => handleDemoLogin("project_manager")}
              className="btn-info text-sm md:cursor-pointer"
            >
              PM
            </button>
            <button
              onClick={() => handleDemoLogin("admin")}
              className="btn-info text-sm md:cursor-pointer"
            >
              Admin
            </button>
          </div>
        </div>

        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="text-primary-600 dark:text-primary-400 underline underline-offset-4"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
