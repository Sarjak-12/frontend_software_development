import { useState } from "react";
import { CalendarDays, CheckSquare, FolderKanban, Home, LogOut, Menu, Moon, Notebook, Settings, Sun, X } from "lucide-react";
import { NavLink } from "react-router-dom";
import clsx from "clsx";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../context/ThemeContext";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: Home },
  { to: "/tasks", label: "Tasks", icon: CheckSquare },
  { to: "/projects", label: "Projects", icon: FolderKanban },
  { to: "/calendar", label: "Calendar", icon: CalendarDays },
  { to: "/notes", label: "Notes", icon: Notebook },
  { to: "/settings", label: "Settings", icon: Settings }
];

function NavLinkItem({ to, label, icon: Icon, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        clsx(
          "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition",
          isActive ? "bg-[var(--primary)] text-white" : "text-[var(--text-muted)] hover:bg-white/10"
        )
      }
    >
      <Icon size={17} />
      <span>{label}</span>
    </NavLink>
  );
}

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  return (
    <>
      <button
        type="button"
        className="fixed left-4 top-4 z-50 rounded-xl glass p-2 lg:hidden"
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <X size={18} /> : <Menu size={18} />}
      </button>

      <aside
        className={clsx(
          "fixed inset-y-0 left-0 z-40 w-72 border-r border-[var(--border)] glass px-4 py-6 transition-transform lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="mb-8 flex items-center justify-between px-2">
          <div>
            <p className="heading-font text-2xl font-bold">Planner</p>
            <p className="text-xs text-[var(--text-muted)]">Focus + flow</p>
          </div>
          <button type="button" onClick={toggleTheme} className="rounded-lg p-2 hover:bg-white/10">
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>

        <nav className="space-y-2">
          {links.map((link) => (
            <NavLinkItem key={link.to} {...link} onClick={() => setOpen(false)} />
          ))}
        </nav>

        <div className="mt-8 rounded-xl border border-[var(--border)] bg-white/[0.02] p-3">
          <p className="text-sm font-medium">{user?.full_name}</p>
          <p className="text-xs text-[var(--text-muted)]">{user?.email}</p>
          <button
            type="button"
            onClick={logout}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-sm hover:bg-white/10"
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>
      </aside>

      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-[var(--border)] glass px-3 py-2 lg:hidden">
        <div className="mx-auto flex max-w-md items-center justify-between">
          {links.slice(0, 5).map((link) => {
            const Icon = link.icon;
            return (
              <NavLink key={link.to} to={link.to} className="rounded-lg p-2 text-[var(--text-muted)]">
                <Icon size={18} />
              </NavLink>
            );
          })}
        </div>
      </nav>
    </>
  );
}
