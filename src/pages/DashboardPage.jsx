import { useEffect, useMemo } from "react";
import { CheckCircle2, Clock3, Flame } from "lucide-react";
import { format, isToday, parseISO } from "date-fns";
import { StatCard } from "../components/StatCard";
import { TaskCard } from "../components/TaskCard";
import { EmptyState } from "../components/EmptyState";
import { useTasks } from "../hooks/useTasks";
import { useEvents } from "../hooks/useEvents";

export function DashboardPage() {
  const { tasks, loading: tasksLoading, loadTasks } = useTasks({ page: 1, limit: 60 });
  const { events, loading: eventsLoading, loadEvents } = useEvents();

  useEffect(() => {
    loadTasks({ page: 1, limit: 60 });
    const currentDate = new Date();
    loadEvents({ month: currentDate.getMonth() + 1, year: currentDate.getFullYear() });
  }, [loadEvents, loadTasks]);

  const todayDoneCount = useMemo(
    () => tasks.filter((task) => task.status === "done" && task.updated_at && isToday(parseISO(task.updated_at))).length,
    [tasks]
  );
  const upcomingCount = useMemo(() => {
    const now = new Date();
    return tasks.filter((task) => task.due_date && new Date(task.due_date) >= now && task.status !== "done").length;
  }, [tasks]);
  const overdueCount = useMemo(() => {
    const now = new Date();
    return tasks.filter((task) => task.due_date && new Date(task.due_date) < now && task.status !== "done").length;
  }, [tasks]);

  const upcomingTasks = tasks
    .filter((task) => task.status !== "done")
    .sort((a, b) => new Date(a.due_date || "2100-01-01") - new Date(b.due_date || "2100-01-01"))
    .slice(0, 4);

  const todaysEvents = events.filter((event) => isToday(parseISO(event.start_time)));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="heading-font text-3xl font-bold">Dashboard</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Snapshot for {format(new Date(), "EEEE, MMM d")}
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard label="Tasks done today" value={todayDoneCount} hint="Completed milestones" icon={CheckCircle2} />
        <StatCard label="Upcoming deadlines" value={upcomingCount} hint="Open tasks with due dates" icon={Clock3} />
        <StatCard label="Overdue tasks" value={overdueCount} hint="Needs attention now" icon={Flame} />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="space-y-3">
          <h2 className="heading-font text-xl">Upcoming Tasks</h2>
          {tasksLoading ? <p className="text-sm text-[var(--text-muted)]">Loading tasks...</p> : null}
          {!tasksLoading && upcomingTasks.length === 0 ? (
            <EmptyState title="No upcoming tasks" description="Create a task with a due date to see it here." />
          ) : null}
          {upcomingTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>

        <div className="glass rounded-2xl p-4">
          <h2 className="heading-font text-xl">Today's Events</h2>
          {eventsLoading ? <p className="mt-3 text-sm text-[var(--text-muted)]">Loading events...</p> : null}
          {!eventsLoading && todaysEvents.length === 0 ? (
            <div className="mt-4">
              <EmptyState title="No events today" description="Add an event in calendar to stay on track." />
            </div>
          ) : null}
          <div className="mt-4 space-y-3">
            {todaysEvents.map((event) => (
              <div key={event.id} className="rounded-xl border border-[var(--border)] p-3">
                <p className="font-semibold">{event.title}</p>
                <p className="mt-1 text-xs text-[var(--text-muted)]">
                  {format(parseISO(event.start_time), "p")} - {format(parseISO(event.end_time), "p")}
                </p>
                {event.description ? (
                  <p className="mt-2 text-sm text-[var(--text-muted)]">{event.description}</p>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
