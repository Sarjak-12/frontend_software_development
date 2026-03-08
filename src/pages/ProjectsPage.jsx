import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { Modal } from "../components/Modal";
import { EmptyState } from "../components/EmptyState";
import { projectSchema } from "../utils/validators";
import { useProjects } from "../hooks/useProjects";

const inputClass =
  "w-full rounded-xl border border-[var(--border)] bg-white/[0.03] px-3 py-2 text-sm outline-none transition focus:border-[var(--primary)]";

export function ProjectsPage() {
  const { projects, loading, loadProjects, createProject, updateProject, removeProject } = useProjects();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: { title: "", color: "#6366f1", icon: "folder" }
  });

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const openCreateModal = () => {
    setEditingProject(null);
    reset({ title: "", color: "#6366f1", icon: "folder" });
    setModalOpen(true);
  };

  const openEditModal = (project) => {
    setEditingProject(project);
    reset({ title: project.title || "", color: project.color || "#6366f1", icon: project.icon || "folder" });
    setModalOpen(true);
  };

  const onSubmit = async (values) => {
    try {
      if (editingProject) {
        await updateProject(editingProject.id, values);
        toast.success("Project updated");
      } else {
        await createProject(values);
        toast.success("Project created");
      }
      setModalOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.error?.message || "Failed to save project");
    }
  };

  const onDelete = async (project) => {
    try {
      await removeProject(project.id);
      toast.success("Project deleted");
    } catch (error) {
      toast.error(error.response?.data?.error?.message || "Failed to delete project");
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="heading-font text-3xl font-bold">Projects</h1>
          <p className="text-sm text-[var(--text-muted)]">Organize tasks into focused project spaces.</p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="rounded-xl bg-[var(--primary)] px-4 py-2 text-sm text-white"
        >
          <Plus size={16} className="inline-block mr-1" />
          New Project
        </button>
      </div>

      {loading ? <p className="text-sm text-[var(--text-muted)]">Loading projects...</p> : null}
      {!loading && projects.length === 0 ? (
        <EmptyState
          title="No projects yet"
          description="Create your first project board to group related tasks."
          action={
            <button
              type="button"
              onClick={openCreateModal}
              className="rounded-xl bg-[var(--primary)] px-4 py-2 text-sm text-white"
            >
              Create project
            </button>
          }
        />
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {projects.map((project) => (
          <article key={project.id} className="glass rounded-2xl p-5 shadow-glass">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="mb-3 h-3 w-12 rounded-full" style={{ backgroundColor: project.color || "#6366f1" }} />
                <h3 className="heading-font text-xl">{project.title}</h3>
                <p className="mt-1 text-sm text-[var(--text-muted)]">{project.task_count || 0} tasks</p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => openEditModal(project)}
                  className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-white/10"
                >
                  <Pencil size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(project)}
                  className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-white/10"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingProject ? "Edit project" : "New project"}
      >
        <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <input className={inputClass} placeholder="Project title" {...register("title")} />
            {errors.title ? <p className="mt-1 text-xs text-red-400">{errors.title.message}</p> : null}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <input type="color" className={`${inputClass} h-11`} {...register("color")} />
            <input className={inputClass} placeholder="Icon name (optional)" {...register("icon")} />
          </div>
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
