import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { updateProfile } from "../api/user";
import { useAuth } from "../hooks/useAuth";
import { profileSchema } from "../utils/validators";

const inputClass =
  "w-full rounded-xl border border-[var(--border)] bg-white/[0.03] px-3 py-2 text-sm outline-none transition focus:border-[var(--primary)]";

export function SettingsPage() {
  const { user, setUser } = useAuth();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: "",
      email: "",
      avatar_url: "",
      current_password: "",
      new_password: ""
    }
  });

  useEffect(() => {
    if (user) {
      reset({
        full_name: user.full_name || "",
        email: user.email || "",
        avatar_url: user.avatar_url || "",
        current_password: "",
        new_password: ""
      });
    }
  }, [user, reset]);

  const onSubmit = async (values) => {
    const payload = {
      full_name: values.full_name,
      email: values.email,
      avatar_url: values.avatar_url || null
    };
    if (values.current_password && values.new_password) {
      payload.current_password = values.current_password;
      payload.new_password = values.new_password;
    }

    try {
      const updated = await updateProfile(payload);
      setUser(updated);
      reset({
        full_name: updated.full_name || "",
        email: updated.email || "",
        avatar_url: updated.avatar_url || "",
        current_password: "",
        new_password: ""
      });
      toast.success("Profile updated");
    } catch (error) {
      toast.error(error.response?.data?.error?.message || "Failed to update profile");
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="heading-font text-3xl font-bold">Settings</h1>
        <p className="text-sm text-[var(--text-muted)]">Manage profile information and password.</p>
      </div>

      <form className="glass rounded-2xl p-5 space-y-4 max-w-2xl" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="mb-1 block text-sm text-[var(--text-muted)]">Full name</label>
          <input className={inputClass} {...register("full_name")} />
          {errors.full_name ? <p className="mt-1 text-xs text-red-400">{errors.full_name.message}</p> : null}
        </div>
        <div>
          <label className="mb-1 block text-sm text-[var(--text-muted)]">Email</label>
          <input type="email" className={inputClass} {...register("email")} />
          {errors.email ? <p className="mt-1 text-xs text-red-400">{errors.email.message}</p> : null}
        </div>
        <div>
          <label className="mb-1 block text-sm text-[var(--text-muted)]">Avatar URL</label>
          <input className={inputClass} {...register("avatar_url")} />
          {errors.avatar_url ? <p className="mt-1 text-xs text-red-400">{errors.avatar_url.message}</p> : null}
        </div>

        <hr className="border-[var(--border)]" />

        <h2 className="heading-font text-xl">Change Password</h2>
        <div>
          <label className="mb-1 block text-sm text-[var(--text-muted)]">Current password</label>
          <input type="password" className={inputClass} {...register("current_password")} />
          {errors.current_password ? (
            <p className="mt-1 text-xs text-red-400">{errors.current_password.message}</p>
          ) : null}
        </div>
        <div>
          <label className="mb-1 block text-sm text-[var(--text-muted)]">New password</label>
          <input type="password" className={inputClass} {...register("new_password")} />
          {errors.new_password ? (
            <p className="mt-1 text-xs text-red-400">{errors.new_password.message}</p>
          ) : null}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-xl bg-[var(--primary)] px-4 py-2 text-sm text-white disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
