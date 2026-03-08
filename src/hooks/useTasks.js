import { useCallback, useState } from "react";
import {
  createTask as createTaskApi,
  deleteTask as deleteTaskApi,
  getTasks,
  patchTaskStatus,
  updateTask as updateTaskApi
} from "../api/tasks";

export function useTasks(initialFilters = {}) {
  const [tasks, setTasks] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 1, total: 0, limit: 20 });
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState(initialFilters);

  const loadTasks = useCallback(async (nextFilters = {}) => {
    setLoading(true);
    try {
      const response = await getTasks(nextFilters);
      setTasks(response.items || []);
      setMeta({
        page: response.page,
        pages: response.pages,
        total: response.total,
        limit: response.limit
      });
      setFilters(nextFilters);
      return response;
    } finally {
      setLoading(false);
    }
  }, []);

  const createTask = useCallback(async (payload) => {
    const created = await createTaskApi(payload);
    setTasks((prev) => [created, ...prev]);
    return created;
  }, []);

  const updateTask = useCallback(async (id, payload) => {
    const updated = await updateTaskApi(id, payload);
    setTasks((prev) => prev.map((task) => (task.id === id ? updated : task)));
    return updated;
  }, []);

  const removeTask = useCallback(async (id) => {
    await deleteTaskApi(id);
    setTasks((prev) => prev.filter((task) => task.id !== id));
  }, []);

  const changeStatus = useCallback(async (id, status, position = 0, optimistic = true) => {
    if (optimistic) {
      setTasks((prev) =>
        prev.map((task) => (task.id === id ? { ...task, status, position } : task))
      );
    }
    const updated = await patchTaskStatus(id, { status, position });
    setTasks((prev) => prev.map((task) => (task.id === id ? updated : task)));
    return updated;
  }, []);

  return {
    tasks,
    meta,
    loading,
    filters,
    setTasks,
    setFilters,
    loadTasks,
    createTask,
    updateTask,
    removeTask,
    changeStatus
  };
}
