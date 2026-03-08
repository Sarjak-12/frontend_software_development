import api from "./http";

export async function getNotes(params = {}) {
  const response = await api.get("/notes", { params });
  return response.data;
}

export async function createNote(payload) {
  const response = await api.post("/notes", payload);
  return response.data;
}

export async function updateNote(id, payload) {
  const response = await api.put(`/notes/${id}`, payload);
  return response.data;
}

export async function deleteNote(id) {
  const response = await api.delete(`/notes/${id}`);
  return response.data;
}

export async function patchNotePin(id, payload) {
  const response = await api.patch(`/notes/${id}/pin`, payload);
  return response.data;
}
