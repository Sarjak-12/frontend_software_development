import { motion } from "framer-motion";
import { CalendarDays, Pencil, Trash2 } from "lucide-react";
import { formatDate, isOverdue } from "../utils/date";

const priorityStyles = {
  high: "bg-red-500/20 text-red-300 border-red-500/30",
  medium: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  low: "bg-blue-500/20 text-blue-300 border-blue-500/30"
};

export function TaskCard({ task, onEdit, onDelete }) {
  const overdue = isOverdue(task.due_date, task.status);

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={`glass rounded-xl p-4 shadow-glass transition ${
        overdue ? "border border-red-500/50 bg-red-500/10" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-semibold leading-snug">{task.title}</h4>
        <span
          className={`rounded-full border px-2 py-1 text-xs font-medium ${
            priorityStyles[task.priority] || priorityStyles.medium
          }`}
        >
          {task.priority}
        </span>
      </div>

      {task.description ? (
        <p className="mt-2 line-clamp-2 text-sm text-[var(--text-muted)]">{task.description}</p>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-2">
        {(task.tags || []).map((tag) => (
          <span key={tag} className="rounded-full bg-white/10 px-2 py-1 text-xs text-[var(--text-muted)]">
            #{tag}
          </span>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
          <CalendarDays size={14} />
          <span>{task.due_date ? formatDate(task.due_date, "MMM d") : "No due date"}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onEdit?.(task)}
            className="rounded-md p-1.5 text-[var(--text-muted)] hover:bg-white/10"
          >
            <Pencil size={14} />
          </button>
          <button
            type="button"
            onClick={() => onDelete?.(task)}
            className="rounded-md p-1.5 text-[var(--text-muted)] hover:bg-white/10"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
