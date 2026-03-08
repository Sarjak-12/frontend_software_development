import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { AuthLayout } from "../components/AuthLayout";
import { registerSchema } from "../utils/validators";
import { useAuth } from "../hooks/useAuth";

const inputClass =
  "w-full rounded-xl border border-[var(--border)] bg-white/[0.03] px-3 py-2 text-sm outline-none transition focus:border-[var(--primary)]";

export function SignupPage() {
  const { register: registerUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { full_name: "", email: "", password: "", confirm_password: "" }
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (values) => {
    try {
      await registerUser(values);
      toast.success("Account created");
      navigate("/dashboard", { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.error?.message || "Registration failed");
    }
  };

  return (
    <AuthLayout title="Create Account" subtitle="Start organizing tasks, projects, and notes.">
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="mb-1 block text-sm text-[var(--text-muted)]" htmlFor="full_name">
            Full name
          </label>
          <input id="full_name" type="text" className={inputClass} {...register("full_name")} />
          {errors.full_name ? (
            <p className="mt-1 text-xs text-red-400">{errors.full_name.message}</p>
          ) : null}
        </div>
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
        <div>
          <label className="mb-1 block text-sm text-[var(--text-muted)]" htmlFor="confirm_password">
            Confirm password
          </label>
          <input
            id="confirm_password"
            type="password"
            className={inputClass}
            {...register("confirm_password")}
          />
          {errors.confirm_password ? (
            <p className="mt-1 text-xs text-red-400">{errors.confirm_password.message}</p>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-xl bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
        >
          {isSubmitting ? "Creating..." : "Create Account"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-[var(--text-muted)]">
        Already have an account?{" "}
        <Link className="text-[var(--accent)] hover:underline" to="/login">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
