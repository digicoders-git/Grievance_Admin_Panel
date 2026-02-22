import { Link } from "react-router";

import Loader from "../common/Loader";

const statusStyles = {
  Pending:
    "bg-warning-50 text-warning-600 dark:bg-warning-500/10 dark:text-warning-400",
  "In Progress":
    "bg-blue-light-50 text-blue-light-600 dark:bg-blue-light-500/10 dark:text-blue-light-400",
  Resolved:
    "bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-500",
  Rejected:
    "bg-error-50 text-error-600 dark:bg-error-500/10 dark:text-error-400",
};

export default function RecentGrievancesTable({ rows, loading }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex items-center justify-between px-5 pt-5 sm:px-6 sm:pt-6 pb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Recent Grievances
          </h3>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
            Latest 5 submitted grievances
          </p>
        </div>
        <Link
          to="/grievances"
          className="text-sm font-medium text-brand-500 hover:text-brand-600 dark:text-brand-400"
        >
          View all →
        </Link>
      </div>

      {loading ? (
        <Loader size="h-8 w-8" className="py-20" />
      ) : !rows || rows.length === 0 ? (
        <div className="flex items-center justify-center py-10 text-gray-400 text-sm">
          No grievances found.
        </div>
      ) : (
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-t border-gray-100 dark:border-gray-800 text-left">
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 sm:px-6">
                  Student
                </th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400">
                  Subject
                </th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400">
                  Handled By
                </th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400">
                  Status
                </th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 sm:px-6">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {rows.map((g) => (
                <tr
                  key={g._id}
                  className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-5 py-3.5 sm:px-6">
                    <p className="font-medium text-gray-800 dark:text-white/90 whitespace-nowrap">
                      {g.studentId?.name ?? "—"}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                      {g.studentId?.enrollmentNumber ?? ""}
                    </p>
                  </td>
                  <td className="px-5 py-3.5 text-gray-600 dark:text-gray-300 max-w-[180px] truncate">
                    {g.subject}
                  </td>
                  <td className="px-5 py-3.5 text-gray-600 dark:text-gray-300 whitespace-nowrap">
                    {g.handledBy?.name ?? (
                      <span className="text-gray-400 dark:text-gray-500 italic">
                        Unassigned
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[g.status] ?? ""}`}
                    >
                      {g.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 sm:px-6 text-gray-500 dark:text-gray-400 whitespace-nowrap text-xs">
                    {new Date(g.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
