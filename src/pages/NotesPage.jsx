import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Search } from "lucide-react";
import toast from "react-hot-toast";
import { Modal } from "../components/Modal";
import { NoteCard } from "../components/NoteCard";
import { EmptyState } from "../components/EmptyState";
import { useDebounce } from "../hooks/useDebounce";
import { useNotes } from "../hooks/useNotes";
import { noteSchema } from "../utils/validators";

const inputClass =
  "w-full rounded-xl border border-[var(--border)] bg-white/[0.03] px-3 py-2 text-sm outline-none transition focus:border-[var(--primary)]";

export function NotesPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const debouncedQuery = useDebounce(query, 300);

  const { notes, meta, loading, loadNotes, createNote, updateNote, removeNote, togglePin } = useNotes();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(noteSchema),
    defaultValues: { title: "", content: "" }
  });

  useEffect(() => {
    loadNotes({ page, limit: 24, q: debouncedQuery || undefined });
  }, [debouncedQuery, page, loadNotes]);

  useEffect(() => {
    const onKeyDown = (event) => {
      const isInput = ["INPUT", "TEXTAREA", "SELECT"].includes(event.target?.tagName);
      if (event.key.toLowerCase() === "n" && !isInput) {
        event.preventDefault();
        setEditingNote(null);
        reset({ title: "", content: "" });
        setModalOpen(true);
      }
      if (event.key === "Escape") setModalOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [reset]);

  const openCreate = () => {
    setEditingNote(null);
    reset({ title: "", content: "" });
    setModalOpen(true);
  };

  const openEdit = (note) => {
    setEditingNote(note);
    reset({ title: note.title || "", content: note.content || "" });
    setModalOpen(true);
  };

  const onSubmit = async (values) => {
    try {
      if (editingNote) {
        await updateNote(editingNote.id, values);
        toast.success("Note updated");
      } else {
        await createNote(values);
        toast.success("Note created");
      }
      setModalOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.error?.message || "Failed to save note");
    }
  };

  const onDelete = async (note) => {
    try {
      await removeNote(note.id);
      toast.success("Note deleted");
    } catch (error) {
      toast.error(error.response?.data?.error?.message || "Failed to delete note");
    }
  };

  const onTogglePin = async (note) => {
    try {
      await togglePin(note.id, !note.pinned, true);
    } catch (error) {
      toast.error(error.response?.data?.error?.message || "Failed to pin note");
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="heading-font text-3xl font-bold">Notes</h1>
          <p className="text-sm text-[var(--text-muted)]">Capture thoughts and pin important snippets.</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="rounded-xl bg-[var(--primary)] px-4 py-2 text-sm text-white"
        >
          <Plus size={16} className="inline-block mr-1" />
          New Note
        </button>
      </div>

      <label className="relative block rounded-2xl glass p-3">
        <Search size={16} className="absolute left-6 top-5 text-[var(--text-muted)]" />
        <input
          value={query}
          onChange={(event) => {
            setPage(1);
            setQuery(event.target.value);
          }}
          placeholder="Search notes"
          className="w-full rounded-xl border border-[var(--border)] bg-white/[0.03] pl-9 pr-3 py-2 text-sm outline-none focus:border-[var(--primary)]"
        />
      </label>

      {loading ? <p className="text-sm text-[var(--text-muted)]">Loading notes...</p> : null}
      {!loading && notes.length === 0 ? (
        <EmptyState title="No notes yet" description="Press N or click New Note to create one." />
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {notes.map((note) => (
          <NoteCard key={note.id} note={note} onEdit={openEdit} onDelete={onDelete} onTogglePin={onTogglePin} />
        ))}
      </div>

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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingNote ? "Edit note" : "New note"}>
        <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <input className={inputClass} placeholder="Note title" {...register("title")} />
            {errors.title ? <p className="mt-1 text-xs text-red-400">{errors.title.message}</p> : null}
          </div>
          <textarea rows={8} className={inputClass} placeholder="Write your note..." {...register("content")} />
          {errors.content ? <p className="mt-1 text-xs text-red-400">{errors.content.message}</p> : null}
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
