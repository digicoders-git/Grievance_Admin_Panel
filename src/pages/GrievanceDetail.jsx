import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import PageMeta from "../components/common/PageMeta";
import Modal from "../components/common/Modal";
import { getStudentByIdApi } from "../apis/student";
import { getOfficerByIdApi } from "../apis/officer";
import toast, { Toaster } from "react-hot-toast";
import Loader from "../components/common/Loader";

export default function GrievanceDetail() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const g = state?.grievance;

  const [studentModal, setStudentModal] = useState(false);
  const [officerModal, setOfficerModal] = useState(false);
  const [studentData, setStudentData] = useState(null);
  const [officerData, setOfficerData] = useState(null);
  const [fetchingStudent, setFetchingStudent] = useState(false);
  const [fetchingOfficer, setFetchingOfficer] = useState(false);

  if (!g) {
    navigate(-1);
    return null;
  }

  const openStudentModal = async () => {
    setStudentModal(true);
    if (studentData) return; // already fetched
    setFetchingStudent(true);
    try {
      const data = await getStudentByIdApi(g.studentId._id);
      setStudentData(data);
    } catch {
      toast.error("Failed to fetch student details");
    } finally {
      setFetchingStudent(false);
    }
  };

  const openOfficerModal = async () => {
    setOfficerModal(true);
    if (officerData) return;
    setFetchingOfficer(true);
    try {
      const data = await getOfficerByIdApi(g.handledBy._id);
      setOfficerData(data);
    } catch {
      toast.error("Failed to fetch officer details");
    } finally {
      setFetchingOfficer(false);
    }
  };

  return (
    <>
      <PageMeta
        title="Grievance Details | GRS Admin"
        description="View grievance details"
      />
      <Toaster position="top-right" containerStyle={{ zIndex: 999999 }} />

      <div className="max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Grievance Details
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Full information of the submitted grievance.
            </p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-brand-600 transition-all"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to List
          </button>
        </div>

        {/* Main Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="p-6 md:p-8 space-y-7">
            {/* ID + Status */}
            <div className="flex items-center justify-between pb-6 border-b border-gray-100 dark:border-gray-700">
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                  Grievance ID
                </p>
                <p className="text-sm font-bold text-gray-900 dark:text-white font-mono mt-0.5">
                  #{g._id.slice(-8).toUpperCase()}
                </p>
              </div>
              <StatusBadge status={g.status} />
            </div>

            {/* Subject */}
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-tight">
                Subject
              </p>
              <p className="text-base font-semibold text-gray-900 dark:text-white">
                {g.subject}
              </p>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-tight">
                Description
              </p>
              <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">
                  {g.description}
                </p>
              </div>
            </div>

            {/* Student + Officer */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6 border-b border-gray-100 dark:border-gray-700">
              {/* Student */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-tight">
                  Student
                </p>
                {g.studentId ? (
                  <div className="flex items-center justify-between gap-3 p-3 bg-gray-50 dark:bg-gray-900/40 rounded-xl border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center text-brand-600 font-bold text-sm uppercase shrink-0">
                        {g.studentId.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">
                          {g.studentId.name}
                        </p>
                        <p className="text-xs text-gray-400 font-mono">
                          {g.studentId.enrollmentNumber}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={openStudentModal}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs font-bold rounded-lg hover:bg-brand-100 transition-all border border-brand-100 dark:border-brand-500/20 shrink-0"
                    >
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                      View
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic">
                    Unknown student
                  </p>
                )}
              </div>

              {/* Handled By */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-tight">
                  Handled By
                </p>
                {g.handledBy ? (
                  <div className="flex items-center justify-between gap-3 p-3 bg-gray-50 dark:bg-gray-900/40 rounded-xl border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 font-bold text-sm uppercase shrink-0">
                        {g.handledBy.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">
                          {g.handledBy.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {g.handledBy.department}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={openOfficerModal}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-lg hover:bg-indigo-100 transition-all border border-indigo-100 dark:border-indigo-500/20 shrink-0"
                    >
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                      View
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic">
                    Not assigned yet
                  </p>
                )}
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-tight">
                  Submitted On
                </p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {new Date(g.createdAt).toLocaleString("en-IN")}
                </p>
              </div>
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-tight">
                  Deadline
                </p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {new Date(g.deadline).toLocaleDateString("en-IN")}
                </p>
              </div>
            </div>

            {/* Officer Remarks */}
            {g.remarks && (
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-tight">
                  Officer Remarks
                </p>
                <div className="p-4 bg-orange-50 dark:bg-orange-500/5 rounded-xl border border-orange-100 dark:border-orange-500/10">
                  <p className="text-sm text-orange-800 dark:text-orange-300 italic leading-relaxed">
                    {g.remarks}
                  </p>
                </div>
              </div>
            )}

            {/* Attachment */}
            {g.attachment && (
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-tight">
                  Attachment
                </p>
                <a
                  href={g.attachment}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 text-sm font-semibold rounded-xl hover:bg-brand-100 transition-all border border-brand-100 dark:border-brand-500/20"
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                  </svg>
                  View Attachment
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Student Modal */}
      <Modal
        isOpen={studentModal}
        onClose={() => setStudentModal(false)}
        title="Student Details"
        maxWidth="max-w-lg"
      >
        {fetchingStudent ? (
          <div className="py-20 text-center">
            <Loader text="Loading student details..." size="h-8 w-8" />
          </div>
        ) : studentData ? (
          <div className="space-y-5">
            {/* Avatar + Name */}
            <div className="flex items-center gap-4 pb-5 border-b border-gray-100 dark:border-gray-700">
              <div className="w-14 h-14 rounded-full bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center text-brand-600 font-bold text-xl uppercase">
                {studentData.name?.charAt(0)}
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {studentData.name}
                </p>
                <p className="text-xs text-gray-400 font-mono">
                  {studentData.enrollmentNumber}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-y-5 gap-x-6">
              <InfoRow label="DOB / Password" value={studentData.dob} />
              <InfoRow
                label="Custom Password"
                value={studentData.password || "Not set"}
                highlight
              />
              <InfoRow label="Mobile" value={studentData.mobile || "—"} />
              <InfoRow label="Email" value={studentData.email || "—"} />
              <InfoRow label="Branch" value={studentData.branch || "—"} />
              <InfoRow label="Year" value={studentData.year || "—"} />
              <div className="col-span-2">
                <InfoRow label="College" value={studentData.college || "—"} />
              </div>
              <div className="col-span-2">
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                  Account Status
                </p>
                <span
                  className={`mt-1 inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${studentData.isActive ? "bg-green-50 text-green-600 border-green-100" : "bg-red-50 text-red-500 border-red-100"}`}
                >
                  {studentData.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>

      {/* Officer Modal */}
      <Modal
        isOpen={officerModal}
        onClose={() => setOfficerModal(false)}
        title="Officer Details"
        maxWidth="max-w-lg"
      >
        {fetchingOfficer ? (
          <div className="py-20 text-center">
            <Loader text="Loading officer details..." size="h-8 w-8" />
          </div>
        ) : officerData ? (
          <div className="space-y-5">
            {/* Avatar + Name */}
            <div className="flex items-center gap-4 pb-5 border-b border-gray-100 dark:border-gray-700">
              <div className="w-14 h-14 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 font-bold text-xl uppercase">
                {officerData.name?.charAt(0)}
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {officerData.name}
                </p>
                <p className="text-xs text-gray-400">
                  {officerData.designation} · {officerData.department}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-y-5 gap-x-6">
              <InfoRow label="Mobile" value={officerData.mobile || "—"} />
              <InfoRow label="Email" value={officerData.email || "—"} />
              <InfoRow
                label="Designation"
                value={officerData.designation || "—"}
              />
              <InfoRow
                label="Department"
                value={officerData.department || "—"}
              />
              <div className="col-span-2">
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                  Account Status
                </p>
                <span
                  className={`mt-1 inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${officerData.isActive ? "bg-green-50 text-green-600 border-green-100" : "bg-red-50 text-red-500 border-red-100"}`}
                >
                  {officerData.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </>
  );
}

function InfoRow({ label, value, highlight }) {
  return (
    <div>
      <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
        {label}
      </p>
      <p
        className={`text-sm font-semibold mt-0.5 ${highlight ? "text-brand-500" : "text-gray-900 dark:text-white"}`}
      >
        {value}
      </p>
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
      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border whitespace-nowrap ${config[status] || config["Pending"]}`}
    >
      {status}
    </span>
  );
}
