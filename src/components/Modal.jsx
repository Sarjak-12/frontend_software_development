import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

export function Modal({ open, title, onClose, children }) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/45 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={(event) => event.stopPropagation()}
            className="glass w-full max-w-xl rounded-2xl p-6 shadow-lift"
          >
            <div className="flex items-center justify-between">
              <h3 className="heading-font text-xl font-semibold">{title}</h3>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-white/10"
              >
                <X size={18} />
              </button>
            </div>
            <div className="mt-5">{children}</div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
