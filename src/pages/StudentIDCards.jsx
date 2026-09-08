import { useState, useEffect, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useReactToPrint } from "react-to-print";
import { Printer, GraduationCap, Users } from "lucide-react";
import toast from "react-hot-toast";
import axiosInstance from "../api/axiosInstance";

export default function StudentIDCards() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const componentRef = useRef(null);

  // Setup React To Print v7+
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: "Student_ID_Cards",
  });

  // Fetch classes on mount
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const { data } = await axiosInstance.get("/classes");
        const classList = Array.isArray(data) ? data : data?.classes || [];
        setClasses(classList);
        if (classList.length > 0) setSelectedClass(classList[0]._id);
      } catch (error) {
        toast.error("មិនអាចទាញយកទិន្នន័យថ្នាក់រៀនបានទេ");
      }
    };
    fetchClasses();
  }, []);

  // Fetch students when selectedClass changes
  useEffect(() => {
    if (!selectedClass) return;

    const fetchStudents = async () => {
      setLoading(true);
      try {
        const { data } = await axiosInstance.get(
          `/students?classId=${selectedClass}`,
        );

        // ការពារបញ្ហា Data Structure ត្រឡប់មកពី Backend ខុសគ្នា
        if (Array.isArray(data)) {
          setStudents(data);
        } else if (Array.isArray(data?.students)) {
          setStudents(data.students);
        } else {
          setStudents([]);
        }
      } catch (error) {
        toast.error("មិនអាចទាញយកបញ្ជីសិស្សបានទេ");
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [selectedClass]);

  return (
    <div className="space-y-6">
      {/* Control Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm print:hidden">
        <div>
          <h1 className="text-xl font-bold text-slate-800">បោះពុម្ពកាតសិស្ស</h1>
          <p className="text-slate-500 text-xs mt-0.5">
            ជ្រើសរើសថ្នាក់ដើម្បីទាញយក និងបោះពុម្ពកាតសិស្ស
          </p>
        </div>

        <div className="flex items-center gap-3">
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

          <button
            onClick={() => handlePrint()}
            disabled={students.length === 0 || loading}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50 cursor-pointer"
          >
            <Printer size={18} />
            <span>បោះពុម្ពកាត</span>
          </button>
        </div>
      </div>

      {/* Printable Container */}
      <div className="bg-slate-100 p-4 rounded-2xl print:bg-transparent print:p-0">
        {loading ? (
          <div className="text-center py-12 text-slate-500 font-medium">
            កំពុងផ្ទុកទិន្នន័យកាតសិស្ស...
          </div>
        ) : (
          <div
            ref={componentRef}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 print:grid-cols-2 print:gap-4 print:p-4"
          >
            {Array.isArray(students) && students.length > 0 ? (
              students.map((st) => (
                <div
                  key={st._id}
                  className="w-full max-w-[340px] mx-auto bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden flex flex-col justify-between relative print:shadow-none print:border-slate-300 print:break-inside-avoid"
                  style={{ height: "480px" }}
                >
                  {/* Header Card */}
                  <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-4 text-white text-center relative print:bg-blue-800">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <GraduationCap size={22} className="text-blue-200" />
                      <h2 className="font-bold text-base tracking-wide uppercase">
                        សាលារៀន ជំនាន់ថ្មី
                      </h2>
                    </div>
                    <p className="text-[10px] text-blue-200 uppercase tracking-wider">
                      Student Identification Card
                    </p>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 flex-1 flex flex-col items-center justify-between text-center">
                    {/* Photo with Fallback handling */}
                    <div className="w-24 h-28 rounded-xl border-2 border-blue-600 p-1 bg-white shadow-sm -mt-8 z-10 overflow-hidden">
                      <img
                        src={st.photoUrl || "/default-avatar.png"}
                        alt={st.nameLatin || "Student"}
                        className="w-full h-full object-cover rounded-lg"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://via.placeholder.com/150";
                        }}
                      />
                    </div>

                    {/* Student Info */}
                    <div className="space-y-1 my-2">
                      <h3 className="text-lg font-bold text-slate-800">
                        {st.nameKhmer}
                      </h3>
                      <p className="text-xs font-semibold text-slate-500 uppercase">
                        {st.nameLatin}
                      </p>
                      <p className="text-xs text-blue-600 font-medium pt-1">
                        ថ្នាក់រៀន៖{" "}
                        <span className="font-bold">
                          {st.classId?.className || "N/A"}
                        </span>
                      </p>
                    </div>

                    {/* QR Code */}
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 flex flex-col items-center">
                      <QRCodeSVG
                        value={st.customStudentId || st.studentId || st._id}
                        size={70}
                      />
                      <span className="text-[10px] font-mono font-bold text-slate-600 mt-1">
                        {st.customStudentId || st.studentId}
                      </span>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="bg-slate-900 text-slate-400 py-2 px-4 text-[10px] flex items-center justify-between print:bg-slate-900">
                    <span>ឆ្នាំសិក្សា 2025-2026</span>
                    <span className="text-blue-400 font-semibold">
                      VALID STUDENT
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-slate-500">
                មិនមានទិន្នន័យសិស្សនៅក្នុងថ្នាក់នេះទេ
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
