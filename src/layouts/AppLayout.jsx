import { Outlet } from "react-router-dom";
import { Navbar } from "../components/Navbar";

export function AppLayout() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pb-24 pt-20 lg:pb-6 lg:pl-72 lg:pt-6">
        <div className="mx-auto max-w-7xl px-4">{<Outlet />}</div>
      </main>
    </div>
  );
}
