import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { authService } from "../services/api";
import { useAuthStore } from "../store/authStore";
import { UserPlus, Mail, Lock, User } from "lucide-react";

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const SignupPage = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await authService.signup(data);
      const { user, token } = response.data.data;
      setAuth(user, token);
      toast.success("Account created successfully!");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Signup failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
      {/* Background layer - behind glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-gray-100 dark:from-[#0e2342] dark:to-[#0b1b33] -z-20" />
      {/* Background glow effects - top left & bottom right */}
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden -z-10"
        aria-hidden="true"
      >
        <div className="absolute -top-20 -left-20 sm:-top-30 sm:-left-30 md:-top-40 md:-left-40 w-[260px] h-[260px] sm:w-[400px] sm:h-[400px] md:w-[600px] md:h-[600px] bg-emerald-400/15 dark:bg-emerald-400/30 rounded-full blur-3xl animate-glow-slow" />
        <div className="absolute -bottom-20 -right-20 sm:-bottom-30 sm:-right-30 md:-bottom-40 md:-right-40 w-[260px] h-[260px] sm:w-[400px] sm:h-[400px] md:w-[600px] md:h-[600px] bg-emerald-400/15 dark:bg-emerald-400/30 rounded-full blur-3xl animate-glow-slower" />
      </div>
      <div className="relative max-w-md w-full bg-white/90 dark:bg-white/5 backdrop-blur-sm rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-600 dark:text-primary-500">
            TaskProof
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Create your account
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                {...register("name")}
                type="text"
                className="input pl-10"
                placeholder="John Doe"
              />
            </div>
            {errors.name && (
              <p className="text-red-500 dark:text-red-400 text-sm mt-1">
                {errors.name.message}
              </p>
            )}
          </div>

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
            <UserPlus className="w-4 h-4" />
            {isLoading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-primary-600 dark:text-primary-400 underline underline-offset-4"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
