import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { UserPlus, Edit, Trash2, Power, X } from "lucide-react";
import axiosInstance from "../api/axiosInstance";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const initialForm = { name: "", email: "", password: "", role: "teacher" };
  const [formData, setFormData] = useState(initialForm);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get("/auth/users");
      setUsers(data);
    } catch (error) {
      toast.error("មិនអាចទាញយកបញ្ជីបុគ្គលិកបានទេ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingId(null);
    setFormData(initialForm);
    setShowModal(true);
  };

  const handleOpenEditModal = (user) => {
    setEditingId(user._id);
    setFormData({
      name: user.name,
      email: user.email,
      password: "", // ទុកទំនេរប្រសិនបើមិនចង់ប្តូរ Password ថ្មី
      role: user.role,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axiosInstance.put(`/auth/users/${editingId}`, formData);
        toast.success("ធ្វើបច្ចុប្បន្នភាពទិន្នន័យជោគជ័យ!");
      } else {
        await axiosInstance.post("/auth/register", formData);
        toast.success("បង្កើតគណនីបុគ្គលិកជោគជ័យ!");
      }
      setShowModal(false);
      setFormData(initialForm);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "ប្រតិបត្តិការបរាជ័យ");
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const action = currentStatus ? "ផ្អាក" : "បើកដំណើរការ";
    if (window.confirm(`តើអ្នកប្រាកដជាចង់ ${action} គណនីនេះមែនទេ?`)) {
      try {
        await axiosInstance.patch(`/auth/users/${id}/status`);
        toast.success(`បាន ${action} គណនីជោគជ័យ`);
        fetchUsers();
      } catch (error) {
        toast.error("មិនអាចផ្លាស់ប្តូរស្ថានភាពបានទេ");
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("តើអ្នកប្រាកដជាចង់លុបគណនីនេះចេញពីប្រព័ន្ធមែនទេ?")) {
      try {
        await axiosInstance.delete(`/auth/users/${id}`);
        toast.success("លុបគណនីជោគជ័យ");
        fetchUsers();
      } catch (error) {
        toast.error("មិនអាចលុបគណនីបានទេ");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            គ្រប់គ្រងបុគ្គលិក
          </h1>
          <p className="text-slate-500 text-sm">
            បន្ថែម កែប្រែ និងគ្រប់គ្រងសិទ្ធិបុគ្គលិក
          </p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium shadow-lg shadow-blue-500/25 transition-all"
        >
          <UserPlus size={18} />
          <span>បន្ថែមបុគ្គលិកថ្មី</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50 text-xs text-slate-500 uppercase font-semibold">
              <th className="p-4">ឈ្មោះបុគ្គលិក</th>
              <th className="p-4">អ៊ីមែល</th>
              <th className="p-4">តួនាទី</th>
              <th className="p-4">ស្ថានភាព</th>
              <th className="p-4 text-center">សកម្មភាព</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {loading ? (
              <tr>
                <td colSpan="5" className="p-6 text-center text-slate-500">
                  កំពុងផ្ទុកទិន្នន័យ...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-6 text-center text-slate-500">
                  មិនមានទិន្នន័យបុគ្គលិកទេ
                </td>
              </tr>
            ) : (
              users.map((u) => {
                const isActive = u.isActive ?? true;
                return (
                  <tr
                    key={u._id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="p-4 font-semibold text-slate-800">
                      {u.name}
                    </td>
                    <td className="p-4 text-slate-600">{u.email}</td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                          u.role === "admin"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {u.role === "admin" ? "Admin" : "Teacher"}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1.5 ${
                          isActive
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                            : "bg-rose-50 text-rose-600 border border-rose-200"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isActive ? "bg-emerald-500" : "bg-rose-500"
                          }`}
                        ></span>
                        {isActive ? "សកម្ម" : "ផ្អាក"}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleToggleStatus(u._id, isActive)}
                          className={`p-2 rounded-lg transition-colors ${
                            isActive
                              ? "text-amber-500 hover:bg-amber-50"
                              : "text-emerald-500 hover:bg-emerald-50"
                          }`}
                          title={isActive ? "ផ្អាកគណនី" : "បើកគណនី"}
                        >
                          <Power size={18} />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(u)}
                          className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="កែប្រែ"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(u._id)}
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
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">
                {editingId ? "កែប្រែព័ត៌មានបុគ្គលិក" : "បន្ថែមបុគ្គលិកថ្មី"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  ឈ្មោះពេញ
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  អ៊ីមែល
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  {editingId
                    ? "ពាក្យសម្ងាត់ថ្មី (ទុកទទេបើមិនចង់ប្តូរ)"
                    : "ពាក្យសម្ងាត់"}
                </label>
                <input
                  type="password"
                  required={!editingId}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  តួនាទី
                </label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="teacher">គ្រូបង្រៀន (Teacher)</option>
                  <option value="admin">អ្នកគ្រប់គ្រង (Admin)</option>
                </select>
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
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 shadow-lg shadow-blue-500/25"
                >
                  {editingId ? "រក្សាការកែប្រែ" : "រក្សាទុក"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
