import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import PageMeta from "../components/common/PageMeta";
import { getOfficerByIdApi } from "../apis/officer";
import { fetchAdminGrievances } from "../apis/admin";
import toast from "react-hot-toast";
import Loader from "../components/common/Loader";

export default function OfficerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [officerData, setOfficerData] = useState(null);
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [grievanceLoading, setGrievanceLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);

  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
  });

  const loadOfficerInfo = useCallback(async () => {
    try {
      const data = await getOfficerByIdApi(id);
      setOfficerData(data);
    } catch (error) {
      toast.error("Failed to load officer info");
      navigate("/officers");
    }
  }, [id, navigate]);

  const loadGrievances = useCallback(
    async (statusChanged = false) => {
      setGrievanceLoading(true);
      try {
        const data = await fetchAdminGrievances({
          officerId: id,
          status: selectedStatus || "",
          page: statusChanged ? 1 : page,
          limit: 5,
        });
        setGrievances(data?.grievances || []);
        setPagination({
          currentPage: data?.currentPage || 1,
          totalPages: data?.totalPages || 1,
        });
        if (statusChanged) setPage(1);
      } catch (error) {
        toast.error("Failed to load grievances");
      } finally {
        setGrievanceLoading(false);
      }
    },
    [id, selectedStatus, page],
  );

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await loadOfficerInfo();
      await loadGrievances();
      setLoading(false);
    };
    init();
  }, [loadOfficerInfo]);

  useEffect(() => {
    if (!loading) {
      loadGrievances();
    }
  }, [page, selectedStatus]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader size="h-10 w-10" text="Loading officer details..." />
      </div>
    );
  }

  if (!officerData) return null;

  const { officer, stats } = officerData;

  const handleStatusClick = (status) => {
    if (selectedStatus === status) {
      setSelectedStatus(null); // Deselect if same
    } else {
      setSelectedStatus(status);
    }
  };

  return (
    <>
      <PageMeta
        title={`${officer.name} | Officer Detail`}
        description="Officer performance and grievances"
      />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate("/officers")}
            className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-brand-600 transition-all"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to Officers
          </button>
          <div className="text-right">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white uppercase tracking-tight">
              {officer.name}
            </h1>
            <p className="text-sm text-gray-500">
              {officer.designation} · {officer.department}
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Claimed"
            value={stats.claimed}
            isActive={!selectedStatus}
            onClick={() => setSelectedStatus(null)}
            color="brand"
          />
          <StatCard
            title="In Progress"
            value={stats.inProgress}
            isActive={selectedStatus === "In Progress"}
            onClick={() => handleStatusClick("In Progress")}
            color="blue"
          />
          <StatCard
            title="Resolved"
            value={stats.resolved}
            isActive={selectedStatus === "Resolved"}
            onClick={() => handleStatusClick("Resolved")}
            color="success"
          />
          <StatCard
            title="Rejected"
            value={stats.rejected}
            isActive={selectedStatus === "Rejected"}
            onClick={() => handleStatusClick("Rejected")}
            color="danger"
          />
        </div>

        {/* Grievance List Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {selectedStatus
                ? `${selectedStatus} Complaints`
                : "All Handled Complaints"}
            </h3>
            {selectedStatus && (
              <button
                onClick={() => setSelectedStatus(null)}
                className="text-xs font-bold text-brand-600 hover:underline"
              >
                Clear Filter
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {grievanceLoading ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-20 text-center">
                      <Loader />
                    </td>
                  </tr>
                ) : grievances.length === 0 ? (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-6 py-10 text-center text-gray-500"
                    >
                      No grievances found for this criteria.
                    </td>
                  </tr>
                ) : (
                  grievances.map((g) => (
                    <tr
                      key={g._id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/10"
                    >
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {g.studentId?.name}
                        </p>
                        <p className="text-[11px] text-gray-400">
                          {g.studentId?.enrollmentNumber}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">
                        {g.subject}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={g.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => navigate(`/grievances/${g._id}`)}
                          className="px-3 py-1.5 text-[11px] font-bold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-brand-500 hover:text-white transition-all"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="text-xs font-bold text-gray-500 p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Prev
              </button>
              <span className="text-xs text-gray-400">
                Page {page} of {pagination.totalPages}
              </span>
              <button
                disabled={page >= pagination.totalPages}
                onClick={() => setPage(page + 1)}
                className="text-xs font-bold text-gray-500 p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function StatCard({ title, value, color, isActive, onClick }) {
  const themes = {
    brand:
      "border-brand-500 bg-brand-50/50 dark:bg-brand-500/10 text-brand-700",
    blue: "border-blue-500 bg-blue-50/50 dark:bg-blue-500/10 text-blue-700",
    success:
      "border-success-500 bg-success-50/50 dark:bg-success-500/10 text-success-700",
    danger: "border-red-500 bg-red-50/50 dark:bg-red-500/10 text-red-700",
  };

  return (
    <div
      onClick={onClick}
      className={`p-6 rounded-2xl border-2 transition-all cursor-pointer hover:shadow-lg active:scale-95 ${isActive ? themes[color] : "border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500"}`}
    >
      <div className="flex items-center justify-between">
        <p
          className={`text-xs font-bold uppercase tracking-wider ${isActive ? "" : "text-gray-400"}`}
        >
          {title}
        </p>
        <button
          className={`p-1.5 rounded-lg border transition-all ${isActive ? "bg-white/50 border-current" : "bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-brand-500"}`}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          >
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
        </button>
      </div>
      <h3
        className={`text-3xl font-black mt-2 ${isActive ? "text-gray-900 dark:text-white" : "text-gray-400"}`}
      >
        {value}
      </h3>
    </div>
  );
}

function StatusBadge({ status }) {
  const configs = {
    Pending: "bg-orange-50 text-orange-600 border-orange-200",
    "In Progress": "bg-blue-50 text-blue-600 border-blue-200",
    Resolved: "bg-success-50 text-success-600 border-success-200",
    Rejected: "bg-red-50 text-red-600 border-red-200",
  };
  return (
    <span
      className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${configs[status] || configs.Pending}`}
    >
      {status}
    </span>
  );
}
