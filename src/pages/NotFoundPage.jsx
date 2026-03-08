import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass rounded-2xl p-8 text-center">
        <h1 className="heading-font text-3xl">Page Not Found</h1>
        <p className="mt-2 text-sm text-[var(--text-muted)]">The route you requested does not exist.</p>
        <Link to="/dashboard" className="mt-4 inline-block rounded-xl bg-[var(--primary)] px-4 py-2 text-sm text-white">
          Go to dashboard
        </Link>
      </div>
    </div>
  );
}
