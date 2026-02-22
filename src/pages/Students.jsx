import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import PageMeta from "../components/common/PageMeta";
import * as XLSX from "xlsx";
import {
  fetchStudents,
  toggleStudentStatusApi,
  importStudentsExcelApi,
  createManualStudent,
} from "../apis/student";
import toast from "react-hot-toast";
import { GroupIcon, PlusIcon, CloseIcon, ChevronDownIcon } from "../icons";
import Toggle from "../components/common/Toggle";
import Dropdown from "../components/common/Dropdown";
import Modal from "../components/common/Modal";
import Loader from "../components/common/Loader";

export default function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ active: 0, inactive: 0, total: 0 });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
  });

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  // Modals
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const navigate = useNavigate();

  const loadStudents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchStudents({
        page,
        limit: 10,
        search,
        status: statusFilter,
      });

      // Safe state updates to prevent crashes if backend format differs
      setStudents(data?.students || (Array.isArray(data) ? data : []));
      setStats(data?.stats || { active: 0, inactive: 0, total: 0 });
      setPagination({
        currentPage: data?.currentPage || 1,
        totalPages: data?.totalPages || 1,
      });
    } catch (error) {
      toast.error("Failed to fetch students");
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      loadStudents();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [loadStudents]);

  const handleToggleStatus = async (id) => {
    setTogglingId(id);
    try {
      await toggleStudentStatusApi(id);
      toast.success("Status updated");
      loadStudents();
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setTogglingId(null);
    }
  };

  const openViewModal = (student) => {
    setSelectedStudent(student);
    setIsViewModalOpen(true);
  };

  const downloadSampleExcel = () => {
    const headers = [
      "name",
      "enrollmentNumber",
      "dob",
      "mobile",
      "email",
      "branch",
      "year",
      "college",
    ];
    const row = [
      "Abhay Vishwakarma",
      "EN123456",
      "24/04/2004",
      "6280486823",
      "av96514290@gmail.com",
      "CSE",
      "3rd",
      "MMIT kushinagar",
    ];

    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet([headers, row]);
    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Students");

    // Generate and download XLSX file
    XLSX.writeFile(wb, "student_sample_format.xlsx");
  };

  return (
    <>
      <PageMeta title="Students | GRS Admin" description="Manage students" />

      <div className="space-y-6 max-w-full">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Manage Students
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              View and manage all registered students
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={downloadSampleExcel}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl text-sm font-medium transition-all flex items-center gap-2"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Sample format
            </button>
            <button
              onClick={() => navigate("/students/import-preview")}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-medium transition-all"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              Import Excel
            </button>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-sm font-bold transition-all shadow-lg active:scale-95"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Add Student
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Total Students
            </p>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
              {loading ? (
                <Loader size="h-6 w-6" className="justify-start" />
              ) : (
                stats?.total || 0
              )}
            </h3>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <p className="text-sm font-medium text-green-600 dark:text-green-400">
              Active Students
            </p>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
              {loading ? (
                <Loader
                  size="h-6 w-6"
                  className="justify-start text-green-500"
                />
              ) : (
                stats?.active || 0
              )}
            </h3>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <p className="text-sm font-medium text-red-500 dark:text-red-400">
              Inactive Students
            </p>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
              {loading ? (
                <Loader size="h-6 w-6" className="justify-start text-red-500" />
              ) : (
                stats?.inactive || 0
              )}
            </h3>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search by name, enrollment, branch..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-brand-500/20 outline-none text-sm transition-all"
            />
          </div>
          <div className="w-full md:w-48">
            <Dropdown
              options={[
                { label: "All Status", value: "" },
                { label: "Active Only", value: "true" },
                { label: "Inactive Only", value: "false" },
              ]}
              value={statusFilter}
              onChange={(val) => setStatusFilter(val)}
              placeholder="Filter by Status"
            />
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden animate-in fade-in duration-500">
          <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700">
            <div className="min-w-[1000px]">
              <table className="w-full text-left">
                <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Enrollment
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Branch & Year
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {loading ? (
                    <td colSpan="5" className="px-6 py-20 text-center">
                      <Loader text="Loading students..." size="h-8 w-8" />
                    </td>
                  ) : students.length === 0 ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-6 py-10 text-center text-gray-500"
                      >
                        No students found
                      </td>
                    </tr>
                  ) : (
                    students.map((student) => (
                      <tr
                        key={student._id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 font-bold text-xs capitalize">
                              {student.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {student.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {student.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 font-mono">
                          {student.enrollmentNumber}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                          {student.branch} - {student.year}
                        </td>
                        <td className="px-6 py-4">
                          <Toggle
                            enabled={student.isActive}
                            loading={togglingId === student._id}
                            onChange={() => handleToggleStatus(student._id)}
                          />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => openViewModal(student)}
                            className="p-2 text-gray-400 hover:text-brand-500 transition-colors"
                            title="View Details"
                          >
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Page {pagination.currentPage} of {pagination.totalPages}
            </p>
            <div className="flex gap-2">
              <button
                disabled={pagination.currentPage <= 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-medium disabled:opacity-50 hover:bg-gray-50 transition-all dark:text-white"
              >
                Previous
              </button>
              <button
                disabled={pagination.currentPage >= pagination.totalPages}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-medium disabled:opacity-50 hover:bg-gray-50 transition-all dark:text-white"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* View Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Student Details"
        maxWidth="max-w-lg"
      >
        {selectedStudent && (
          <div className="space-y-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center text-brand-600 font-bold text-2xl">
                {selectedStudent.name.charAt(0)}
              </div>
              <div>
                <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                  {selectedStudent.name}
                </h4>
                <p className="text-sm text-gray-500 font-medium">
                  {selectedStudent.enrollmentNumber}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-y-6 gap-x-4 border-t border-gray-100 dark:border-gray-700 pt-6">
              <div>
                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">
                  DOB (Password)
                </p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
                  {selectedStudent.dob}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">
                  Custom Password
                </p>
                <p className="text-sm font-semibold text-brand-500 mt-1">
                  {selectedStudent.password || "Not Created"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">
                  Mobile
                </p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
                  {selectedStudent.mobile}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">
                  Email
                </p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
                  {selectedStudent.email}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">
                  Branch
                </p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
                  {selectedStudent.branch}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">
                  Year
                </p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
                  {selectedStudent.year}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">
                  College
                </p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
                  {selectedStudent.college}
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Manual Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Add New Student"
        maxWidth="max-w-2xl"
      >
        <CreateStudentModal
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={() => {
            setIsCreateModalOpen(false);
            loadStudents();
          }}
        />
      </Modal>
    </>
  );
}

function CreateStudentModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: "",
    enrollmentNumber: "",
    dob: "",
    mobile: "",
    email: "",
    branch: "",
    year: "",
    college: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createManualStudent(formData);
      toast.success("Student created");
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create student");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Full Name *
          </label>
          <input
            required
            type="text"
            placeholder="Abhay Vishwakarma"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all dark:text-white"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Enrollment Number *
          </label>
          <input
            required
            type="text"
            placeholder="EN123456"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all dark:text-white font-mono"
            value={formData.enrollmentNumber}
            onChange={(e) =>
              setFormData({ ...formData, enrollmentNumber: e.target.value })
            }
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            DOB (Password) *
          </label>
          <input
            required
            type="text"
            placeholder="24/04/2004"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all dark:text-white"
            value={formData.dob}
            onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Mobile Number
          </label>
          <input
            type="text"
            placeholder="9876543210"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all dark:text-white"
            value={formData.mobile}
            onChange={(e) =>
              setFormData({ ...formData, mobile: e.target.value })
            }
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Email Address
          </label>
          <input
            type="email"
            placeholder="student@example.com"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all dark:text-white"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Branch
          </label>
          <input
            type="text"
            placeholder="Computer Science"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all dark:text-white"
            value={formData.branch}
            onChange={(e) =>
              setFormData({ ...formData, branch: e.target.value })
            }
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Year
          </label>
          <input
            type="text"
            placeholder="3rd Year"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all dark:text-white"
            value={formData.year}
            onChange={(e) => setFormData({ ...formData, year: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            College
          </label>
          <input
            type="text"
            placeholder="DigiCoders Institute"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all dark:text-white"
            value={formData.college}
            onChange={(e) =>
              setFormData({ ...formData, college: e.target.value })
            }
          />
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-gray-700">
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-2.5 text-gray-500 font-bold hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
        >
          Cancel
        </button>
        <button
          disabled={loading}
          type="submit"
          className="px-8 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-bold shadow-lg transition-all disabled:opacity-50 active:scale-95"
        >
          {loading ? "Creating..." : "Save Student"}
        </button>
      </div>
    </form>
  );
}
