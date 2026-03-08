import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Valid email required"),
  password: z.string().min(1, "Password is required")
});

export const registerSchema = z
  .object({
    full_name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Valid email required"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password needs an uppercase letter")
      .regex(/\d/, "Password needs a number"),
    confirm_password: z.string().min(1, "Confirm your password")
  })
  .refine((data) => data.password === data.confirm_password, {
    path: ["confirm_password"],
    message: "Passwords do not match"
  });

export const taskSchema = z.object({
  title: z.string().min(1, "Task title is required"),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  status: z.enum(["todo", "in_progress", "done"]).default("todo"),
  due_date: z.string().optional(),
  tags: z.array(z.string()).optional()
});

export const projectSchema = z.object({
  title: z.string().min(1, "Project title is required"),
  color: z.string().optional(),
  icon: z.string().optional()
});

export const noteSchema = z.object({
  title: z.string().optional(),
  content: z.string().optional()
});

export const profileSchema = z
  .object({
    full_name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Valid email required"),
    avatar_url: z.string().url("Must be a valid URL").or(z.literal("")).optional(),
    current_password: z.string().optional(),
    new_password: z
      .string()
      .regex(/[A-Z]/, "Password needs an uppercase letter")
      .regex(/\d/, "Password needs a number")
      .min(8, "Password must be at least 8 characters")
      .optional()
      .or(z.literal(""))
  })
  .refine(
    (data) => {
      const hasCurrent = Boolean(data.current_password);
      const hasNew = Boolean(data.new_password);
      return (hasCurrent && hasNew) || (!hasCurrent && !hasNew);
    },
    {
      path: ["new_password"],
      message: "Provide both current and new password"
    }
  );
