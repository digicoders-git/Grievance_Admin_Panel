import API from "../utils/api";

export const loginAdmin = async (email, password) => {
  const response = await API.post("/admin/login", { email, password });
  return response.data;
};

export const updateAdminProfile = async (id, formData) => {
  const response = await API.put(`/admin/update/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const fetchAdminGrievances = async ({
  page = 1,
  limit = 10,
  search = "",
  status = "",
} = {}) => {
  const params = new URLSearchParams({ page, limit });
  if (search) params.append("search", search);
  if (status) params.append("status", status);
  const response = await API.get(`/admin/grievance/list?${params}`);
  return response.data;
};

export const getDashboardStats = async () => {
  const response = await API.get("/admin/dashboard/stats");
  return response.data;
};
