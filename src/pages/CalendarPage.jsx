import { useEffect, useMemo, useState } from "react";
import { addMonths, format, parseISO, subMonths } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { CalendarGrid } from "../components/CalendarGrid";
import { Modal } from "../components/Modal";
import { EmptyState } from "../components/EmptyState";
import { useEvents } from "../hooks/useEvents";

const eventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  start_time: z.string().min(1, "Start time required"),
  end_time: z.string().min(1, "End time required"),
  color: z.string().optional()
});

const inputClass =
  "w-full rounded-xl border border-[var(--border)] bg-white/[0.03] px-3 py-2 text-sm outline-none transition focus:border-[var(--primary)]";

function toLocalInputValue(dateInput) {
  if (!dateInput) return "";
  const date = typeof dateInput === "string" ? parseISO(dateInput) : dateInput;
  const offsetMs = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

export function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  const { events, loading, loadEvents, createEvent, updateEvent, removeEvent } = useEvents();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: "",
      description: "",
      start_time: "",
      end_time: "",
      color: "#6366f1"
    }
  });

  useEffect(() => {
    loadEvents({
      month: currentDate.getMonth() + 1,
      year: currentDate.getFullYear()
    });
  }, [currentDate, loadEvents]);

  const selectedDayEvents = useMemo(
    () => events.filter((event) => format(parseISO(event.start_time), "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd")),
    [events, selectedDate]
  );

  const openCreate = (day = new Date()) => {
    setEditingEvent(null);
    setSelectedDate(day);
    const start = new Date(day);
    start.setHours(9, 0, 0, 0);
    const end = new Date(day);
    end.setHours(10, 0, 0, 0);

    reset({
      title: "",
      description: "",
      start_time: toLocalInputValue(start),
      end_time: toLocalInputValue(end),
      color: "#6366f1"
    });
    setModalOpen(true);
  };

  const openEdit = (event) => {
    setEditingEvent(event);
    reset({
      title: event.title || "",
      description: event.description || "",
      start_time: toLocalInputValue(event.start_time),
      end_time: toLocalInputValue(event.end_time),
      color: event.color || "#6366f1"
    });
    setModalOpen(true);
  };

  const onSubmit = async (values) => {
    const payload = {
      ...values,
      start_time: new Date(values.start_time).toISOString(),
      end_time: new Date(values.end_time).toISOString()
    };

    try {
      if (editingEvent) {
        await updateEvent(editingEvent.id, payload);
        toast.success("Event updated");
      } else {
        await createEvent(payload);
        toast.success("Event created");
      }
      setModalOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.error?.message || "Failed to save event");
    }
  };

  const onDelete = async (event) => {
    try {
      await removeEvent(event.id);
      toast.success("Event deleted");
    } catch (error) {
      toast.error(error.response?.data?.error?.message || "Failed to delete event");
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="heading-font text-3xl font-bold">Calendar</h1>
          <p className="text-sm text-[var(--text-muted)]">Monthly view of events and schedule blocks.</p>
        </div>
        <button
          type="button"
          onClick={() => openCreate(new Date())}
          className="rounded-xl bg-[var(--primary)] px-4 py-2 text-sm text-white"
        >
          <Plus size={16} className="inline-block mr-1" />
          New Event
        </button>
      </div>

      <div className="flex items-center justify-between glass rounded-2xl p-3">
        <button type="button" className="rounded-lg p-2 hover:bg-white/10" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
          <ChevronLeft size={18} />
        </button>
        <h2 className="heading-font text-2xl">{format(currentDate, "MMMM yyyy")}</h2>
        <button type="button" className="rounded-lg p-2 hover:bg-white/10" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
          <ChevronRight size={18} />
        </button>
      </div>

      <CalendarGrid currentDate={currentDate} events={events} onDayClick={(date) => setSelectedDate(date)} />

      <section className="glass rounded-2xl p-4">
        <h3 className="heading-font text-xl">Events on {format(selectedDate, "MMM d, yyyy")}</h3>
        {loading ? <p className="mt-3 text-sm text-[var(--text-muted)]">Loading events...</p> : null}
        {!loading && selectedDayEvents.length === 0 ? (
          <div className="mt-3">
            <EmptyState
              title="No events on this day"
              description="Click New Event to add a schedule block."
              action={
                <button
                  type="button"
                  onClick={() => openCreate(selectedDate)}
                  className="rounded-xl bg-[var(--primary)] px-4 py-2 text-sm text-white"
                >
                  Create event
                </button>
              }
            />
          </div>
        ) : null}

        <div className="mt-3 space-y-3">
          {selectedDayEvents.map((event) => (
            <article key={event.id} className="rounded-xl border border-[var(--border)] p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold">{event.title}</p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {format(parseISO(event.start_time), "p")} - {format(parseISO(event.end_time), "p")}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => openEdit(event)}
                    className="rounded-md px-2 py-1 text-xs hover:bg-white/10"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(event)}
                    className="rounded-md px-2 py-1 text-xs text-red-300 hover:bg-white/10"
                  >
                    <Trash2 size={13} className="inline-block" />
                  </button>
                </div>
              </div>
              {event.description ? (
                <p className="mt-2 text-sm text-[var(--text-muted)]">{event.description}</p>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingEvent ? "Edit event" : "New event"}>
        <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <input className={inputClass} placeholder="Event title" {...register("title")} />
            {errors.title ? <p className="mt-1 text-xs text-red-400">{errors.title.message}</p> : null}
          </div>
          <textarea rows={3} className={inputClass} placeholder="Description" {...register("description")} />
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-[var(--text-muted)]">Start</label>
              <input type="datetime-local" className={inputClass} {...register("start_time")} />
              {errors.start_time ? <p className="mt-1 text-xs text-red-400">{errors.start_time.message}</p> : null}
            </div>
            <div>
              <label className="mb-1 block text-xs text-[var(--text-muted)]">End</label>
              <input type="datetime-local" className={inputClass} {...register("end_time")} />
              {errors.end_time ? <p className="mt-1 text-xs text-red-400">{errors.end_time.message}</p> : null}
            </div>
          </div>
          <input type="color" className={`${inputClass} h-11`} {...register("color")} />
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
