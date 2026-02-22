import { useEffect, useState } from "react";
import { getDashboardStats } from "../../apis/admin";

import Loader from "../common/Loader";

const statusColors = {
  Pending: {
    bg: "bg-warning-50 dark:bg-warning-500/10",
    text: "text-warning-600 dark:text-warning-400",
  },
  "In Progress": {
    bg: "bg-blue-light-50 dark:bg-blue-light-500/10",
    text: "text-blue-light-600 dark:text-blue-light-400",
  },
  Resolved: {
    bg: "bg-success-50 dark:bg-success-500/10",
    text: "text-success-600 dark:text-success-400",
  },
  Rejected: {
    bg: "bg-error-50 dark:bg-error-500/10",
    text: "text-error-600 dark:text-error-400",
  },
};

const MetricCard = ({ icon, label, value, sub, subLabel, loading }) => (
  <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03] md:p-5">
    <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-xl dark:bg-gray-800 transition-colors">
      {icon}
    </div>
    <div className="mt-4">
      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
        {label}
      </span>
      {loading ? (
        <div className="mt-1">
          <Loader size="h-6 w-6" className="justify-start" />
        </div>
      ) : (
        <div className="flex items-baseline justify-between mt-1">
          <div>
            <h4 className="font-bold text-gray-800 text-xl dark:text-white/90">
              {value?.toLocaleString() ?? "0"}
            </h4>
            {sub !== undefined && (
              <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                <span className="text-success-500 font-bold">{sub}</span>{" "}
                {subLabel}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  </div>
);

export default function EcommerceMetrics({ stats, loading }) {
  const grievances = stats?.grievances;
  const students = stats?.students;
  const officers = stats?.officers;

  const cards = [
    {
      label: "Total Students",
      value: students?.total,
      sub: students?.active,
      subLabel: "active",
      icon: (
        <svg
          className="text-gray-800 size-5 dark:text-white/90"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M17 20h5v-2a4 4 0 00-5.356-3.712M9 20H4v-2a4 4 0 015.356-3.712M15 8a4 4 0 11-8 0 4 4 0 018 0zm6 4a2 2 0 11-4 0 2 2 0 014 0zM3 12a2 2 0 114 0 2 2 0 01-4 0z"
          />
        </svg>
      ),
    },
    {
      label: "Redressal Officers",
      value: officers?.total,
      sub: officers?.active,
      subLabel: "active",
      icon: (
        <svg
          className="text-gray-800 size-5 dark:text-white/90"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
      ),
    },
    {
      label: "Total Grievances",
      value: grievances?.total,
      sub: grievances?.pending,
      subLabel: "pending",
      icon: (
        <svg
          className="text-gray-800 size-5 dark:text-white/90"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
      ),
    },
    {
      label: "Resolved",
      value: grievances?.resolved,
      sub: grievances?.inProgress,
      subLabel: "in progress",
      icon: (
        <svg
          className="text-gray-800 size-5 dark:text-white/90"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 md:gap-6">
        {cards.map((c) => (
          <MetricCard key={c.label} {...c} loading={loading} />
        ))}
      </div>

      {/* Grievance status breakdown row */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03] md:p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-white/60">
            Status Breakdown
          </p>
        </div>
        {loading ? (
          <Loader text="Loading breakdown..." />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { key: "Pending", val: grievances?.pending },
              { key: "In Progress", val: grievances?.inProgress },
              { key: "Resolved", val: grievances?.resolved },
              { key: "Rejected", val: grievances?.rejected },
            ].map(({ key, val }) => {
              const col = statusColors[key];
              return (
                <div key={key} className={`rounded-xl px-3 py-2.5 ${col.bg}`}>
                  <p
                    className={`text-[10px] font-bold uppercase tracking-tight ${col.text}`}
                  >
                    {key}
                  </p>
                  <p className={`text-xl font-bold mt-0.5 ${col.text}`}>
                    {val ?? 0}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
