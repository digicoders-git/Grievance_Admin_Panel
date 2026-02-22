import { useState } from "react";
import { useNavigate } from "react-router";
import PageMeta from "../components/common/PageMeta";
import * as XLSX from "xlsx";
import { bulkCreateStudentsApi } from "../apis/student";
import toast from "react-hot-toast";
import Loader from "../components/common/Loader";

export default function StudentImportPreview() {
  const [data, setData] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const jsonData = XLSX.utils.sheet_to_json(ws);

        if (jsonData.length > 0) {
          const requiredFields = ["name", "enrollmentNumber", "dob"];
          const headers = Object.keys(jsonData[0]);
          const missingFields = requiredFields.filter(
            (field) => !headers.includes(field),
          );

          if (missingFields.length > 0) {
            toast.error(`Invalid Format! Missing: ${missingFields.join(", ")}`);
            e.target.value = "";
            return;
          }
        } else {
          toast.error("Excel file is empty");
          return;
        }

        const parsedData = jsonData.map((item, index) => ({
          ...item,
          previewId: index,
          enrollmentNumber: item.enrollmentNumber?.toString() || "",
          dob: item.dob?.toString() || "",
          mobile: item.mobile?.toString() || "",
        }));

        setData(parsedData);
        setSelectedIds(new Set(parsedData.map((d) => d.previewId)));
      } catch (err) {
        toast.error("Error reading Excel file");
      }
    };
    reader.readAsBinaryString(file);
  };

  const toggleSelect = (id) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === data.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(data.map((d) => d.previewId)));
    }
  };

  const handleImport = async () => {
    const studentsToImport = data.filter((d) => selectedIds.has(d.previewId));
    if (studentsToImport.length === 0) {
      toast.error("Please select at least one student");
      return;
    }

    setLoading(true);
    try {
      const finalData = studentsToImport.map(({ previewId, ...rest }) => rest);
      const res = await bulkCreateStudentsApi(finalData);
      toast.success(
        `Imported: ${res.results.imported}, Skipped: ${res.results.skipped}`,
      );
      setTimeout(() => navigate("/students"), 2000);
    } catch (error) {
      toast.error(error.response?.data?.message || "Import failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageMeta
        title="Excel Preview | GRS Admin"
        description="Preview and select students from excel"
      />

      <div className="space-y-6 max-w-full overflow-x-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Excel Import Preview
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Step 1: Upload &rarr; Step 2: Select &rarr; Step 3: Import
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate("/students")}
              className="px-4 py-2 text-gray-600 dark:text-gray-300 font-medium hover:text-gray-900"
            >
              Cancel
            </button>
            <label className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-sm font-bold cursor-pointer transition-all shadow-md">
              Choose Excel File
              <input
                type="file"
                className="hidden"
                accept=".xlsx, .xls"
                onChange={handleFileChange}
              />
            </label>
          </div>
        </div>

        {data.length > 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center bg-gray-50/50 dark:bg-gray-700/30 gap-4">
              <div className="flex items-center gap-4">
                <p className="text-sm font-bold text-gray-700 dark:text-gray-200">
                  Total: <span className="text-brand-500">{data.length}</span>
                </p>
                <p className="text-sm font-bold text-gray-700 dark:text-gray-200">
                  Selected:{" "}
                  <span className="text-green-500">{selectedIds.size}</span>
                </p>
              </div>
              <button
                onClick={handleImport}
                disabled={loading || selectedIds.size === 0}
                className="w-full sm:w-auto px-8 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-bold shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader size="h-5 w-5" className="text-white" />
                    Importing...
                  </>
                ) : (
                  `Import Selected (${selectedIds.size})`
                )}
              </button>
            </div>

            <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700">
              <div className="min-w-[1000px]">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      <th className="px-6 py-4 w-10">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-gray-300 text-brand-500"
                          checked={selectedIds.size === data.length}
                          onChange={toggleSelectAll}
                        />
                      </th>
                      {Object.keys(data[0] || {})
                        .filter((k) => k !== "previewId")
                        .map((header) => (
                          <th
                            key={header}
                            className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                          >
                            {header}
                          </th>
                        ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {data.map((row) => (
                      <tr
                        key={row.previewId}
                        className={`hover:bg-brand-50/30 dark:hover:bg-brand-900/10 transition-colors cursor-pointer ${selectedIds.has(row.previewId) ? "bg-brand-50/10" : "opacity-40"}`}
                        onClick={() => toggleSelect(row.previewId)}
                      >
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            className="w-4 h-4 rounded"
                            checked={selectedIds.has(row.previewId)}
                            readOnly
                          />
                        </td>
                        {Object.entries(row)
                          .filter(([k]) => k !== "previewId")
                          .map(([key, val]) => (
                            <td
                              key={key}
                              className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300"
                            >
                              {val}
                            </td>
                          ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-3xl p-10 py-20 text-center">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              No File Uploaded
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Upload an excel file to preview your students.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
