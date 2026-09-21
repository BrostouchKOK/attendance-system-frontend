import { useState, useEffect, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { Printer, Users, FileText, Download, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { toJpeg } from "html-to-image";
import jsPDF from "jspdf";
import axiosInstance from "../api/axiosInstance";

// Component សម្រាប់កាតសិស្សម្នាក់ៗ (Single Card)
const SingleStudentCard = ({ st }) => {
  const cardRef = useRef(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [downloadingJpg, setDownloadingJpg] = useState(false);

  const handleSinglePrint = useReactToPrint({
    contentRef: cardRef,
    documentTitle: `Student_Card_${st.customStudentId || st.studentId}`,
  });

  // 💡 1. អនុគមន៍ទាញយក PDF ទំហំ 8.5cm x 5.4cm (85mm x 54mm) 300 DPI
  const handleDownloadPdf = async () => {
    if (!cardRef.current) return;
    setDownloadingPdf(true);

    try {
      const imgData = await toJpeg(cardRef.current, {
        quality: 1.0,
        pixelRatio: 4,
        backgroundColor: "#ffffff",
      });

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: [85, 54],
      });

      pdf.addImage(imgData, "JPEG", 0, 0, 85, 54);
      pdf.save(`Student_Card_${st.customStudentId || st.studentId || "card"}.pdf`);

      toast.success("ទាញយកកាតជា PDF រួចរាល់!");
    } catch (error) {
      console.error("PDF Download Error:", error);
      toast.error("មានបញ្ហាក្នុងការទាញយក PDF");
    } finally {
      setDownloadingPdf(false);
    }
  };

  // 💡 2. អនុគមន៍ទាញយក JPG កម្រិតច្បាស់ HD (300 DPI = 1004px x 638px) ទំហំ 8.5cm x 5.4cm
  const handleDownloadJpg = async () => {
    if (!cardRef.current) return;
    setDownloadingJpg(true);

    try {
      const rawDataUrl = await toJpeg(cardRef.current, {
        quality: 1.0,
        pixelRatio: 4,
        backgroundColor: "#ffffff",
      });

      const img = new Image();
      img.src = rawDataUrl;
      await new Promise((resolve) => (img.onload = resolve));

      const canvas = document.createElement("canvas");
      canvas.width = 1004; // 8.5cm លើ 300 DPI
      canvas.height = 638; // 5.4cm លើ 300 DPI
      const ctx = canvas.getContext("2d");

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const finalDataUrl = canvas.toDataURL("image/jpeg", 0.98);
      const link = document.createElement("a");
      const fileName = `Student_Card_${st.customStudentId || st.studentId || "card"}.jpg`;
      link.download = fileName;
      link.href = finalDataUrl;
      link.click();

      toast.success("ទាញយកកាតជា JPG រួចរាល់!");
    } catch (error) {
      console.error("JPG Download Error:", error);
      toast.error("មានបញ្ហាក្នុងការទាញយក JPG");
    } finally {
      setDownloadingJpg(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="print:hidden flex items-center gap-1.5 self-end">
        {/* ប៊ូតុងទាញយក JPG */}
        <button
          onClick={handleDownloadJpg}
          disabled={downloadingJpg || downloadingPdf}
          className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-medium rounded-lg shadow transition cursor-pointer"
          title="ទាញយកជា JPG"
        >
          {downloadingJpg ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            <Download size={13} />
          )}
          <span>{downloadingJpg ? "កំពុងទាញ..." : "JPG"}</span>
        </button>

        {/* ប៊ូតុងទាញយក PDF */}
        <button
          onClick={handleDownloadPdf}
          disabled={downloadingJpg || downloadingPdf}
          className="flex items-center gap-1 px-2.5 py-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-medium rounded-lg shadow transition cursor-pointer"
          title="ទាញយកជា PDF"
        >
          {downloadingPdf ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            <FileText size={13} />
          )}
          <span>{downloadingPdf ? "កំពុងទាញ..." : "PDF"}</span>
        </button>

        {/* ប៊ូតុង Print */}
        <button
          onClick={() => handleSinglePrint()}
          className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-900 text-white text-xs font-medium rounded-lg shadow transition cursor-pointer"
        >
          <Printer size={13} />
          <span>Print</span>
        </button>
      </div>

      <div
        ref={cardRef}
        style={{
          width: "8.5cm",
          height: "5.4cm",
          boxSizing: "border-box",
        }}
        className="bg-white rounded-sm relative p-1.5 flex flex-col justify-between overflow-hidden shadow-sm print:shadow-none print:break-inside-avoid font-battambang"
      >
        {/* បន្ទាត់ពណ៌ខៀវអមសងខាងឆ្វេង-ស្តាំ */}
        <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-blue-700"></div>
        <div className="absolute top-0 right-0 bottom-0 w-1.5 bg-blue-700"></div>

        {/* 💡 បង្កើន pl-4 ដើម្បីរំកិល Logo និង Header ចេញពីបន្ទាត់ឆ្វេងបន្តិច */}
        <div className="flex items-start gap-1.5 pl-4 pr-2 pt-0">
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
            <h2 className="text-[11.5px] font-moul text-amber-500 leading-snug">
              សាលាសិលាមាសនៃអង្គការក្តីសង្ឃឹម
            </h2>
            <h3 className="text-[11px] font-['Arial_Black',sans-serif] text-amber-500 leading-tight tracking-tight uppercase">
              GOLDSTONE SCHOOL OF HOPE
            </h3>

            <div className="flex justify-center my-0.5">
              <div className="w-[85%] h-[2px] bg-blue-700"></div>
            </div>

            <p className="text-[11px] font-['Arial_Black',sans-serif] text-blue-700 tracking-wider uppercase leading-tight">
              STUDENT IDENTITY CARD
            </p>
          </div>
        </div>

        {/* 💡 បង្កើន pl-4 ដើម្បីរំកិលរូបថត និងព័ត៌មានសិស្សមកខាងស្តាំបន្តិច */}
        <div className="flex gap-2 pl-4 pr-2 my-auto items-center mt-1">
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

          <div className="flex-1 text-center space-y-1 leading-snug">
            <h4 className="text-[15px] font-moul text-black leading-tight">
              {st.nameKhmer}
            </h4>
            <p className="text-[12px] font-['Arial_Black',sans-serif] text-black uppercase tracking-wide">
              {st.nameLatin}
            </p>

            <p className="text-[14px] text-black font-medium leading-tight mt-0.5">
              ថ្នាក់ទី:{" "}
              <span
                className="font-medium text-[13px]"
                style={{ fontFamily: "Arial, sans-serif" }}
              >
                {st.classId?.className || "N/A"}
              </span>
            </p>

            <p
              className="text-[12.5px] text-black font-medium leading-tight mt-3"
              style={{ fontFamily: "'Khmer OS Bokor', cursive" }}
            >
              ឆ្នាំសិក្សា:{" "}
              <span className="font-medium text-[13px]">
                {st.academicYear || "២០២៦-២០២៧"}
              </span>
            </p>
          </div>
        </div>

        {/* 💡 បង្កើន pl-4 សម្រាប់ផ្នែក Footer ខាងក្រោម */}
        <div className="w-full pl-4 pr-2 pb-0.5">
          <div className="flex justify-between items-end mb-0.5">
            <span
              className="text-[12px] font-bold text-red-600"
              style={{ fontFamily: "'Khmer OS Bokor', cursive" }}
            >
              អត្តលេខ:{" "}
              <span style={{ fontFamily: "Arial, sans-serif" }}>
                {st.customStudentId || st.studentId}
              </span>
            </span>
          </div>

          <p
            className="text-[12px] text-black text-justify font-battambang font-medium leading-tight whitespace-nowrap overflow-visible"
            style={{
              lineHeight: "1",
              wordSpacing: "1px",
            }}
          >
            ផ្ទះលេខ៤១, ផ្លូវ៣១៧ កែង៥៧០, សង្កាត់បឹងកក់២, ខណ្ឌទួលគោក
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
        const { data } = await axiosInstance.get(
          `/students?classId=${selectedClass}&limit=1000`
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
                <SingleStudentCard key={st._id} st={st} />
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