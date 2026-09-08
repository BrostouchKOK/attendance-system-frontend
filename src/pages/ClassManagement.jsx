import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  Plus,
  BookOpen,
  Edit3,
  Trash2,
  X,
  UserCheck,
  Users,
  Copy,
  Loader2,
  Check,
} from "lucide-react";
import axiosInstance from "../api/axiosInstance";

export default function ClassManagement() {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [selectedYearFilter, setSelectedYearFilter] = useState(() => {
    return localStorage.getItem("selectedAcademicYear") || "all";
  });

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [showCloneModal, setShowCloneModal] = useState(false);
  const [cloneData, setCloneData] = useState({
    sourceYear: "",
    targetYear: "2027-2028",
  });
  const [cloning, setCloning] = useState(false);

  const [formData, setFormData] = useState({
    className: "",
    academicYear: "2026-2027",
    gradeLevel: "10",
    homeroomTeacher: "",
    assignedTeachers: [],
  });

  // ១. Fetch academic years & teachers
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const teachersRes = await axiosInstance.get("/auth/users?role=teacher");
        const teacherList = Array.isArray(teachersRes.data)
          ? teachersRes.data
          : [];
        setTeachers(teacherList);

        const yearsRes = await axiosInstance.get("/classes/academic-years");
        const yearList = Array.isArray(yearsRes.data) ? yearsRes.data : [];
        setAcademicYears(yearList);

        if (yearList.length > 0) {
          setCloneData((prev) => ({ ...prev, sourceYear: yearList[0] }));
        }
      } catch (error) {
        console.error("Error fetching initial data:", error);
        setTeachers([]);
        setAcademicYears([]);
      }
    };

    fetchInitialData();
  }, []);

  // ២. Fetch Classes
  const fetchClasses = async (year = selectedYearFilter) => {
    setLoading(true);
    try {
      const url = year === "all" ? "/classes" : `/classes?academicYear=${year}`;
      const { data } = await axiosInstance.get(url);
      setClasses(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error("មិនអាចទាញយកទិន្នន័យថ្នាក់រៀនបានទេ");
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses(selectedYearFilter);
  }, [selectedYearFilter]);

  const handleYearFilterChange = (newYear) => {
    setSelectedYearFilter(newYear);
    localStorage.setItem("selectedAcademicYear", newYear);
  };

  // Helper សម្រាប់ស្វែងរកឈ្មោះគ្រូពី ID ឬ Object
  const getTeacherName = (teacherProp) => {
    if (!teacherProp) return "មិនទាន់មាន";

    if (typeof teacherProp === "object" && teacherProp !== null) {
      return (
        teacherProp.nameKhmer ||
        teacherProp.nameLatin ||
        teacherProp.name ||
        "មិនទាន់មាន"
      );
    }

    const found = teachers.find((t) => String(t._id) === String(teacherProp));
    return found
      ? found.nameKhmer || found.nameLatin || found.name
      : "មិនទាន់មាន";
  };

  const handleOpenModal = (cls = null) => {
    if (cls) {
      setEditingId(cls._id);

      let hrTeacherId = "";
      if (cls.homeroomTeacher) {
        hrTeacherId =
          typeof cls.homeroomTeacher === "object"
            ? String(cls.homeroomTeacher._id)
            : String(cls.homeroomTeacher);
      }

      const assignedIds =
        cls.assignedTeachers?.map((t) =>
          typeof t === "object" && t !== null ? String(t._id) : String(t),
        ) || [];

      setFormData({
        className: cls.className || "",
        academicYear: cls.academicYear || "2026-2027",
        gradeLevel: cls.gradeLevel ? String(cls.gradeLevel) : "",
        homeroomTeacher: hrTeacherId,
        assignedTeachers: assignedIds,
      });
    } else {
      setEditingId(null);
      setFormData({
        className: "",
        academicYear:
          selectedYearFilter !== "all" ? selectedYearFilter : "2026-2027",
        gradeLevel: "",
        homeroomTeacher: "",
        assignedTeachers: [],
      });
    }
    setShowModal(true);
  };

  const handleTeacherCheckbox = (teacherId) => {
    const idStr = String(teacherId);
    setFormData((prev) => {
      const exists = prev.assignedTeachers.includes(idStr);
      if (exists) {
        return {
          ...prev,
          assignedTeachers: prev.assignedTeachers.filter((id) => id !== idStr),
        };
      } else {
        return {
          ...prev,
          assignedTeachers: [...prev.assignedTeachers, idStr],
        };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      ...formData,
      homeroomTeacher:
        formData.homeroomTeacher && formData.homeroomTeacher.trim() !== ""
          ? formData.homeroomTeacher
          : null,
    };

    try {
      if (editingId) {
        await axiosInstance.put(`/classes/${editingId}`, payload);
        toast.success("ធ្វើបច្ចុប្បន្នភាពថ្នាក់រៀនបានជោគជ័យ");
      } else {
        await axiosInstance.post("/classes", payload);
        toast.success("បង្កើតថ្នាក់រៀនថ្មីបានជោគជ័យ");
      }
      setShowModal(false);

      await fetchClasses();

      const yearsRes = await axiosInstance.get("/classes/academic-years");
      setAcademicYears(Array.isArray(yearsRes.data) ? yearsRes.data : []);
    } catch (error) {
      toast.error(error.response?.data?.message || "មានបញ្ហាក្នុងការរក្សាទុក");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("តើអ្នកពិតជាចង់លុបថ្នាក់រៀននេះមែនទេ?")) return;
    try {
      await axiosInstance.delete(`/classes/${id}`);
      toast.success("លុបថ្នាក់រៀនបានជោគជ័យ");
      fetchClasses();

      const yearsRes = await axiosInstance.get("/classes/academic-years");
      setAcademicYears(Array.isArray(yearsRes.data) ? yearsRes.data : []);
    } catch (error) {
      toast.error("មិនអាចលុបថ្នាក់រៀននេះបានទេ");
    }
  };

  const handleCloneClasses = async (e) => {
    e.preventDefault();
    setCloning(true);
    try {
      const { data } = await axiosInstance.post("/classes/clone", cloneData);
      toast.success(data.message);
      setShowCloneModal(false);
      fetchClasses();

      const yearsRes = await axiosInstance.get("/classes/academic-years");
      setAcademicYears(Array.isArray(yearsRes.data) ? yearsRes.data : []);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "មានបញ្ហាក្នុងការចម្លងថ្នាក់",
      );
    } finally {
      setCloning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-800">
            គ្រប់គ្រងថ្នាក់រៀន
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            បង្កើត កែប្រែ និងចម្លងថ្នាក់រៀនតាមឆ្នាំសិក្សា
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
            <span className="text-xs font-semibold text-slate-500">
              ឆ្នាំសិក្សា:
            </span>
            <select
              value={selectedYearFilter}
              onChange={(e) => handleYearFilterChange(e.target.value)}
              className="bg-transparent text-xs font-bold text-blue-600 outline-none cursor-pointer"
            >
              <option value="all">ទាំងអស់</option>
              {academicYears.map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setShowCloneModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all cursor-pointer"
          >
            <Copy size={16} />
            <span>ចម្លងថ្នាក់ទៅឆ្នាំថ្មី</span>
          </button>

          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-md transition-all cursor-pointer"
          >
            <Plus size={16} />
            <span>បង្កើតថ្នាក់ថ្មី</span>
          </button>
        </div>
      </div>

      {/* Class List Grid */}
      {loading ? (
        <div className="bg-white rounded-2xl p-12 text-center text-slate-500 border border-slate-200 flex items-center justify-center gap-2">
          <Loader2 size={20} className="animate-spin text-blue-600" />
          <span>កំពុងផ្ទុកបញ្ជីថ្នាក់រៀន...</span>
        </div>
      ) : classes.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center text-slate-500 border border-slate-200">
          មិនមានថ្នាក់រៀនត្រូវបានបង្កើតនៅឡើយទេ
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map((cls) => (
            <div
              key={cls._id}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                      <BookOpen size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">
                        {cls.className}
                      </h3>
                      <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-md">
                        កម្រិត {cls.gradeLevel}
                      </span>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                    {cls.academicYear}
                  </span>
                </div>

                <div className="mt-4 space-y-3 text-xs text-slate-600">
                  {/* Homeroom Teacher */}
                  <div className="flex items-center gap-2">
                    <UserCheck size={16} className="text-blue-500 shrink-0" />
                    <span>
                      គ្រូបន្ទុក៖{" "}
                      <strong className="text-slate-800">
                        {getTeacherName(cls.homeroomTeacher)}
                      </strong>
                    </span>
                  </div>

                  {/* Assigned Subject Teachers */}
                  <div className="flex items-start gap-2">
                    <Users
                      size={16}
                      className="text-indigo-500 shrink-0 mt-0.5"
                    />
                    <div className="flex-1">
                      <span className="block mb-1">
                        គ្រូបង្រៀនមុខវិជ្ជា (
                        <strong className="text-slate-800">
                          {cls.assignedTeachers?.length || 0}
                        </strong>
                        )៖
                      </span>

                      {cls.assignedTeachers &&
                      cls.assignedTeachers.length > 0 ? (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {cls.assignedTeachers.map((t) => {
                            const name = getTeacherName(t);
                            const tKey =
                              typeof t === "object" && t !== null ? t._id : t;
                            return (
                              <span
                                key={tKey}
                                className="inline-block bg-slate-100 text-slate-700 text-[11px] px-2 py-0.5 rounded-md font-medium"
                              >
                                {name}
                              </span>
                            );
                          })}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">
                          មិនទាន់មានគ្រូមុខវិជ្ជា
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 mt-5 pt-3 border-t border-slate-100">
                <button
                  onClick={() => handleOpenModal(cls)}
                  className="p-2 hover:bg-slate-100 text-slate-600 rounded-lg transition-all cursor-pointer"
                  title="កែប្រែ"
                >
                  <Edit3 size={16} />
                </button>
                <button
                  onClick={() => handleDelete(cls._id)}
                  className="p-2 hover:bg-rose-50 text-rose-600 rounded-lg transition-all cursor-pointer"
                  title="លុប"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Create/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800">
                {editingId ? "កែប្រែថ្នាក់រៀន" : "បង្កើតថ្នាក់រៀនថ្មី"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-4 overflow-y-auto pr-1"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  ឈ្មោះថ្នាក់រៀន
                </label>
                <input
                  type="text"
                  required
                  placeholder="ឧ. ថ្នាក់ទី ១០A"
                  value={formData.className}
                  onChange={(e) =>
                    setFormData({ ...formData, className: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    ឆ្នាំសិក្សា
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="2026-2027"
                    value={formData.academicYear}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        academicYear: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    កម្រិតថ្នាក់
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ឧ. 10"
                    value={formData.gradeLevel}
                    onChange={(e) =>
                      setFormData({ ...formData, gradeLevel: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Homeroom Teacher Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  គ្រូបន្ទុកថ្នាក់
                </label>
                <select
                  value={formData.homeroomTeacher}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      homeroomTeacher: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 bg-white cursor-pointer"
                >
                  <option value="">-- ជ្រើសរើសគ្រូបន្ទុក --</option>
                  {teachers.map((t) => (
                    <option key={t._id} value={String(t._id)}>
                      {t.nameKhmer || t.nameLatin || t.name} ({t.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Assigned Teachers Selection List */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  ជ្រើសរើសគ្រូបង្រៀនមុខវិជ្ជា
                </label>
                <div className="border border-slate-200 rounded-xl p-2 max-h-36 overflow-y-auto space-y-1">
                  {teachers.length === 0 ? (
                    <p className="text-xs text-slate-400 p-1">
                      មិនមានទិន្នន័យគ្រូបង្រៀនទេ
                    </p>
                  ) : (
                    teachers.map((t) => {
                      const isSelected = formData.assignedTeachers.includes(
                        String(t._id),
                      );
                      return (
                        <div
                          key={t._id}
                          onClick={() => handleTeacherCheckbox(t._id)}
                          className={`flex items-center justify-between p-2 rounded-lg cursor-pointer text-xs transition-all ${
                            isSelected
                              ? "bg-blue-50 text-blue-700 font-semibold"
                              : "hover:bg-slate-50 text-slate-700"
                          }`}
                        >
                          <span>{t.nameKhmer || t.nameLatin || t.name}</span>
                          {isSelected && (
                            <Check size={14} className="text-blue-600" />
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {submitting && <Loader2 size={16} className="animate-spin" />}
                <span>រក្សាទុក</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Clone */}
      {showCloneModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800">
                ចម្លងថ្នាក់រៀនទៅឆ្នាំថ្មី
              </h3>
              <button
                onClick={() => setShowCloneModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCloneClasses} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  ពីឆ្នាំសិក្សា (Source Year)
                </label>
                <select
                  value={cloneData.sourceYear}
                  onChange={(e) =>
                    setCloneData({ ...cloneData, sourceYear: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 bg-white"
                >
                  {academicYears.map((yr) => (
                    <option key={yr} value={yr}>
                      {yr}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  ទៅកាន់ឆ្នាំសិក្សាថ្មី (Target Year)
                </label>
                <input
                  type="text"
                  required
                  placeholder="ឧ. 2027-2028"
                  value={cloneData.targetYear}
                  onChange={(e) =>
                    setCloneData({ ...cloneData, targetYear: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={cloning}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {cloning && <Loader2 size={16} className="animate-spin" />}
                <span>ចាប់ផ្តើមចម្លង</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
