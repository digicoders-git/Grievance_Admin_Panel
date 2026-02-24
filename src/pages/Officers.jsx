import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";

import PageMeta from "../components/common/PageMeta";
import {
  fetchOfficers,
  createOfficerApi,
  updateOfficerApi,
  toggleOfficerStatusApi,
  deleteOfficerApi,
  getOfficerByIdApi,
} from "../apis/officer";

import toast from "react-hot-toast";
import { PlusIcon } from "../icons";
import Toggle from "../components/common/Toggle";
import Dropdown from "../components/common/Dropdown";
import Modal from "../components/common/Modal";
import Loader from "../components/common/Loader";

export default function Officers() {
  const navigate = useNavigate();
  const [officers, setOfficers] = useState([]);
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedOfficer, setSelectedOfficer] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  const loadOfficers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchOfficers({
        page,
        limit: 10,
        search,
        status: statusFilter,
      });

      setOfficers(data?.officers || []);
      setStats(data?.stats || { active: 0, inactive: 0, total: 0 });
      setPagination({
        currentPage: data?.currentPage || 1,
        totalPages: data?.totalPages || 1,
      });
    } catch (error) {
      toast.error("Failed to fetch officers");
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      loadOfficers();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [loadOfficers]);

  const handleToggleStatus = async (id) => {
    setTogglingId(id);
    try {
      await toggleOfficerStatusApi(id);
      toast.success("Status updated");
      loadOfficers();
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setTogglingId(null);
    }
  };

  const handleEdit = (officer) => {
    setSelectedOfficer(officer);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleView = (officer) => {
    navigate(`/officers/${officer._id}`);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this officer?")) {
      try {
        await deleteOfficerApi(id);
        toast.success("Officer deleted");
        loadOfficers();
      } catch (error) {
        toast.error("Failed to delete officer");
      }
    }
  };

  const openAddModal = () => {
    setSelectedOfficer(null);
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  return (
    <>
      <PageMeta
        title="Officers | GRS Admin"
        description="Manage Redressal Officers"
      />

      <div className="space-y-6 max-w-full">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Manage Officers
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              View and manage all redressal officers
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={openAddModal}
              className="flex items-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-sm font-bold transition-all shadow-lg active:scale-95"
            >
              <PlusIcon />
              Add Officer
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Total Officers
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
              Active Officers
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
              Inactive Officers
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
              placeholder="Search by name, email, mobile, department..."
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

        {/* Officers Table */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Officer
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Designation & Dept
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Mobile
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">
                    Total Claimed
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
                  <tr>
                    <td colSpan="6" className="px-6 py-20 text-center">
                      <Loader text="Loading officers..." size="h-8 w-8" />
                    </td>
                  </tr>
                ) : officers.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-10 text-center text-gray-500"
                    >
                      No officers found
                    </td>
                  </tr>
                ) : (
                  officers.map((officer) => (
                    <tr
                      key={officer._id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 font-bold text-xs capitalize">
                            {officer.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {officer.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {officer.email || "No email"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-700 dark:text-gray-200">
                          {officer.designation || "N/A"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {officer.department || "General"}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                        {officer.mobile}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center px-2.5 py-1 text-xs font-bold leading-none text-brand-700 bg-brand-100 rounded-lg dark:bg-brand-500/20 dark:text-brand-300">
                          {officer.totalClaimed || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Toggle
                          enabled={officer.isActive}
                          loading={togglingId === officer._id}
                          onChange={() => handleToggleStatus(officer._id)}
                        />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 text-gray-400">
                          <button
                            onClick={() => handleView(officer)}
                            className="p-2 hover:text-brand-500 transition-colors"
                            title="View Stats"
                          >
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                              <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                          </button>
                          <button
                            onClick={() => handleEdit(officer)}
                            className="p-2 hover:text-brand-500 transition-colors"
                            title="Edit"
                          >
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(officer._id)}
                            className="p-2 hover:text-red-500 transition-colors"
                            title="Delete"
                          >
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                              <line x1="10" y1="11" x2="10" y2="17"></line>
                              <line x1="14" y1="11" x2="14" y2="17"></line>
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
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

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditMode ? "Edit Officer" : "Add New Officer"}
        maxWidth="max-w-xl"
      >
        <OfficerForm
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            loadOfficers();
          }}
          initialData={selectedOfficer}
          isEdit={isEditMode}
        />
      </Modal>
    </>
  );
}

function OfficerForm({ onClose, onSuccess, initialData, isEdit }) {
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    password: "",
    designation: "",
    department: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        mobile: initialData.mobile || "",
        email: initialData.email || "",
        designation: initialData.designation || "",
        department: initialData.department || "",
        password: "",
      });
    }
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Indian Mobile Number Validation: 10 digits, starts with 6-9
    const indianMobileRegex = /^[6-9]\d{9}$/;
    if (!indianMobileRegex.test(formData.mobile)) {
      toast.error("Please enter a valid 10-digit Indian mobile number");
      return;
    }

    setLoading(true);
    try {
      if (isEdit) {
        const dataToUpdate = { ...formData };
        if (!dataToUpdate.password) delete dataToUpdate.password;
        await updateOfficerApi(initialData._id, dataToUpdate);
        toast.success("Officer updated");
      } else {
        await createOfficerApi(formData);
        toast.success("Officer created");
      }
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Full Name *
          </label>
          <input
            required
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all dark:text-white text-sm"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Rahul Sharma"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Mobile Number *
          </label>
          <input
            required
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all dark:text-white text-sm"
            value={formData.mobile}
            onChange={(e) =>
              setFormData({ ...formData, mobile: e.target.value })
            }
            placeholder="Unique mobile"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Email Address
          </label>
          <input
            type="email"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all dark:text-white text-sm"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            placeholder="officer@domain.com"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            {isEdit ? "New Password (Optional)" : "Password *"}
          </label>
          <input
            required={!isEdit}
            type="password"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all dark:text-white text-sm"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            placeholder="••••••••"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Designation
          </label>
          <input
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all dark:text-white text-sm"
            value={formData.designation}
            onChange={(e) =>
              setFormData({ ...formData, designation: e.target.value })
            }
            placeholder="e.g. HOD / Proctor"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Department
          </label>
          <input
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all dark:text-white text-sm"
            value={formData.department}
            onChange={(e) =>
              setFormData({ ...formData, department: e.target.value })
            }
            placeholder="e.g. Computer Science"
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
          className="px-8 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-bold shadow-lg transition-all active:scale-95 disabled:opacity-50"
        >
          {loading
            ? "Processing..."
            : isEdit
              ? "Update Officer"
              : "Save Officer"}
        </button>
      </div>
    </form>
  );
}
