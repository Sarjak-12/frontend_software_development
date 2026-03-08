import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { List, Plus, TableProperties, Search } from "lucide-react";
import toast from "react-hot-toast";
import { z } from "zod";
import { KanbanBoard } from "../components/KanbanBoard";
import { TaskCard } from "../components/TaskCard";
import { Modal } from "../components/Modal";
import { EmptyState } from "../components/EmptyState";
import { useDebounce } from "../hooks/useDebounce";
import { useProjects } from "../hooks/useProjects";
import { useTasks } from "../hooks/useTasks";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  status: z.enum(["todo", "in_progress", "done"]).default("todo"),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  due_date: z.string().optional(),
  tags: z.string().optional(),
  project_id: z.string().optional()
});

const inputClass =
  "w-full rounded-xl border border-[var(--border)] bg-white/[0.03] px-3 py-2 text-sm outline-none transition focus:border-[var(--primary)]";

export function TasksPage() {
  const [viewMode, setViewMode] = useState("kanban");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);

  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [projectFilter, setProjectFilter] = useState("");
  const [page, setPage] = useState(1);

  const { projects, loadProjects } = useProjects();
  const { tasks, meta, loading, loadTasks, createTask, updateTask, removeTask, changeStatus } = useTasks();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "todo",
      priority: "medium",
      due_date: "",
      tags: "",
      project_id: ""
    }
  });

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  useEffect(() => {
    loadTasks({
      page,
      limit: 24,
      q: debouncedQuery || undefined,
      status: statusFilter || undefined,
      priority: priorityFilter || undefined,
      project: projectFilter || undefined
    });
  }, [debouncedQuery, statusFilter, priorityFilter, projectFilter, page, loadTasks]);

  useEffect(() => {
    const onKeyDown = (event) => {
      const isInput = ["INPUT", "TEXTAREA", "SELECT"].includes(event.target?.tagName);
      if (event.key.toLowerCase() === "n" && !isInput) {
        event.preventDefault();
        setEditingTask(null);
        reset({
          title: "",
          description: "",
          status: "todo",
          priority: "medium",
          due_date: "",
          tags: "",
          project_id: ""
        });
        setModalOpen(true);
      }
      if (event.key === "Escape") {
        setModalOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [reset]);

  const filteredTaskCount = useMemo(() => tasks.length, [tasks]);

  const openCreateModal = () => {
    setEditingTask(null);
    reset({
      title: "",
      description: "",
      status: "todo",
      priority: "medium",
      due_date: "",
      tags: "",
      project_id: ""
    });
    setModalOpen(true);
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    reset({
      title: task.title || "",
      description: task.description || "",
      status: task.status || "todo",
      priority: task.priority || "medium",
      due_date: task.due_date || "",
      tags: (task.tags || []).join(", "),
      project_id: task.project_id || ""
    });
    setModalOpen(true);
  };

  const onSubmit = async (values) => {
    const payload = {
      ...values,
      due_date: values.due_date || null,
      project_id: values.project_id || null,
      tags: values.tags
        ? values.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean)
        : []
    };

    try {
      if (editingTask) {
        await updateTask(editingTask.id, payload);
        toast.success("Task updated");
      } else {
        await createTask(payload);
        toast.success("Task created");
      }
      setModalOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.error?.message || "Failed to save task");
    }
  };

  const handleDelete = async (task) => {
    try {
      await removeTask(task.id);
      toast.success("Task deleted");
    } catch (error) {
      toast.error(error.response?.data?.error?.message || "Failed to delete task");
    }
  };

  const handleMove = async (taskId, nextStatus, nextPosition) => {
    try {
      await changeStatus(taskId, nextStatus, nextPosition, true);
    } catch (error) {
      toast.error(error.response?.data?.error?.message || "Failed to update task status");
      loadTasks({
        page,
        limit: 24,
        q: debouncedQuery || undefined,
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
        project: projectFilter || undefined
      });
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="heading-font text-3xl font-bold">Tasks</h1>
          <p className="text-sm text-[var(--text-muted)]">{filteredTaskCount} tasks in current view</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setViewMode("kanban")}
            className={`rounded-xl px-3 py-2 text-sm ${viewMode === "kanban" ? "bg-[var(--primary)] text-white" : "glass"}`}
          >
            <TableProperties size={16} className="inline-block mr-1" />
            Kanban
          </button>
          <button
            type="button"
            onClick={() => setViewMode("list")}
            className={`rounded-xl px-3 py-2 text-sm ${viewMode === "list" ? "bg-[var(--primary)] text-white" : "glass"}`}
          >
            <List size={16} className="inline-block mr-1" />
            List
          </button>
          <button
            type="button"
            onClick={openCreateModal}
            className="rounded-xl bg-[var(--primary)] px-4 py-2 text-sm text-white"
          >
            <Plus size={16} className="inline-block mr-1" />
            New Task
          </button>
        </div>
      </div>

      <div className="grid gap-3 rounded-2xl glass p-4 md:grid-cols-5">
        <label className="relative md:col-span-2">
          <Search size={16} className="absolute left-3 top-2.5 text-[var(--text-muted)]" />
          <input
            value={query}
            onChange={(event) => {
              setPage(1);
              setQuery(event.target.value);
            }}
            placeholder="Search tasks"
            className="w-full rounded-xl border border-[var(--border)] bg-white/[0.03] pl-9 pr-3 py-2 text-sm outline-none focus:border-[var(--primary)]"
          />
        </label>
        <select
          value={statusFilter}
          onChange={(event) => {
            setPage(1);
            setStatusFilter(event.target.value);
          }}
          className={inputClass}
        >
          <option value="">All statuses</option>
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
        </select>
        <select
          value={priorityFilter}
          onChange={(event) => {
            setPage(1);
            setPriorityFilter(event.target.value);
          }}
          className={inputClass}
        >
          <option value="">All priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select
          value={projectFilter}
          onChange={(event) => {
            setPage(1);
            setProjectFilter(event.target.value);
          }}
          className={inputClass}
        >
          <option value="">All projects</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.title}
            </option>
          ))}
        </select>
      </div>

      {loading ? <p className="text-sm text-[var(--text-muted)]">Loading tasks...</p> : null}
      {!loading && tasks.length === 0 ? (
        <EmptyState title="No tasks yet" description="Press N or click New Task to create one." />
      ) : null}

      {!loading && tasks.length > 0 && viewMode === "kanban" ? (
        <KanbanBoard tasks={tasks} onMove={handleMove} onEdit={openEditModal} onDelete={handleDelete} />
      ) : null}

      {!loading && tasks.length > 0 && viewMode === "list" ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onEdit={openEditModal} onDelete={handleDelete} />
          ))}
        </div>
      ) : null}

      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          disabled={meta.page <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-sm disabled:opacity-50"
        >
          Prev
        </button>
        <span className="text-sm text-[var(--text-muted)]">
          Page {meta.page} / {meta.pages}
        </span>
        <button
          type="button"
          disabled={meta.page >= meta.pages}
          onClick={() => setPage((p) => Math.min(meta.pages, p + 1))}
          className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-sm disabled:opacity-50"
        >
          Next
        </button>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingTask ? "Edit task" : "New task"}>
        <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <input className={inputClass} placeholder="Task title" {...register("title")} />
            {errors.title ? <p className="mt-1 text-xs text-red-400">{errors.title.message}</p> : null}
          </div>
          <textarea rows={4} className={inputClass} placeholder="Description" {...register("description")} />
          <div className="grid gap-3 sm:grid-cols-2">
            <select className={inputClass} {...register("status")}>
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </select>
            <select className={inputClass} {...register("priority")}>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <input type="date" className={inputClass} {...register("due_date")} />
            <select className={inputClass} {...register("project_id")}>
              <option value="">No project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.title}
                </option>
              ))}
            </select>
          </div>
          <input className={inputClass} placeholder="Tags (comma separated)" {...register("tags")} />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-[var(--primary)] px-4 py-2 text-sm text-white disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
