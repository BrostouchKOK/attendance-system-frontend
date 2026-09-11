import { useState, useEffect, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { Printer, Users } from "lucide-react";
import toast from "react-hot-toast";
import axiosInstance from "../api/axiosInstance";

// Component សម្រាប់កាតសិស្សម្នាក់ៗ (Single Card)
const SingleStudentCard = ({ st, formatDate }) => {
  const cardRef = useRef(null);

  const handleSinglePrint = useReactToPrint({
    contentRef: cardRef,
    documentTitle: `Student_Card_${st.customStudentId || st.studentId}`,
  });

  return (
    <div className="flex flex-col items-center gap-2">
      {/* ប៊ូតុង Print សម្រាប់សិស្សម្នាក់នេះ */}
      <button
        onClick={() => handleSinglePrint()}
        className="print:hidden flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-900 text-white text-xs font-medium rounded-lg shadow transition cursor-pointer self-end"
      >
        <Printer size={13} />
        <span>Print កាតនេះ</span>
      </button>

      {/* រូបរាងកាតសិស្ស */}
      <div
        ref={cardRef}
        style={{
          width: "8.5cm",
          height: "5.4cm",
          boxSizing: "border-box",
        }}
        className="bg-white border-[3px] border-blue-700 rounded-sm relative p-1.5 flex flex-col justify-between overflow-hidden shadow-sm print:shadow-none print:break-inside-avoid font-battambang"
      >
        {/* Blue Vertical Borders */}
        <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-blue-700"></div>
        <div className="absolute top-0 right-0 bottom-0 w-1.5 bg-blue-700"></div>

        {/* Header Section */}
        <div className="flex items-start gap-1.5 pl-2 pr-2 pt-0">
          {/* Logo */}
          <img
            src="/school-logo.png"
            alt="Logo"
            className="w-14 h-14 object-contain shrink-0 -mt-1"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://via.placeholder.com/55";
            }}
          />
          <div className="flex-1 text-center">
            {/* ឈ្មោះសាលាខ្មែរ */}
            <h2 className="text-[11.5px] font-moul text-amber-500 leading-snug">
              សាលាសិលាមាសនៃអង្គការក្តីសង្ឃឹម
            </h2>
            {/* ឈ្មោះសាលាអង់គ្លេស */}
            <h3 className="text-[10.5px] font-['Arial_Black',sans-serif] text-amber-500 leading-tight tracking-tight uppercase">
              GOLDSTONE SCHOOL OF HOPE
            </h3>

            {/* បន្ទាត់ពណ៌ខៀវ */}
            <div className="flex justify-center my-0.5">
              <div className="w-[85%] h-[2px] bg-blue-700"></div>
            </div>

            {/* Title អង់គ្លេស */}
            <p className="text-[10px] font-['Arial_Black',sans-serif] text-blue-700 tracking-wider uppercase leading-tight">
              STUDENT IDENTITY CARD
            </p>
          </div>
        </div>

        {/* Body Content Section */}
        <div className="flex gap-2 pl-2 pr-2 my-auto items-center">
          {/* Student Photo */}
          <div className="w-[2.2cm] h-[2.7cm] border border-slate-300 shrink-0 bg-slate-100 overflow-hidden shadow-xs">
            <img
              src={st.photoUrl || "/default-avatar.png"}
              alt={st.nameLatin || "Student"}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://via.placeholder.com/100x120";
              }}
            />
          </div>

          {/* Student Info */}
          <div className="flex-1 text-center space-y-0.5 leading-snug">
            {/* ឈ្មោះសិស្សខ្មែរ */}
            <h4 className="text-[14.5px] font-moul text-black leading-tight">
              {st.nameKhmer}
            </h4>
            {/* ឈ្មោះឡាតាំង */}
            <p className="text-[11.5px] font-['Arial_Black',sans-serif] text-black uppercase tracking-wide">
              {st.nameLatin}
            </p>
            {/* ថ្ងៃខែឆ្នាំកំណើត, ថ្នាក់ទី, ឆ្នាំសិក្សា */}
            <p className="text-[12px] text-black font-medium leading-tight">
              ថ្ងៃខែឆ្នាំកំណើត:{" "}
              <span className="font-bold text-[12.5px]">
                {formatDate(st.dateOfBirth || st.dob)}
              </span>
            </p>
            <p className="text-[12px] text-black font-medium leading-tight">
              ថ្នាក់ទី:{" "}
              <span className="font-bold text-[12.5px]">
                {st.classId?.className || "N/A"}
              </span>
            </p>
            <p className="text-[12px] text-black font-medium leading-tight">
              ឆ្នាំសិក្សា:{" "}
              <span className="font-bold text-[12.5px]">
                {st.academicYear || "២០២៥-២០២៦"}
              </span>
            </p>
          </div>
        </div>

        {/* Footer Section */}
        <div className="w-full px-1 pb-0.5">
          {/* អត្តលេខ */}
          <div className="flex justify-between items-end mb-0.5 px-1">
            <span className="text-[12.5px] font-bold text-red-600 font-battambang">
              អត្តលេខ: {st.customStudentId || st.studentId}
            </span>
          </div>
          {/* អាសយដ្ឋាន Footer */}
          <p className="text-[11px] text-black text-center leading-tight font-battambang font-medium whitespace-nowrap overflow-hidden tracking-tighter">
            ផ្ទះលេខ៤១, ផ្លូវ៣១៧ កែង៥៧០, សង្កាត់បឹងកក់២, ខណ្ឌទួលគោក,
            រាជធានីភ្នំពេញ
          </p>
        </div>
      </div>
    </div>
  );
};

export default function StudentIDCards() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const componentRef = useRef(null);

  const handleBatchPrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: "All_Student_ID_Cards",
  });

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

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

    const toKhmerNum = (num) => {
      const khmerNums = ["០", "១", "២", "៣", "៤", "៥", "៦", "៧", "៨", "៩"];
      return num
        .toString()
        .split("")
        .map((n) => khmerNums[parseInt(n)] || n)
        .join("");
    };

    const day = date.getDate();
    const formattedDay = day < 10 ? `០${toKhmerNum(day)}` : toKhmerNum(day);
    const month = khmerMonths[date.getMonth()];
    const year = toKhmerNum(date.getFullYear());

    return `${formattedDay}-${month}-${year}`;
  };

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

  useEffect(() => {
    if (!selectedClass) return;

    const fetchStudents = async () => {
      setLoading(true);
      try {
        // បន្ថែម limit=1000 ដើម្បីទាញយកសិស្សទាំងអស់ក្នុងថ្នាក់នោះដោយមិនជាប់ Pagination ត្រឹម 10 នាក់
        const { data } = await axiosInstance.get(
          `/students?classId=${selectedClass}&limit=1000`,
        );
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
            onClick={() => handleBatchPrint()}
            disabled={students.length === 0 || loading}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50 cursor-pointer"
          >
            <Printer size={18} />
            <span>បោះពុម្ពកាតទាំងថ្នាក់ ({students.length})</span>
          </button>
        </div>
      </div>

      {/* Printable Container */}
      <div className="bg-slate-100 p-6 rounded-2xl print:bg-transparent print:p-0">
        {loading ? (
          <div className="text-center py-12 text-slate-500 font-medium">
            កំពុងផ្ទុកទិន្នន័យកាតសិស្ស...
          </div>
        ) : (
          <div
            ref={componentRef}
            className="flex flex-wrap gap-6 justify-center print:gap-4 print:p-0"
          >
            {Array.isArray(students) && students.length > 0 ? (
              students.map((st) => (
                <SingleStudentCard
                  key={st._id}
                  st={st}
                  formatDate={formatDate}
                />
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
