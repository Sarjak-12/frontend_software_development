import api from "./http";

export async function getProfile() {
  const response = await api.get("/user/profile");
  return response.data;
}

export async function updateProfile(payload) {
  const response = await api.put("/user/profile", payload);
  return response.data;
}
