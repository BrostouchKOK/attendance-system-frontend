import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { LogIn, Lock, Mail } from "lucide-react";
import axiosInstance from "../api/axiosInstance";
import { AuthContext } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axiosInstance.post("/auth/login", {
        email,
        password,
      });
      login(data);
      toast.success("ចូលប្រើប្រាស់ប្រព័ន្ធជោគជ័យ!");
      navigate("/");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "អ៊ីមែល ឬ ពាក្យសម្ងាត់មិនត្រឹមត្រូវ",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-slate-100">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30">
            <LogIn size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">
            ប្រព័ន្ធគ្រប់គ្រងវត្តមានសិស្ស
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            សូមបញ្ចូលគណនីរបស់អ្នកដើម្បីចូលប្រើប្រាស់
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              អ៊ីមែល
            </label>
            <div className="relative">
              <Mail
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@school.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800 transition-all text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              ពាក្យសម្ងាត់
            </label>
            <div className="relative">
              <Lock
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800 transition-all text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium rounded-xl shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50 text-sm flex items-center justify-center gap-2"
          >
            {loading ? "កំពុងផ្ទៀងផ្ទាត់..." : "ចូលប្រើប្រាស់"}
          </button>
        </form>
      </div>
    </div>
  );
}
