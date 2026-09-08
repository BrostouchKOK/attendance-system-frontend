import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Calendar, Users, FileText, Download } from "lucide-react";
import * as XLSX from "xlsx";
import axiosInstance from "../api/axiosInstance";

export default function AttendanceReport() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);

  // 👈 មុខងារ Format កាលបរិច្ឆេទជាទម្រង់ខ្មែរ (ឧទាហរណ៍៖ 1-កញ្ញា-2026)
  const formatKhmerDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);

    const dayKhmer = date
      .getDate()
      .toString()
      .replace(/[0-9]/g, (d) => "០១២៣៤៥៦៧៨៩"[d]);

    const khmerMonths = [
      "មករា",
      "កុម្ភៈ",
      "មីនា",
      "មេសា",
      "ឧសភា",
      "មិថុនា",
      "កក្កដា",
      "សីហា",
      "កញ្ញា",
      "តុលា",
      "វិច្ឆិកា",
      "ធ្នូ",
    ];
    const monthKhmer = khmerMonths[date.getMonth()];

    const yearKhmer = date
      .getFullYear()
      .toString()
      .replace(/[0-9]/g, (d) => "០១២៣៤៥៦៧៨៩"[d]);

    return `${dayKhmer}-${monthKhmer}-${yearKhmer}`;
  };

  // Fetch classes list
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const { data } = await axiosInstance.get("/classes");
        setClasses(data);
        if (data.length > 0) setSelectedClass(data[0]._id);
      } catch (error) {
        toast.error("មិនអាចទាញយកទិន្នន័យថ្នាក់រៀនបានទេ");
      }
    };
    fetchClasses();
  }, []);

  // Fetch Report Data from Backend
  const fetchReport = async () => {
    if (!selectedClass) return;
    setLoading(true);
    try {
      let url = `/attendances/report/${selectedClass}`;
      if (startDate && endDate) {
        url += `?startDate=${startDate}&endDate=${endDate}`;
      }
      const { data } = await axiosInstance.get(url);
      setReports(data);
    } catch (error) {
      toast.error("មិនអាចទាញយករបាយការណ៍បានទេ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [selectedClass]);

  // Export to Excel Function
  const exportToExcel = () => {
    if (reports.length === 0)
      return toast.error("គ្មានទិន្នន័យសម្រាប់ Export ទេ");

    const excelData = reports.map((item, index) => ({
      "ល.រ": index + 1,
      កាលបរិច្ឆេទ: formatKhmerDate(item.date), // 👈 បំប្លែងកាលបរិច្ឆេទក្នុង Excel
      អត្តលេខសិស្ស: item.studentId?.studentId || "-",
      "ឈ្មោះសិស្ស (ខ្មែរ)": item.studentId?.nameKhmer || "-",
      "ឈ្មោះសិស្ស (ឡាតាំង)": item.studentId?.nameLatin || "-",
      ភេទ: item.studentId?.gender === "Male" ? "ប្រុស" : "ស្រី",
      ស្ថានភាពវត្តមាន:
        item.status === "Present"
          ? "វត្តមាន"
          : item.status === "Absent"
            ? "អវត្តមាន"
            : item.status === "Permission"
              ? "ច្បាប់"
              : "យឺត",
      "ចំណាំ / មូលហេតុ": item.note || "-",
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    worksheet["!cols"] = [
      { wch: 6 },
      { wch: 18 },
      { wch: 15 },
      { wch: 20 },
      { wch: 20 },
      { wch: 8 },
      { wch: 15 },
      { wch: 25 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "របាយការណ៍វត្តមាន");

    const className =
      classes.find((c) => c._id === selectedClass)?.className || "Class";
    XLSX.writeFile(
      workbook,
      `Attendance_Report_${className}_${new Date().toISOString().split("T")[0]}.xlsx`,
    );
    toast.success("ទាញយក File Excel ជោគជ័យ!");
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Present":
        return (
          <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-100 text-emerald-700">
            វត្តមាន
          </span>
        );
      case "Absent":
        return (
          <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-100 text-rose-700">
            អវត្តមាន
          </span>
        );
      case "Permission":
        return (
          <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-100 text-amber-700">
            ច្បាប់
          </span>
        );
      case "Late":
        return (
          <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-100 text-blue-700">
            យឺត
          </span>
        );
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-800">របាយការណ៍វត្តមាន</h1>
          <p className="text-slate-500 text-xs mt-0.5">
            ពិនិត្យប្រវត្តិនៃការស្រង់វត្តមានតាមថ្នាក់ និងចន្លោះថ្ងៃ
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
            <Users size={16} className="text-slate-400" />
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="bg-transparent text-sm font-medium text-slate-700 outline-none cursor-pointer"
            >
              {classes.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.className}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
            <Calendar size={16} className="text-slate-400" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent text-xs font-medium text-slate-700 outline-none"
            />
            <span className="text-slate-400 text-xs">ដល់</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent text-xs font-medium text-slate-700 outline-none"
            />
          </div>

          <button
            onClick={fetchReport}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl shadow-md transition-all"
          >
            <FileText size={16} />
            <span>ទាញទិន្នន័យ</span>
          </button>

          <button
            onClick={exportToExcel}
            disabled={reports.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-medium rounded-xl shadow-md transition-all"
          >
            <Download size={16} />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-12 text-slate-500">
          កំពុងផ្ទុករបាយការណ៍...
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center text-slate-500 border border-slate-200">
          មិនទាន់មានទិន្នន័យរបាយការណ៍ឡើយ
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-xs text-slate-500 uppercase font-semibold">
                <th className="p-4">កាលបរិច្ឆេទ</th>
                <th className="p-4">រូបថត & ឈ្មោះសិស្ស</th>
                <th className="p-4">អត្តលេខ</th>
                <th className="p-4">ស្ថានភាព</th>
                <th className="p-4">ចំណាំ / មូលហេតុ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {reports.map((item) => (
                <tr
                  key={item._id}
                  className="hover:bg-slate-50/60 transition-colors"
                >
                  <td className="p-4 font-semibold text-xs text-slate-700">
                    {formatKhmerDate(item.date)}{" "}
                    {/* 👈 បង្ហាញទម្រង់ ១-កញ្ញា-២០២៦ */}
                  </td>
                  <td className="p-4 flex items-center gap-3">
                    <img
                      src={item.studentId?.photoUrl || "/default-avatar.png"}
                      alt={item.studentId?.nameLatin}
                      className="w-9 h-9 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <p className="font-semibold text-slate-800">
                        {item.studentId?.nameKhmer}
                      </p>
                      <p className="text-xs text-slate-400 uppercase">
                        {item.studentId?.nameLatin}
                      </p>
                    </div>
                  </td>
                  <td className="p-4 font-mono text-xs text-blue-600 font-semibold">
                    {item.studentId?.studentId}
                  </td>
                  <td className="p-4">{getStatusBadge(item.status)}</td>
                  <td className="p-4 text-xs text-slate-500">
                    {item.note || "-"}
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
