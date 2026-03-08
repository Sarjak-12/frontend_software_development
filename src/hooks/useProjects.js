import { useCallback, useState } from "react";
import {
  createProject as createProjectApi,
  deleteProject as deleteProjectApi,
  getProjects,
  updateProject as updateProjectApi
} from "../api/projects";

export function useProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    try {
      const items = await getProjects();
      setProjects(items);
      return items;
    } finally {
      setLoading(false);
    }
  }, []);

  const createProject = useCallback(async (payload) => {
    const created = await createProjectApi(payload);
    setProjects((prev) => [created, ...prev]);
    return created;
  }, []);

  const updateProject = useCallback(async (id, payload) => {
    const updated = await updateProjectApi(id, payload);
    setProjects((prev) => prev.map((project) => (project.id === id ? updated : project)));
    return updated;
  }, []);

  const removeProject = useCallback(async (id) => {
    await deleteProjectApi(id);
    setProjects((prev) => prev.filter((project) => project.id !== id));
  }, []);

  return {
    projects,
    loading,
    loadProjects,
    createProject,
    updateProject,
    removeProject
  };
}
