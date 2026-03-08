import api from "./http";

export async function getProjects() {
  const response = await api.get("/projects");
  return response.data;
}

export async function createProject(payload) {
  const response = await api.post("/projects", payload);
  return response.data;
}

export async function updateProject(id, payload) {
  const response = await api.put(`/projects/${id}`, payload);
  return response.data;
}

export async function deleteProject(id) {
  const response = await api.delete(`/projects/${id}`);
  return response.data;
}
