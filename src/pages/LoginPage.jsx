import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { AuthLayout } from "../components/AuthLayout";
import { loginSchema } from "../utils/validators";
import { useAuth } from "../hooks/useAuth";

const inputClass =
  "w-full rounded-xl border border-[var(--border)] bg-white/[0.03] px-3 py-2 text-sm outline-none transition focus:border-[var(--primary)]";

export function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" }
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (values) => {
    try {
      await login(values);
      toast.success("Welcome back");
      const fromPath = location.state?.from?.pathname || "/dashboard";
      navigate(fromPath, { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.error?.message || "Login failed");
    }
  };

  return (
    <AuthLayout title="Welcome Back" subtitle="Sign in to continue planning with focus.">
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="mb-1 block text-sm text-[var(--text-muted)]" htmlFor="email">
            Email
          </label>
          <input id="email" type="email" className={inputClass} {...register("email")} />
          {errors.email ? <p className="mt-1 text-xs text-red-400">{errors.email.message}</p> : null}
        </div>
        <div>
          <label className="mb-1 block text-sm text-[var(--text-muted)]" htmlFor="password">
            Password
          </label>
          <input id="password" type="password" className={inputClass} {...register("password")} />
          {errors.password ? (
            <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-xl bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
        >
          {isSubmitting ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-[var(--text-muted)]">
        No account?{" "}
        <Link className="text-[var(--accent)] hover:underline" to="/signup">
          Create one
        </Link>
      </p>
    </AuthLayout>
  );
}
