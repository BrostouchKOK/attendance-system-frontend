import { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import {
  Calendar,
  Users,
  Save,
  ArrowUpDown,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  AlertTriangle,
  Loader2,
  Percent,
} from "lucide-react";
import axiosInstance from "../api/axiosInstance";

export default function AttendanceBoard() {
  const [academicYears, setAcademicYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [currentActiveYear, setCurrentActiveYear] = useState("");

  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [attendanceDate, setAttendanceDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [students, setStudents] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [sortBy, setSortBy] = useState("nameKhmer");
  const [sortOrder, setSortOrder] = useState("asc");

  // ១. Fetch បញ្ជីឆ្នាំសិក្សាស្វ័យប្រវត្តិពី Backend
  useEffect(() => {
    const fetchAcademicYears = async () => {
      try {
        const { data } = await axiosInstance.get("/classes/academic-years");

        // គាំទ្រទាំង Array ធម្មតា ឬ Object { years, activeYear }
        const yearList = Array.isArray(data) ? data : data.years || [];
        const active = data.activeYear || yearList[0] || "";

        setAcademicYears(yearList);
        if (yearList.length > 0) {
          setSelectedYear(active);
          setCurrentActiveYear(active);
        }
      } catch (error) {
        toast.error("មិនអាចទាញយកទិន្នន័យឆ្នាំសិក្សាបានទេ");
      }
    };

    fetchAcademicYears();
  }, []);

  // ២. Fetch Classes តាម Academic Year ដែលបានជ្រើសរើស
  useEffect(() => {
    if (!selectedYear) return;

    const fetchClassesByYear = async () => {
      try {
        const { data } = await axiosInstance.get(
          `/classes?academicYear=${selectedYear}`,
        );
        setClasses(data);

        if (data.length > 0) {
          setSelectedClass(data[0]._id);
        } else {
          setSelectedClass("");
          setStudents([]);
          setAttendanceData({});
        }
      } catch (error) {
        toast.error("មិនអាចទាញយកទិន្នន័យថ្នាក់រៀនបានទេ");
      }
    };

    fetchClassesByYear();
  }, [selectedYear]);

  // ៣. Fetch students & attendance តាម Class និង Date
  useEffect(() => {
    if (!selectedClass) return;

    const fetchClassAttendance = async () => {
      setLoading(true);
      try {
        const { data } = await axiosInstance.get(
          `/attendances/class/${selectedClass}?date=${attendanceDate}`,
        );

        const fetchedStudents = data.students || [];
        setStudents(fetchedStudents);

        const initialData = {};
        fetchedStudents.forEach((st) => {
          initialData[st.studentId] = {
            status: st.status || "Present",
            remark: st.note || "",
          };
        });

        setAttendanceData(initialData);
      } catch (error) {
        toast.error("មិនអាចទាញយកទិន្នន័យវត្តមានបានទេ");
      } finally {
        setLoading(false);
      }
    };

    fetchClassAttendance();
  }, [selectedClass, attendanceDate]);

  // Logic តម្រៀបបញ្ជីឈ្មោះសិស្ស
  const sortedStudents = useMemo(() => {
    return [...students].sort((a, b) => {
      let nameA = (a[sortBy] || "").toString().toLowerCase();
      let nameB = (b[sortBy] || "").toString().toLowerCase();
      const comparison = nameA.localeCompare(nameB, "km");
      return sortOrder === "asc" ? comparison : -comparison;
    });
  }, [students, sortBy, sortOrder]);

  // Stats & Percentage Calculation (Logic កែសម្រួលត្រឹមត្រូវ)
  const stats = useMemo(() => {
    const total = students.length;
    let present = 0,
      absent = 0,
      permission = 0,
      late = 0;

    Object.values(attendanceData).forEach((item) => {
      if (item.status === "Present") present++;
      else if (item.status === "Absent") absent++;
      else if (item.status === "Permission") permission++;
      else if (item.status === "Late") late++;
    });

    // គណនាភាគរយវត្តមាន៖ (វត្តមាន + មកយឺត) ÷ សិស្សសរុប × 100
    const presentPercentage =
      total > 0 ? Math.round(((present + late) / total) * 100) : 0;

    return { total, present, absent, permission, late, presentPercentage };
  }, [students, attendanceData]);

  const handleStatusChange = (studentId, status) => {
    setAttendanceData((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], status },
    }));
  };

  const handleRemarkChange = (studentId, remark) => {
    setAttendanceData((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], remark },
    }));
  };

  const handleSubmit = async () => {
    if (students.length === 0)
      return toast.error("គ្មានសិស្សសម្រាប់ស្រង់វត្តមានទេ");

    const records = Object.keys(attendanceData).map((studentId) => ({
      studentId,
      status: attendanceData[studentId].status,
      note: attendanceData[studentId].remark,
    }));

    setSubmitting(true);
    try {
      await axiosInstance.post("/attendances/bulk", {
        classId: selectedClass,
        date: attendanceDate,
        records,
      });
      toast.success("រក្សាទុកវត្តមានបានជោគជ័យ!");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "មានបញ្ហាក្នុងការរក្សាទុកវត្តមាន",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const statusOptions = [
    {
      value: "Present",
      label: "វត្តមាន",
      color:
        "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100",
      active: "bg-emerald-600 text-white border-emerald-600",
    },
    {
      value: "Absent",
      label: "អវត្តមាន",
      color: "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100",
      active: "bg-rose-600 text-white border-rose-600",
    },
    {
      value: "Permission",
      label: "ច្បាប់",
      color: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100",
      active: "bg-amber-600 text-white border-amber-600",
    },
    {
      value: "Late",
      label: "យឺត",
      color: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100",
      active: "bg-blue-600 text-white border-blue-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-800">
            ស្រង់វត្តមានសិស្ស
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            ជ្រើសរើសឆ្នាំសិក្សា ថ្នាក់ និងកាលបរិច្ឆេទដើម្បីកត់ត្រាវត្តមាន
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Dropdown ឆ្នាំសិក្សា Dynamic */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
            <span className="text-xs font-semibold text-slate-500">
              ឆ្នាំសិក្សា:
            </span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-transparent text-xs font-bold text-blue-600 outline-none cursor-pointer"
            >
              {academicYears.length === 0 ? (
                <option value="">គ្មានទិន្នន័យ</option>
              ) : (
                academicYears.map((year) => (
                  <option key={year} value={year}>
                    {year} {year === currentActiveYear ? "(បច្ចុប្បន្ន)" : ""}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Sorting */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
            <ArrowUpDown size={16} className="text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-xs font-medium text-slate-700 outline-none cursor-pointer"
            >
              <option value="nameKhmer">តម្រៀបតាម ឈ្មោះខ្មែរ</option>
              <option value="nameLatin">តម្រៀបតាម ឈ្មោះឡាតាំង</option>
            </select>
            <button
              type="button"
              onClick={() =>
                setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
              }
              className="text-xs font-bold text-blue-600 hover:bg-slate-200/60 px-1.5 py-0.5 rounded transition-all"
            >
              {sortOrder === "asc" ? "A-Z" : "Z-A"}
            </button>
          </div>

          {/* Select Class */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
            <Users size={16} className="text-slate-400" />
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="bg-transparent text-sm font-medium text-slate-700 outline-none cursor-pointer"
            >
              {classes.length === 0 ? (
                <option value="">គ្មានថ្នាក់រៀនក្នុងឆ្នាំនេះទេ</option>
              ) : (
                classes.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.className}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Select Date */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
            <Calendar size={16} className="text-slate-400" />
            <input
              type="date"
              value={attendanceDate}
              onChange={(e) => setAttendanceDate(e.target.value)}
              className="bg-transparent text-sm font-medium text-slate-700 outline-none"
            />
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-xl shadow-lg shadow-blue-500/25 transition-all cursor-pointer"
          >
            {submitting ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}
            <span>រក្សាទុកវត្តមាន</span>
          </button>
        </div>
      </div>

      {/* Warning Alert */}
      {selectedYear &&
        currentActiveYear &&
        selectedYear !== currentActiveYear && (
          <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl font-medium">
            <AlertTriangle size={16} className="text-amber-600 shrink-0" />
            <span>
              សម្គាល់៖ អ្នកកំពុងមើល/ស្រង់វត្តមានសម្រាប់ឆ្នាំសិក្សាចាស់ (ឆ្នាំ{" "}
              {selectedYear})។
            </span>
          </div>
        )}

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs text-slate-500 font-medium">សិស្សសរុប</p>
            <h3 className="text-xl font-bold text-slate-800 mt-1">
              {stats.total} នាក់
            </h3>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-100 text-slate-600">
            <Users size={20} />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs text-slate-500 font-medium">វត្តមាន</p>
            <h3 className="text-xl font-bold text-emerald-600 mt-1">
              {stats.present} នាក់
            </h3>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 size={20} />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs text-slate-500 font-medium">អវត្តមាន</p>
            <h3 className="text-xl font-bold text-rose-600 mt-1">
              {stats.absent} នាក់
            </h3>
          </div>
          <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600">
            <XCircle size={20} />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs text-slate-500 font-medium">ច្បាប់</p>
            <h3 className="text-xl font-bold text-amber-600 mt-1">
              {stats.permission} នាក់
            </h3>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
            <FileText size={20} />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs text-slate-500 font-medium">មកយឺត</p>
            <h3 className="text-xl font-bold text-blue-600 mt-1">
              {stats.late} នាក់
            </h3>
          </div>
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
            <Clock size={20} />
          </div>
        </div>

        {/* Card បង្ហាញភាគរយវត្តមាន */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-sm col-span-2 sm:col-span-1">
          <div>
            <p className="text-xs text-slate-500 font-medium">ភាគរយវត្តមាន</p>
            <h3 className="text-xl font-bold text-indigo-600 mt-1">
              {stats.presentPercentage}%
            </h3>
          </div>
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
            <Percent size={20} />
          </div>
        </div>
      </div>

      {/* Student List Table */}
      {loading ? (
        <div className="bg-white rounded-2xl p-12 text-center text-slate-500 border border-slate-200 flex items-center justify-center gap-2">
          <Loader2 size={20} className="animate-spin text-blue-600" />
          <span>កំពុងផ្ទុកបញ្ជីសិស្ស...</span>
        </div>
      ) : sortedStudents.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center text-slate-500 border border-slate-200">
          មិនមានសិស្សនៅក្នុងថ្នាក់នេះទេ
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-xs text-slate-500 uppercase font-semibold">
                <th className="p-4">រូបថត & ឈ្មោះ</th>
                <th className="p-4">អត្តលេខ</th>
                <th className="p-4 text-center">ស្ថានភាពវត្តមាន</th>
                <th className="p-4">ចំណាំ / មូលហេតុ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {sortedStudents.map((st) => {
                const currentStatus =
                  attendanceData[st.studentId]?.status || "Present";
                return (
                  <tr
                    key={st.studentId}
                    className="hover:bg-slate-50/60 transition-colors"
                  >
                    <td className="p-4 flex items-center gap-3">
                      <img
                        src={st.photoUrl || "/default-avatar.png"}
                        alt={st.nameLatin}
                        className="w-10 h-10 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <p className="font-semibold text-slate-800">
                          {st.nameKhmer}
                        </p>
                        <p className="text-xs text-slate-400 uppercase">
                          {st.nameLatin}
                        </p>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-xs font-semibold text-blue-600">
                      {st.customStudentId || st.studentId}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-1.5">
                        {statusOptions.map((opt) => {
                          const isSelected = currentStatus === opt.value;
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() =>
                                handleStatusChange(st.studentId, opt.value)
                              }
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                                isSelected ? opt.active : opt.color
                              }`}
                            >
                              {opt.label}
                            </button>
                          );
                        })}
                      </div>
                    </td>
                    <td className="p-4">
                      <input
                        type="text"
                        placeholder="ចំណាំផ្សេងៗ..."
                        value={attendanceData[st.studentId]?.remark || ""}
                        onChange={(e) =>
                          handleRemarkChange(st.studentId, e.target.value)
                        }
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
