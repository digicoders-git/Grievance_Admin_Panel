import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import PageMeta from "../components/common/PageMeta";
import { fetchAdminGrievances } from "../apis/admin";
import Dropdown from "../components/common/Dropdown";
// import Dropdown from "../components/common/Dropdown";
import toast from "react-hot-toast";
import Loader from "../components/common/Loader";

export default function Grievances() {
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    rejected: 0,
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  });

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  const navigate = useNavigate();

  const loadGrievances = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAdminGrievances({
        page,
        limit: 10,
        search,
        status: statusFilter,
      });
      setGrievances(data?.grievances || []);
      setStats(
        data?.stats || {
          total: 0,
          pending: 0,
          inProgress: 0,
          resolved: 0,
          rejected: 0,
        },
      );
      setPagination({
        currentPage: data?.currentPage || 1,
        totalPages: data?.totalPages || 1,
        totalItems: data?.totalItems || 0,
      });
    } catch (error) {
      toast.error("Failed to fetch grievances");
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  // Reset page on filter/search change
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => loadGrievances(), 400);
    return () => clearTimeout(timer);
  }, [loadGrievances]);

  return (
    <>
      <PageMeta
        title="Grievances | GRS Admin"
        description="Manage all grievances"
      />

      <div className="space-y-6 max-w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Grievances
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              View and manage all submitted grievances
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatCard
            label="Total"
            value={stats.total}
            color="blue"
            loading={loading}
          />
          <StatCard
            label="Pending"
            value={stats.pending}
            color="orange"
            loading={loading}
          />
          <StatCard
            label="In Progress"
            value={stats.inProgress}
            color="indigo"
            loading={loading}
          />
          <StatCard
            label="Resolved"
            value={stats.resolved}
            color="green"
            loading={loading}
          />
          <StatCard
            label="Rejected"
            value={stats.rejected}
            color="red"
            loading={loading}
          />
        </div>

        {/* Search & Filters */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
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
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search by subject or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-brand-500/20 outline-none text-sm transition-all dark:text-white"
            />
          </div>
          <div className="w-full md:w-52">
            <Dropdown
              options={[
                { label: "All Status", value: "" },
                { label: "Pending", value: "Pending" },
                { label: "In Progress", value: "In Progress" },
                { label: "Resolved", value: "Resolved" },
                { label: "Rejected", value: "Rejected" },
              ]}
              value={statusFilter}
              onChange={(val) => setStatusFilter(val)}
              placeholder="Filter by Status"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700">
            <div className="min-w-[1000px]">
              <table className="w-full text-left">
                <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      #
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Subject
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Handled By
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Deadline
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Submitted
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {loading ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-20 text-center">
                        <Loader text="Loading grievances..." size="h-8 w-8" />
                      </td>
                    </tr>
                  ) : grievances.length === 0 ? (
                    <tr>
                      <td
                        colSpan="8"
                        className="px-6 py-12 text-center text-gray-500"
                      >
                        No grievances found
                      </td>
                    </tr>
                  ) : (
                    grievances.map((g, idx) => (
                      <tr
                        key={g._id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                      >
                        {/* Serial */}
                        <td className="px-6 py-4 text-xs text-gray-400 font-mono">
                          {(pagination.currentPage - 1) * 10 + idx + 1}
                        </td>

                        {/* Subject */}
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-gray-900 dark:text-white max-w-[200px] truncate">
                              {g.subject}
                            </span>
                            <span className="text-[10px] text-gray-400 font-mono mt-0.5">
                              #{g._id.slice(-6).toUpperCase()}
                            </span>
                          </div>
                        </td>

                        {/* Student */}
                        <td className="px-6 py-4">
                          {g.studentId ? (
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center text-brand-600 font-bold text-xs uppercase shrink-0">
                                {g.studentId.name?.charAt(0)}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white leading-tight">
                                  {g.studentId.name}
                                </p>
                                <p className="text-[10px] text-gray-400 font-mono">
                                  {g.studentId.enrollmentNumber}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400 italic">
                              —
                            </span>
                          )}
                        </td>

                        {/* Handled By */}
                        <td className="px-6 py-4">
                          {g.handledBy ? (
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white leading-tight">
                                {g.handledBy.name}
                              </p>
                              <p className="text-[10px] text-gray-400">
                                {g.handledBy.department}
                              </p>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400 italic">
                              Not assigned
                            </span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <StatusBadge status={g.status} />
                        </td>

                        {/* Deadline */}
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                          {new Date(g.deadline).toLocaleDateString("en-IN")}
                        </td>

                        {/* Submitted */}
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {new Date(g.createdAt).toLocaleDateString("en-IN")}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() =>
                              navigate(`/grievances/${g._id}`, {
                                state: { grievance: g },
                              })
                            }
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
              Showing{" "}
              <span className="font-semibold text-gray-700 dark:text-gray-200">
                {grievances.length > 0
                  ? `${(pagination.currentPage - 1) * 10 + 1}–${Math.min(
                      pagination.currentPage * 10,
                      pagination.totalItems,
                    )}`
                  : "0"}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-gray-700 dark:text-gray-200">
                {pagination.totalItems}
              </span>{" "}
              grievances
            </p>
            <div className="flex gap-2">
              <button
                disabled={pagination.currentPage <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-medium disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all dark:text-white"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-xs font-semibold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700">
                {pagination.currentPage} / {pagination.totalPages}
              </span>
              <button
                disabled={pagination.currentPage >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-medium disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all dark:text-white"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function StatCard({ label, value, color, loading }) {
  const colors = {
    blue: "text-blue-600 dark:text-blue-400",
    orange: "text-orange-600 dark:text-orange-400",
    indigo: "text-indigo-600 dark:text-indigo-400",
    green: "text-green-600 dark:text-green-400",
    red: "text-red-600 dark:text-red-400",
  };
  return (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
        {label}
      </p>
      {loading ? (
        <Loader size="h-6 w-6" className="justify-start mt-2" />
      ) : (
        <p className={`text-3xl font-bold mt-1 ${colors[color]}`}>{value}</p>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const config = {
    Pending:
      "bg-orange-50 text-orange-600 border-orange-100 dark:bg-orange-500/10 dark:text-orange-400",
    "In Progress":
      "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-500/10 dark:text-blue-400",
    Resolved:
      "bg-green-50 text-green-600 border-green-100 dark:bg-green-500/10 dark:text-green-400",
    Rejected:
      "bg-red-50 text-red-600 border-red-100 dark:bg-red-500/10 dark:text-red-400",
  };
  return (
    <span
      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border whitespace-nowrap ${
        config[status] || config["Pending"]
      }`}
    >
      {status}
    </span>
  );
}
