import api from "./http";

export async function getTasks(params = {}) {
  const response = await api.get("/tasks", { params });
  return response.data;
}

export async function createTask(payload) {
  const response = await api.post("/tasks", payload);
  return response.data;
}

export async function updateTask(id, payload) {
  const response = await api.put(`/tasks/${id}`, payload);
  return response.data;
}

export async function deleteTask(id) {
  const response = await api.delete(`/tasks/${id}`);
  return response.data;
}

export async function patchTaskStatus(id, payload) {
  const response = await api.patch(`/tasks/${id}/status`, payload);
  return response.data;
}
