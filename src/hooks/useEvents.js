import { useCallback, useState } from "react";
import {
  createEvent as createEventApi,
  deleteEvent as deleteEventApi,
  getEvents,
  updateEvent as updateEventApi
} from "../api/events";

export function useEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadEvents = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const response = await getEvents(params);
      setEvents(response || []);
      return response;
    } finally {
      setLoading(false);
    }
  }, []);

  const createEvent = useCallback(async (payload) => {
    const created = await createEventApi(payload);
    setEvents((prev) => [...prev, created]);
    return created;
  }, []);

  const updateEvent = useCallback(async (id, payload) => {
    const updated = await updateEventApi(id, payload);
    setEvents((prev) => prev.map((event) => (event.id === id ? updated : event)));
    return updated;
  }, []);

  const removeEvent = useCallback(async (id) => {
    await deleteEventApi(id);
    setEvents((prev) => prev.filter((event) => event.id !== id));
  }, []);

  return {
    events,
    loading,
    loadEvents,
    createEvent,
    updateEvent,
    removeEvent
  };
}
