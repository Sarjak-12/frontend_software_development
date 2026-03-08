import { motion } from "framer-motion";

export function StatCard({ label, value, hint, icon: Icon }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-5 shadow-glass"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--text-muted)]">{label}</p>
        {Icon ? <Icon size={18} className="text-[var(--primary)]" /> : null}
      </div>
      <p className="mt-2 heading-font text-3xl font-bold">{value}</p>
      {hint ? <p className="mt-1 text-xs text-[var(--text-muted)]">{hint}</p> : null}
    </motion.div>
  );
}
