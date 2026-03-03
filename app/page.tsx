"use client";

import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import { useRouter } from "next/navigation";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";
import { Pie, Bar } from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

type Deliverable = {
  id: string;
  title: string;
  system: string;
  status: string;
  due_date: string;
  project_id: string | null;
};

type Project = {
  id: string;
  name: string;
};

export default function Home() {
  const router = useRouter();

  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [userEmail, setUserEmail] = useState("");

  const [selectedProject, setSelectedProject] =
    useState<string | "all">("all");
  const [selectedSystem, setSelectedSystem] =
    useState<string | "all">("all");
  const [selectedStatus, setSelectedStatus] =
    useState<string | "all">("all");

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    const { data } = await supabase.auth.getSession();
    if (!data.session) router.replace("/login");
    else {
      setUserEmail(data.session.user.email || "");
      fetchData();
    }
  }

  async function fetchData() {
    const { data: del } = await supabase
      .from("deliverables")
      .select("*");

    const { data: proj } = await supabase
      .from("projects")
      .select("*");

    setDeliverables(del || []);
    setProjects(proj || []);
  }

  async function updateStatus(id: string) {
    await supabase
      .from("deliverables")
      .update({ status: "Completed" })
      .eq("id", id);

    fetchData();
  }

  const today = new Date();

  const filtered = deliverables.filter((d) => {
    if (selectedProject !== "all" && d.project_id !== selectedProject)
      return false;
    if (selectedSystem !== "all" && d.system !== selectedSystem)
      return false;
    if (selectedStatus !== "all" && d.status !== selectedStatus)
      return false;
    return true;
  });

  const overdue = filtered.filter(
    (d) =>
      new Date(d.due_date) < today &&
      d.status !== "Completed"
  ).length;

  const due7 = filtered.filter((d) => {
    const diff =
      (new Date(d.due_date).getTime() - today.getTime()) /
      (1000 * 3600 * 24);
    return diff >= 0 && diff <= 7 && d.status !== "Completed";
  }).length;

  const due15 = filtered.filter((d) => {
    const diff =
      (new Date(d.due_date).getTime() - today.getTime()) /
      (1000 * 3600 * 24);
    return diff > 7 && diff <= 15 && d.status !== "Completed";
  }).length;

  const active = filtered.filter(
    (d) => d.status !== "Completed"
  ).length;

  const systemCount: any = {};
  filtered
    .filter((d) => d.status !== "Completed")
    .forEach((d) => {
      systemCount[d.system] =
        (systemCount[d.system] || 0) + 1;
    });

  const projectCount: any = {};
  projects.forEach((p) => (projectCount[p.id] = 0));

  filtered.forEach((d) => {
    if (!d.project_id || d.status === "Completed")
      return;

    const diff =
      (new Date(d.due_date).getTime() - today.getTime()) /
      (1000 * 3600 * 24);

    if (diff < 0)
      projectCount[d.project_id]++;
  });

  return (
    <div className="min-h-screen bg-[#07122b] text-gray-200 px-16 py-10">

      {/* HEADER */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <p className="text-xs tracking-widest text-gray-400 uppercase">
            It’s Thoughtful. It’s
          </p>
          <h1 className="text-5xl font-serif text-white">
            Rustomjee
          </h1>
          <p className="mt-3 text-2xl font-light">
            MEP Project Command Center
          </p>

          {/* FILTERS */}
          <div className="flex gap-6 mt-6">
            <select
              value={selectedProject}
              onChange={(e) =>
                setSelectedProject(e.target.value)
              }
              className="bg-[#101c3f] border border-blue-700 rounded-lg px-5 py-3"
            >
              <option value="all">All Projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            <select
              value={selectedSystem}
              onChange={(e) =>
                setSelectedSystem(e.target.value)
              }
              className="bg-[#101c3f] border border-blue-700 rounded-lg px-5 py-3"
            >
              <option value="all">All Systems</option>
              {[...new Set(deliverables.map((d) => d.system))].map(
                (sys) => (
                  <option key={sys}>{sys}</option>
                )
              )}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) =>
                setSelectedStatus(e.target.value)
              }
              className="bg-[#101c3f] border border-blue-700 rounded-lg px-5 py-3"
            >
              <option value="all">All Status</option>
              {[...new Set(deliverables.map((d) => d.status))].map(
                (s) => (
                  <option key={s}>{s}</option>
                )
              )}
            </select>
          </div>
        </div>

        <div className="text-right">
          <p className="text-sm text-gray-400">
            Logged in as
          </p>
          <p className="text-sm mb-3 text-white">
            {userEmail}
          </p>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              router.replace("/login");
            }}
            className="bg-red-600 px-4 py-2 rounded"
          >
            Logout
          </button>
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-4 gap-6 mb-12">
        <KPI title="Overdue" value={overdue} color="red" glow={overdue > 0} />
        <KPI title="Due in 7 Days" value={due7} color="yellow" />
        <KPI title="Due in 15 Days" value={due15} color="blue" />
        <KPI title="Active Deliverables" value={active} color="green" />
      </div>

      {/* SYSTEM LOAD */}
      <div className="bg-[#101c3f] p-6 rounded-xl mb-12">
        <h3 className="mb-6">System Load (Active)</h3>
        <Bar
          data={{
            labels: Object.keys(systemCount),
            datasets: [
              {
                data: Object.values(systemCount),
                backgroundColor: "#3b82f6",
              },
            ],
          }}
          options={{
            scales: {
              y: { beginAtZero: true, ticks: { stepSize: 1 } },
            },
            plugins: { legend: { display: false } },
          }}
        />
      </div>

      {/* PROJECT RISK */}
      <div className="bg-[#101c3f] p-6 rounded-xl mb-12">
        <h3 className="mb-6">Project Risk Overview</h3>
        <Bar
          data={{
            labels: projects.map((p) => p.name),
            datasets: [
              {
                label: "Overdue",
                data: projects.map((p) => projectCount[p.id]),
                backgroundColor: "#ef4444",
              },
            ],
          }}
          options={{
            scales: {
              y: { beginAtZero: true, ticks: { stepSize: 1 } },
              x: { ticks: { font: { size: 14 } } },
            },
          }}
        />
      </div>

      {/* EXECUTIVE DELIVERABLES TABLE */}
      <div className="bg-[#101c3f] p-6 rounded-xl">
        <h3 className="mb-6 text-lg">Deliverables</h3>

        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-600 text-gray-400 uppercase text-xs">
              <th className="pb-3">#</th>
              <th>Project</th>
              <th>Title</th>
              <th>System</th>
              <th>Status</th>
              <th>Due Date</th>
              <th>Timeline</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((d, index) => {
              const projectName =
                projects.find((p) => p.id === d.project_id)?.name || "-";

              const diff = Math.ceil(
                (new Date(d.due_date).getTime() - today.getTime()) /
                  (1000 * 3600 * 24)
              );

              let timelineText = "";
              let timelineColor = "text-gray-300";

              if (d.status === "Completed") {
                timelineText = "Completed";
                timelineColor = "text-green-400";
              } else if (diff < 0) {
                timelineText = `Overdue by ${Math.abs(diff)} days`;
                timelineColor = "text-red-400";
              } else {
                timelineText = `Due in ${diff} days`;
                timelineColor = "text-yellow-400";
              }

              return (
                <tr
                  key={d.id}
                  className="border-b border-gray-700 hover:bg-[#13295c] transition"
                >
                  <td className="py-4">{index + 1}</td>
                  <td>{projectName}</td>
                  <td>{d.title}</td>
                  <td>{d.system}</td>
                  <td>{d.status}</td>
                  <td>{d.due_date}</td>
                  <td className={timelineColor}>{timelineText}</td>
                  <td>
                    {d.status !== "Completed" && (
                      <button
                        onClick={() => updateStatus(d.id)}
                        className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-xs"
                      >
                        Mark Complete
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function KPI({ title, value, color, glow }: any) {
  const colors: any = {
    red: "border-red-500 text-red-400",
    yellow: "border-yellow-500 text-yellow-400",
    blue: "border-blue-500 text-blue-400",
    green: "border-green-500 text-green-400",
  };

  return (
    <div
      className={`p-6 rounded-xl border ${colors[color]} bg-[#101c3f] ${
        glow ? "animate-pulse" : ""
      }`}
    >
      <p className="text-xs uppercase tracking-widest">{title}</p>
      <p className="text-3xl mt-3">{value}</p>
    </div>
  );
}