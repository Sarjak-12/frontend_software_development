import { motion } from "framer-motion";
import { Pin, PinOff, Trash2 } from "lucide-react";

export function NoteCard({ note, onEdit, onDelete, onTogglePin }) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="glass rounded-2xl p-4 shadow-glass transition hover:shadow-lift"
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-semibold">{note.title || "Untitled note"}</h4>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onTogglePin?.(note)}
            className="rounded-md p-1.5 text-[var(--text-muted)] hover:bg-white/10"
          >
            {note.pinned ? <Pin size={14} /> : <PinOff size={14} />}
          </button>
          <button
            type="button"
            onClick={() => onDelete?.(note)}
            className="rounded-md p-1.5 text-[var(--text-muted)] hover:bg-white/10"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      <button type="button" onClick={() => onEdit?.(note)} className="mt-2 w-full text-left">
        <p className="whitespace-pre-wrap text-sm text-[var(--text-muted)]">
          {note.content || "No content yet"}
        </p>
      </button>
    </motion.div>
  );
}
