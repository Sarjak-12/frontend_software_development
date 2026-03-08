import { motion } from "framer-motion";

export function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="glass w-full max-w-md rounded-3xl p-8 shadow-glass"
      >
        <h1 className="heading-font text-3xl font-bold text-[var(--text)]">{title}</h1>
        <p className="mt-2 text-sm text-[var(--text-muted)]">{subtitle}</p>
        <div className="mt-8">{children}</div>
      </motion.div>
    </div>
  );
}
