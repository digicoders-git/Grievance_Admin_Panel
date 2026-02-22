import API from "../utils/api";

// Admin facing student APIs
export const fetchStudents = async (params) => {
  const response = await API.get("/student/admin/get-all", { params });
  return response.data;
};

export const createManualStudent = async (data) => {
  const response = await API.post("/student/admin/create", data);
  return response.data;
};

export const toggleStudentStatusApi = async (id) => {
  const response = await API.post(`/student/admin/toggle-status/${id}`);
  return response.data;
};

export const importStudentsExcelApi = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await API.post("/student/admin/import-excel", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const bulkCreateStudentsApi = async (students) => {
  const response = await API.post("/student/admin/bulk-create", { students });
  return response.data;
};

// Student facing APIs (if needed for profile)
export const getStudentProfile = async () => {
  const response = await API.get("/student/profile");
  return response.data;
};

export const getStudentByIdApi = async (id) => {
  const response = await API.get(`/student/admin/get/${id}`);
  return response.data;
};
