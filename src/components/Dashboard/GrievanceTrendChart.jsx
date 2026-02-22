import Chart from "react-apexcharts";

import Loader from "../common/Loader";

export default function GrievanceTrendChart({ chart, loading }) {
  const months = chart?.months ?? [];
  const series = [
    { name: "Pending", data: chart?.series?.pending ?? [] },
    { name: "In Progress", data: chart?.series?.inProgress ?? [] },
    { name: "Resolved", data: chart?.series?.resolved ?? [] },
    { name: "Rejected", data: chart?.series?.rejected ?? [] },
  ];

  const options = {
    colors: ["#F79009", "#465FFF", "#12B76A", "#F04438"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 220,
      stacked: true,
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "45%",
        borderRadius: 4,
        borderRadiusApplication: "end",
        borderRadiusWhenStacked: "last",
      },
    },
    dataLabels: { enabled: false },
    stroke: { show: false },
    xaxis: {
      categories: months,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: { fontSize: "11px", colors: "#9CA3AF" },
      },
    },
    yaxis: {
      labels: {
        style: { fontSize: "11px", colors: "#9CA3AF" },
        formatter: (v) => Math.floor(v),
      },
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
      fontFamily: "Outfit",
      fontSize: "13px",
      markers: { width: 10, height: 10, radius: 50 },
    },
    grid: {
      yaxis: { lines: { show: true } },
      borderColor: "rgba(107,114,128,0.1)",
    },
    fill: { opacity: 1 },
    tooltip: {
      shared: true,
      intersect: false,
      y: { formatter: (v) => `${v} grievances` },
    },
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex items-start justify-between mb-1">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Grievance Trend
          </h3>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
            Monthly breakdown by status — last 12 months
          </p>
        </div>
      </div>

      {loading ? (
        <div className="h-56 flex items-center justify-center">
          <Loader size="h-8 w-8" text="Loading trend data..." />
        </div>
      ) : (
        <div className="max-w-full overflow-x-auto custom-scrollbar pb-1">
          <div className="-ml-3 min-w-[620px] xl:min-w-full">
            <Chart options={options} series={series} type="bar" height={220} />
          </div>
        </div>
      )}
    </div>
  );
}
