import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  Plus,
  Upload,
  Trash2,
  Edit,
  X,
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowRightLeft,
  CheckSquare,
  Square,
  Loader2,
  RefreshCw,
} from "lucide-react";
import axiosInstance from "../api/axiosInstance";

export default function StudentManagement() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  // States សម្រាប់ Search & Pagination
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStudents, setTotalStudents] = useState(0);

  // States សម្រាប់ Bulk Transfer
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [targetClassId, setTargetClassId] = useState("");
  const [transferring, setTransferring] = useState(false);

  // 💡 បានដក dob ចេញពី initialFormState
  const initialFormState = {
    studentId: "",
    nameKhmer: "",
    nameLatin: "",
    gender: "Male",
    classId: "",
    parentPhone: "",
  };

  const [formData, setFormData] = useState(initialFormState);

  // អនុគមន៍សម្រាប់ Auto Generate អត្តលេខសិស្ស
  const generateAutoStudentId = () => {
    if (!students || students.length === 0) return "STU-1001";

    let maxNum = 1000;
    students.forEach((st) => {
      if (st.studentId && st.studentId.startsWith("STU-")) {
        const num = parseInt(st.studentId.split("-")[1], 10);
        if (!isNaN(num) && num > maxNum) {
          maxNum = num;
        }
      }
    });

    return `STU-${maxNum + 1}`;
  };

  // Handle Search Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // ទាញយកបញ្ជីសិស្សតាម Search & Page
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(
        `/students?page=${page}&limit=10&search=${debouncedSearch}&classId=${selectedClass}`
      );
      setStudents(res.data.students || []);
      setTotalPages(res.data.pages || 1);
      setTotalStudents(res.data.totalStudents || 0);
    } catch (error) {
      toast.error("មានបញ្ហាក្នុងការទាញយកទិន្នន័យសិស្ស");
    } finally {
      setLoading(false);
    }
  };

  // ទាញយកបញ្ជីថ្នាក់រៀន
  const fetchClasses = async () => {
    try {
      const res = await axiosInstance.get("/classes");
      setClasses(res.data || []);
    } catch (error) {
      toast.error("មិនអាចទាញយកទិន្នន័យថ្នាក់បានទេ");
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    fetchStudents();
    setSelectedStudentIds([]);
  }, [page, debouncedSearch, selectedClass]);

  // Clean memory URL ពេលប្តូររូប
  useEffect(() => {
    return () => {
      if (previewImage && previewImage.startsWith("blob:")) {
        URL.revokeObjectURL(previewImage);
      }
    };
  }, [previewImage]);

  // Checkbox Handlers
  const handleSelectAll = () => {
    if (selectedStudentIds.length === students.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(students.map((st) => st._id));
    }
  };

  const handleSelectStudent = (id) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Modal Handlers
  const handleOpenCreateModal = () => {
    setEditingId(null);
    setSelectedFile(null);
    setPreviewImage(null);
    setFormData({
      ...initialFormState,
      studentId: generateAutoStudentId(),
    });
    setShowModal(true);
  };

  // 💡 បានដក dob ចេញពី handleOpenEditModal
  const handleOpenEditModal = (st) => {
    setEditingId(st._id);
    setFormData({
      studentId: st.studentId || "",
      nameKhmer: st.nameKhmer || "",
      nameLatin: st.nameLatin || "",
      gender: st.gender || "Male",
      classId: st.classId?._id || st.classId || "",
      parentPhone: st.parentPhone || "",
    });
    setPreviewImage(st.photoUrl || null);
    setSelectedFile(null);
    setShowModal(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  // 💡 បានសំអាត handleSubmit (លុបលក្ខខណ្ឌ dob)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.classId) return toast.error("សូមជ្រើសរើសថ្នាក់រៀន");

    setSubmitting(true);
    const data = new FormData();

    Object.keys(formData).forEach((key) => {
      if (key === "studentId") {
        if (formData.studentId && formData.studentId.trim() !== "") {
          data.append("studentId", formData.studentId.trim());
        }
      } else {
        data.append(key, formData[key]);
      }
    });

    if (selectedFile) data.append("photo", selectedFile);

    try {
      if (editingId) {
        await axiosInstance.put(`/students/${editingId}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("បច្ចុប្បន្នភាពទិន្នន័យសិស្សជោគជ័យ");
      } else {
        await axiosInstance.post("/students", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("បញ្ចូលសិស្សថ្មីជោគជ័យ");
      }

      setShowModal(false);
      setFormData(initialFormState);
      setSelectedFile(null);
      setPreviewImage(null);
      fetchStudents();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "មានបញ្ហាក្នុងការរក្សាទុកទិន្នន័យ"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("តើអ្នកប្រាកដជាចង់លុបទិន្នន័យសិស្សនេះមែនទេ?")) {
      try {
        await axiosInstance.delete(`/students/${id}`);
        toast.success("លុបទិន្នន័យជោគជ័យ");
        fetchStudents();
      } catch (error) {
        toast.error("លុបមិនបានសម្រេច");
      }
    }
  };

  const handleBulkTransferSubmit = async (e) => {
    e.preventDefault();
    if (!targetClassId) return toast.error("សូមជ្រើសរើសថ្នាក់គោលដៅ");

    setTransferring(true);
    try {
      const res = await axiosInstance.put("/students/bulk-transfer", {
        studentIds: selectedStudentIds,
        targetClassId,
      });
      toast.success(res.data.message || "ផ្ទេរសិស្សទៅថ្នាក់ថ្មីជោគជ័យ!");
      setShowTransferModal(false);
      setSelectedStudentIds([]);
      setTargetClassId("");
      fetchStudents();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "មានបញ្ហាក្នុងការផ្ទេរថ្នាក់សិស្ស"
      );
    } finally {
      setTransferring(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">គ្រប់គ្រងសិស្ស</h1>
          <p className="text-slate-500 text-sm">
            សរុបមានសិស្សចំនួន{" "}
            <span className="font-bold text-blue-600">{totalStudents}</span>{" "}
            នាក់
          </p>
        </div>

        <div className="flex items-center gap-3">
          {selectedStudentIds.length > 0 && (
            <button
              onClick={() => setShowTransferModal(true)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-medium shadow-lg shadow-amber-500/25 transition-all"
            >
              <ArrowRightLeft size={18} />
              <span>ផ្ទេរថ្នាក់ ({selectedStudentIds.length} នាក់)</span>
            </button>
          )}

          <button
            onClick={handleOpenCreateModal}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium shadow-lg shadow-blue-500/25 transition-all"
          >
            <Plus size={18} />
            <span>បន្ថែមសិស្សថ្មី</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="text"
            placeholder="ស្វែងរកតាមឈ្មោះ ឬ អត្តលេខសិស្ស..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <select
          value={selectedClass}
          onChange={(e) => {
            setSelectedClass(e.target.value);
            setPage(1);
          }}
          className="px-3.5 py-2.5 bg-white rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
        >
          <option value="">-- គ្រប់ថ្នាក់រៀន --</option>
          {classes.map((c) => (
            <option key={c._id} value={c._id}>
              {c.className} ({c.academicYear})
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50 text-xs text-slate-500 uppercase font-semibold">
              <th className="p-4 w-10 text-center">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-slate-400 hover:text-blue-600"
                >
                  {students.length > 0 &&
                  selectedStudentIds.length === students.length ? (
                    <CheckSquare size={18} className="text-blue-600" />
                  ) : (
                    <Square size={18} />
                  )}
                </button>
              </th>
              <th className="p-4">រូបថត</th>
              <th className="p-4">អត្តលេខ</th>
              <th className="p-4">ឈ្មោះខ្មែរ / អង់គ្លេស</th>
              <th className="p-4">ភេទ</th>
              <th className="p-4">ថ្នាក់រៀន</th>
              <th className="p-4 text-center">សកម្មភាព</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {loading ? (
              <tr>
                <td colSpan="7" className="p-6 text-center text-slate-500">
                  កំពុងផ្ទុកទិន្នន័យ...
                </td>
              </tr>
            ) : students.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-6 text-center text-slate-500">
                  មិនរកឃើញទិន្នន័យសិស្សឡើយ
                </td>
              </tr>
            ) : (
              students.map((st) => {
                const isSelected = selectedStudentIds.includes(st._id);
                return (
                  <tr
                    key={st._id}
                    className={`transition-colors ${
                      isSelected ? "bg-blue-50/40" : "hover:bg-slate-50/80"
                    }`}
                  >
                    <td className="p-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleSelectStudent(st._id)}
                        className="text-slate-400 hover:text-blue-600"
                      >
                        {isSelected ? (
                          <CheckSquare size={18} className="text-blue-600" />
                        ) : (
                          <Square size={18} />
                        )}
                      </button>
                    </td>
                    <td className="p-4">
                      <img
                        src={st.photoUrl || "https://via.placeholder.com/150"}
                        alt={st.nameLatin}
                        className="w-10 h-10 rounded-full object-cover border border-slate-200"
                      />
                    </td>
                    <td className="p-4 font-semibold text-blue-600">
                      {st.studentId || (
                        <span className="text-slate-400 font-normal italic">
                          មិនទាន់មាន
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <p className="font-medium text-slate-800">
                        {st.nameKhmer}
                      </p>
                      <p className="text-xs text-slate-400 uppercase">
                        {st.nameLatin}
                      </p>
                    </td>
                    <td className="p-4 text-slate-600">
                      {st.gender === "Female" ? "ស្រី" : "ប្រុស"}
                    </td>
                    <td className="p-4 text-slate-600">
                      {st.classId?.className || "N/A"}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleOpenEditModal(st)}
                          className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="កែប្រែ"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(st._id)}
                          className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                          title="លុប"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Pagination Section */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between">
            <p className="text-xs text-slate-500">
              ទំព័រទី <span className="font-medium">{page}</span> នៃ{" "}
              <span className="font-medium">{totalPages}</span>
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((prev) => prev - 1)}
                className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((prev) => prev + 1)}
                className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal បង្កើត និងកែប្រែសិស្ស */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">
                {editingId ? "កែប្រែព័ត៌មានសិស្ស" : "បន្ថែមសិស្សថ្មី"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden bg-slate-50">
                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Upload className="text-slate-400" size={20} />
                  )}
                </div>
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="text-xs text-slate-500"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    រូបថតកាត (PNG, JPG)
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-medium text-slate-700">
                      អត្តលេខសិស្ស
                    </label>
                    {!editingId && (
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            studentId: generateAutoStudentId(),
                          })
                        }
                        className="text-[11px] text-blue-600 hover:underline flex items-center gap-1"
                        title="បង្កើតលេខថ្មី"
                      >
                        <RefreshCw size={10} />
                        <span>បង្កើតថ្មី</span>
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder="ស្វ័យប្រវត្តិ (Auto-generated)"
                    value={formData.studentId}
                    onChange={(e) =>
                      setFormData({ ...formData, studentId: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-blue-700 bg-slate-50/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    ថ្នាក់រៀន
                  </label>
                  <select
                    required
                    value={formData.classId}
                    onChange={(e) =>
                      setFormData({ ...formData, classId: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="">-- ជ្រើសរើស --</option>
                    {classes.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.className} ({c.academicYear})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    ឈ្មោះខ្មែរ
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nameKhmer}
                    onChange={(e) =>
                      setFormData({ ...formData, nameKhmer: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    ឈ្មោះអក្សរឡាតាំង
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nameLatin}
                    onChange={(e) =>
                      setFormData({ ...formData, nameLatin: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* 💡 កែប្រែ៖ រក្សាទុកតែភេទ និងដកកញ្ចប់ Input ថ្ងៃខែឆ្នាំកំណើតចេញ */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    ភេទ
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) =>
                      setFormData({ ...formData, gender: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Male">ប្រុស</option>
                    <option value="Female">ស្រី</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    លេខទូរស័ព្ទអាណាព្យាបាល
                  </label>
                  <input
                    type="text"
                    placeholder="012345678"
                    value={formData.parentPhone}
                    onChange={(e) =>
                      setFormData({ ...formData, parentPhone: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-200"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 shadow-lg shadow-blue-500/25 disabled:opacity-50"
                >
                  {submitting && (
                    <Loader2 className="animate-spin" size={16} />
                  )}
                  <span>{editingId ? "រក្សាការកែប្រែ" : "រក្សាទុក"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal ផ្ទេរសិស្សទៅថ្នាក់ថ្មី (Bulk Transfer Modal) */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">
                ផ្ទេរសិស្សទៅថ្នាក់ថ្មី
              </h2>
              <button
                onClick={() => setShowTransferModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleBulkTransferSubmit} className="space-y-4">
              <div className="p-3 bg-blue-50 text-blue-700 text-xs rounded-xl border border-blue-100">
                អ្នកបានជ្រើសរើសសិស្សចំនួន{" "}
                <span className="font-bold text-blue-800">
                  {selectedStudentIds.length}
                </span>{" "}
                នាក់ ដើម្បីផ្ទេរទៅថ្នាក់ថ្មី។
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  ជ្រើសរើសថ្នាក់គោលដៅ (Target Class)
                </label>
                <select
                  required
                  value={targetClassId}
                  onChange={(e) => setTargetClassId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white cursor-pointer"
                >
                  <option value="">-- ជ្រើសរើសថ្នាក់គោលដៅ --</option>
                  {classes.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.className} ({c.academicYear})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-200"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  disabled={transferring}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-medium shadow-lg shadow-amber-500/25 disabled:opacity-50"
                >
                  {transferring && (
                    <Loader2 className="animate-spin" size={16} />
                  )}
                  <span>
                    {transferring ? "កំពុងផ្ទេរ..." : "រក្សាទុកការផ្ទេរ"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}