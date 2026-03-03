"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "./lib/supabase";
import { useRouter } from "next/navigation";
import {
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Chart as ChartJS,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [deliverables, setDeliverables] = useState<any[]>([]);
  const [animatedMetrics, setAnimatedMetrics] = useState({
    overdue: 0,
    due7: 0,
    due15: 0,
    active: 0,
  });

  const [projectFilter, setProjectFilter] = useState("");
  const [systemFilter, setSystemFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const today = new Date();

  // AUTH
  useEffect(() => {
    const check = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) router.push("/login");
      else setUser(data.user);
    };
    check();
  }, [router]);

  // FETCH
  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("deliverables")
        .select(`*, projects(name)`);
      if (data) setDeliverables(data);
    };
    fetch();
  }, []);

  // FILTER
  const filtered = useMemo(() => {
    return deliverables.filter((d) => {
      return (
        (projectFilter === "" || d.projects?.name === projectFilter) &&
        (systemFilter === "" || d.system === systemFilter) &&
        (statusFilter === "" || d.status === statusFilter)
      );
    });
  }, [deliverables, projectFilter, systemFilter, statusFilter]);

  // METRICS
  const metrics = useMemo(() => {
    let overdue = 0;
    let due7 = 0;
    let due15 = 0;
    let active = 0;

    filtered.forEach((d) => {
      if (!d.due_date) return;
      const diff =
        (new Date(d.due_date).getTime() - today.getTime()) /
        (1000 * 60 * 60 * 24);

      if (d.status !== "Completed") {
        active++;
        if (diff < 0) overdue++;
        else if (diff <= 7) due7++;
        else if (diff <= 15) due15++;
      }
    });

    return { overdue, due7, due15, active };
  }, [filtered]);

  // Smooth metric animation
  useEffect(() => {
    const duration = 600;
    const steps = 20;
    const interval = duration / steps;

    let count = 0;
    const timer = setInterval(() => {
      count++;
      setAnimatedMetrics({
        overdue: Math.round((metrics.overdue / steps) * count),
        due7: Math.round((metrics.due7 / steps) * count),
        due15: Math.round((metrics.due15 / steps) * count),
        active: Math.round((metrics.active / steps) * count),
      });
      if (count >= steps) clearInterval(timer);
    }, interval);
  }, [metrics]);

  const getSeverityBorder = (value: number) => {
    if (value > 15) return "border-l-4 border-red-600";
    if (value > 8) return "border-l-4 border-amber-500";
    return "border-l-4 border-emerald-500";
  };

  // PROJECT RISK
  const projectRisk = useMemo(() => {
    const map: any = {};
    filtered.forEach((d) => {
      const name = d.projects?.name || "Unknown";
      if (!map[name]) map[name] = 0;
      if (d.status !== "Completed" && new Date(d.due_date) < today) {
        map[name]++;
      }
    });
    return map;
  }, [filtered]);

  const chartData = {
    labels: Object.keys(projectRisk),
    datasets: [
      {
        data: Object.values(projectRisk),
        backgroundColor: "#16A34A",
        borderRadius: 8,
        barPercentage: 0.5,
      },
    ],
  };

  const priority = useMemo(() => {
    return filtered
      .filter((d) => d.status !== "Completed" && d.due_date)
      .sort(
        (a, b) =>
          new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
      )
      .slice(0, 10);
  }, [filtered]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("deliverables").update({ status }).eq("id", id);
    location.reload();
  };

  const openProject = (projectName: string) => {
    router.push(`/project/${encodeURIComponent(projectName)}`);
  };

  return (
    <div className="min-h-screen bg-[#041426] px-12 py-12">

      {/* Sticky Executive Header */}
      <div className="sticky top-0 z-50 backdrop-blur-md bg-[#041426]/80 pb-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs tracking-[0.3em] text-gray-400">
              IT’S THOUGHTFUL. IT’S
            </p>
            <h1 className="text-6xl font-serif mt-2 text-white">
              Rustomjee
            </h1>
            <h2 className="text-xl text-gray-300 mt-6">
              MEP Executive Command Center
            </h2>
          </div>

          <div className="text-right">
            <p className="text-gray-300 text-sm">{user?.email}</p>
            <button
              onClick={handleLogout}
              className="mt-4 bg-red-600 hover:bg-red-700 transition px-6 py-2 rounded-lg text-white"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto space-y-14 mt-10">

        {/* METRICS */}
        <div className="grid grid-cols-4 gap-8">
          <Metric title="Overdue" value={animatedMetrics.overdue} border={getSeverityBorder(metrics.overdue)} />
          <Metric title="Due 7 Days" value={animatedMetrics.due7} border="border-l-4 border-blue-500" />
          <Metric title="Due 15 Days" value={animatedMetrics.due15} border="border-l-4 border-indigo-500" />
          <Metric title="Active" value={animatedMetrics.active} border="border-l-4 border-gray-400" />
        </div>

        {/* CHART */}
        <div className="bg-[#0B2545] border border-white/5 rounded-2xl p-10 shadow-[0_30px_80px_rgba(0,0,0,0.6)] hover:-translate-y-1 transition duration-300">
          <h3 className="mb-8 text-gray-200 text-lg">
            Project Risk Distribution
          </h3>
          <div className="h-[380px]">
            <Bar
              data={chartData}
              options={{
                plugins: { legend: { display: false } },
                scales: {
                  x: {
                    ticks: { color: "#CBD5E1" },
                    grid: { display: false },
                  },
                  y: {
                    ticks: { color: "#94A3B8" },
                    grid: { color: "rgba(255,255,255,0.05)" },
                  },
                },
              }}
            />
          </div>
        </div>

        {/* CRITICAL 10 */}
        <div className="bg-[#0B2545] border border-white/5 rounded-2xl p-10 shadow-[0_30px_80px_rgba(0,0,0,0.6)]">
          <h3 className="mb-8 text-gray-200 text-lg">
            Critical Deliverables (Top 10)
          </h3>

          <div className="space-y-4">
            {priority.map((d, i) => (
              <div
                key={d.id}
                className="flex justify-between items-center py-4 border-b border-white/5 text-sm text-gray-200 hover:bg-white/5 transition duration-200 cursor-pointer"
                onClick={() => openProject(d.projects?.name)}
              >
                <div className="w-10 text-gray-400">{i + 1}</div>
                <div className="flex-1 font-medium text-white">
                  {d.projects?.name}
                </div>
                <div className="flex-1">{d.title}</div>
                <div className="w-40 text-gray-400">{d.due_date}</div>
                <div className="w-40">
                  <select
                    value={d.status ?? ""}
                    onClick={(e)=>e.stopPropagation()}
                    onChange={(e)=>updateStatus(d.id,e.target.value)}
                    className="bg-[#041426] border border-white/10 px-2 py-1 rounded text-xs text-gray-200"
                  >
                    <option>Not Started</option>
                    <option>In Progress</option>
                    <option>Completed</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

function Metric({ title, value, border }: any) {
  return (
    <div
      className={`rounded-2xl bg-[#0B2545] border border-white/5 p-8 shadow-[0_30px_80px_rgba(0,0,0,0.6)] hover:-translate-y-1 transition duration-300 ${border}`}
    >
      <p className="text-xs uppercase tracking-[0.2em] text-gray-300 mb-4">
        {title}
      </p>
      <h2 className="text-4xl font-semibold text-white transition-all duration-300">
        {value}
      </h2>
    </div>
  );
}