import { useCallback, useState } from "react";
import {
  createNote as createNoteApi,
  deleteNote as deleteNoteApi,
  getNotes,
  patchNotePin,
  updateNote as updateNoteApi
} from "../api/notes";

export function useNotes(initialFilters = {}) {
  const [notes, setNotes] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 1, total: 0, limit: 20 });
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState(initialFilters);

  const loadNotes = useCallback(async (nextFilters = {}) => {
    setLoading(true);
    try {
      const response = await getNotes(nextFilters);
      setNotes(response.items || []);
      setMeta({
        page: response.page,
        pages: response.pages,
        total: response.total,
        limit: response.limit
      });
      setFilters(nextFilters);
    } finally {
      setLoading(false);
    }
  }, []);

  const createNote = useCallback(async (payload) => {
    const created = await createNoteApi(payload);
    setNotes((prev) => [created, ...prev]);
    return created;
  }, []);

  const updateNote = useCallback(async (id, payload) => {
    const updated = await updateNoteApi(id, payload);
    setNotes((prev) => prev.map((note) => (note.id === id ? updated : note)));
    return updated;
  }, []);

  const removeNote = useCallback(async (id) => {
    await deleteNoteApi(id);
    setNotes((prev) => prev.filter((note) => note.id !== id));
  }, []);

  const togglePin = useCallback(async (id, pinned, optimistic = true) => {
    if (optimistic) {
      setNotes((prev) => prev.map((note) => (note.id === id ? { ...note, pinned } : note)));
    }
    const updated = await patchNotePin(id, { pinned });
    setNotes((prev) => prev.map((note) => (note.id === id ? updated : note)));
    return updated;
  }, []);

  return {
    notes,
    meta,
    loading,
    filters,
    setNotes,
    setFilters,
    loadNotes,
    createNote,
    updateNote,
    removeNote,
    togglePin
  };
}
