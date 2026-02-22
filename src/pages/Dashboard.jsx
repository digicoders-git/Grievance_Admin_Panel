import { useState, useEffect } from "react";
import PageMeta from "../components/common/PageMeta";
import EcommerceMetrics from "../components/Dashboard/EcommerceMetrics";
import GrievanceTrendChart from "../components/Dashboard/GrievanceTrendChart";
import RecentGrievancesTable from "../components/Dashboard/RecentGrievancesTable";
import { getDashboardStats } from "../apis/admin";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [chart, setChart] = useState(null);
  const [recentGrievances, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getDashboardStats()
      .then((data) => {
        if (cancelled) return;
        setStats(data.stats);
        setChart(data.chart);
        setRecent(data.recentGrievances ?? []);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(
          err?.response?.data?.message ?? "Failed to load dashboard data.",
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <PageMeta
        title="Dashboard | Grievance Redressal System"
        description="Admin Dashboard — real-time stats for students, officers, and grievances"
      />

      {error && (
        <div className="mb-4 rounded-xl bg-error-50 border border-error-200 px-4 py-3 text-sm text-error-600 dark:bg-error-500/10 dark:border-error-500/20 dark:text-error-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-12 gap-4 md:gap-6">
        {/* ── Stat Cards ── */}
        <div className="col-span-12">
          <EcommerceMetrics stats={stats} loading={loading} />
        </div>

        {/* ── Grievance Trend Chart ── */}
        <div className="col-span-12">
          <GrievanceTrendChart chart={chart} loading={loading} />
        </div>

        {/* ── Recent Grievances Table ── */}
        <div className="col-span-12">
          <RecentGrievancesTable rows={recentGrievances} loading={loading} />
        </div>
      </div>
    </>
  );
};

export default Dashboard;
