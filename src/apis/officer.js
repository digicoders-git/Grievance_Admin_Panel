import API from "../utils/api";

export const fetchOfficers = async (params) => {
  const response = await API.get("/admin/officer/list", { params });
  return response.data;
};

export const createOfficerApi = async (officerData) => {
  const response = await API.post("/admin/officer/create", officerData);
  return response.data;
};

export const updateOfficerApi = async (id, officerData) => {
  const response = await API.patch(`/admin/officer/update/${id}`, officerData);
  return response.data;
};

export const toggleOfficerStatusApi = async (id) => {
  const response = await API.patch(`/admin/officer/toggle-status/${id}`);
  return response.data;
};

export const deleteOfficerApi = async (id) => {
  const response = await API.delete(`/admin/officer/delete/${id}`);
  return response.data;
};

export const getOfficerByIdApi = async (id) => {
  const response = await API.get(`/admin/officer/get/${id}`);
  return response.data;
};
