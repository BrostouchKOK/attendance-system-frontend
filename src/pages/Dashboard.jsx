import { useEffect, useState } from "react";
import { Users, BookOpen, CheckCircle, Clock } from "lucide-react";
import axiosInstance from "../api/axiosInstance";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalClasses: 0,
    attendanceRate: "0%",
    absenceRate: "0%",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const [resStudents, resClasses, resAttendance] = await Promise.all([
          axiosInstance.get("/students/count"),
          axiosInstance.get("/classes/count"),
          axiosInstance.get("/attendances/today-summary"),
        ]);

        setStats({
          totalStudents:
            resStudents.data?.count ?? resStudents.data?.totalStudents ?? 0,
          totalClasses: resClasses.data?.count ?? 0,
          attendanceRate: resAttendance.data?.attendanceRate || "0%",
          absenceRate: resAttendance.data?.absenceRate || "0%",
        });
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const cards = [
    {
      title: "សិស្សសរុប",
      value: loading ? "..." : stats.totalStudents,
      icon: Users,
      color: "bg-blue-500",
    },
    {
      title: "ថ្នាក់រៀនសរុប",
      value: loading ? "..." : stats.totalClasses,
      icon: BookOpen,
      color: "bg-indigo-500",
    },
    {
      title: "វត្តមានថ្ងៃនេះ",
      value: loading ? "..." : stats.attendanceRate,
      icon: CheckCircle,
      color: "bg-emerald-500",
    },
    {
      title: "សិស្សអវត្តមាន",
      value: loading ? "..." : stats.absenceRate,
      icon: Clock,
      color: "bg-rose-500",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          ផ្ទាំងគ្រប់គ្រង (Dashboard)
        </h1>
        <p className="text-slate-500 text-sm">
          សង្ខេបទិន្នន័យសាលារៀន និងវត្តមានសិស្ស
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-medium text-slate-500">
                  {card.title}
                </p>
                <h3 className="text-2xl font-bold text-slate-800 mt-1">
                  {card.value}
                </h3>
              </div>
              <div className={`p-3 rounded-xl text-white ${card.color}`}>
                <Icon size={22} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
