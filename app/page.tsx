"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "./lib/supabase";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Dashboard() {
  const router = useRouter();

  const [userEmail, setUserEmail] = useState("");
  const [deliverables, setDeliverables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [overdue, setOverdue] = useState(0);
  const [due7, setDue7] = useState(0);
  const [due15, setDue15] = useState(0);
  const [active, setActive] = useState(0);

  const [riskData, setRiskData] = useState<any[]>([]);
  const [systemData, setSystemData] = useState<any[]>([]);

  const [projects, setProjects] = useState<string[]>([]);
  const [systems, setSystems] = useState<string[]>([]);

  const [selectedProject, setSelectedProject] = useState("");
  const [selectedSystem, setSelectedSystem] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  useEffect(() => {
    checkSession();
  }, []);

  async function checkSession() {
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      router.push("/login");
      return;
    }
    setUserEmail(data.user.email || "");
    fetchData();
  }

  async function fetchData() {
    const { data } = await supabase
      .from("deliverables")
      .select(`*, projects(name)`);

    const records = data || [];

    setDeliverables(records);
    calculateMetrics(records);

    setProjects([...new Set(records.map((d) => d.projects?.name))]);
    setSystems([...new Set(records.map((d) => d.system))]);

    setLoading(false);
  }

  function calculateMetrics(data: any[]) {
    const today = new Date();
    let o = 0, d7 = 0, d15 = 0, a = 0;
    const projectMap: any = {};
    const systemMap: any = {};

    data.forEach((item) => {
      if (item.status !== "Completed") {
        a++;
        const due = new Date(item.due_date);
        const diff =
          (due.getTime() - today.getTime()) /
          (1000 * 60 * 60 * 24);

        if (diff < 0) o++;
        else if (diff <= 7) d7++;
        else if (diff <= 15) d15++;

        projectMap[item.projects?.name] =
          (projectMap[item.projects?.name] || 0) + 1;

        systemMap[item.system] =
          (systemMap[item.system] || 0) + 1;
      }
    });

    setOverdue(o);
    setDue7(d7);
    setDue15(d15);
    setActive(a);

    setRiskData(
      Object.keys(projectMap).map((k) => ({
        name: k,
        value: projectMap[k],
      }))
    );

    setSystemData(
      Object.keys(systemMap).map((k) => ({
        name: k,
        value: systemMap[k],
      }))
    );
  }

  function kpiClass(type: string, value: number) {
    if (type === "overdue") {
      if (value >= 20) return "kpi-critical";
      if (value >= 10) return "kpi-warning";
      if (value > 0) return "kpi-light";
    }

    if (type === "due7" && value > 10) return "kpi-yellow";
    if (type === "due15" && value > 20) return "kpi-amber";
    if (type === "active" && value > 100) return "kpi-blue";

    return "";
  }

  async function updateStatus(id: string, status: string) {
    await supabase
      .from("deliverables")
      .update({ status })
      .eq("id", id);
    fetchData();
  }

  const filteredDeliverables = deliverables.filter((d) => {
    return (
      (!selectedProject || d.projects?.name === selectedProject) &&
      (!selectedSystem || d.system === selectedSystem) &&
      (!selectedStatus || d.status === selectedStatus)
    );
  });

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div>

      {/* HEADER */}
      <div className="executive-header">
        <div>
          <p className="tagline">IT’S THOUGHTFUL. IT’S</p>
          <h1>Rustomjee</h1>
          <p>MEP Executive Command Center</p>
        </div>

        <div className="user-block">
          <span>{userEmail}</span>
          <button
            className="logout-btn"
            onClick={async () => {
              await supabase.auth.signOut();
              router.push("/login");
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* FILTERS */}
      <div className="filter-bar">
        <select onChange={(e) => setSelectedProject(e.target.value)}>
          <option value="">All Projects</option>
          {projects.map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>

        <select onChange={(e) => setSelectedSystem(e.target.value)}>
          <option value="">All Systems</option>
          {systems.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>

        <select onChange={(e) => setSelectedStatus(e.target.value)}>
          <option value="">All Status</option>
          <option>Not Started</option>
          <option>In Progress</option>
          <option>Completed</option>
        </select>
      </div>

      {/* KPI CARDS */}
      <div className="metrics-grid">
        <div className={`metric-card ${kpiClass("overdue", overdue)}`}>
          <p>OVERDUE</p>
          <h2>{overdue}</h2>
        </div>

        <div className={`metric-card ${kpiClass("due7", due7)}`}>
          <p>DUE 7 DAYS</p>
          <h2>{due7}</h2>
        </div>

        <div className={`metric-card ${kpiClass("due15", due15)}`}>
          <p>DUE 15 DAYS</p>
          <h2>{due15}</h2>
        </div>

        <div className={`metric-card ${kpiClass("active", active)}`}>
          <p>ACTIVE</p>
          <h2>{active}</h2>
        </div>
      </div>

      {/* CHARTS */}
      <div style={{ padding: "0 60px 60px" }}>
        <h2>Project Risk Distribution</h2>
        <div style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={riskData}>
              <XAxis dataKey="name" stroke="#ccc" />
              <YAxis stroke="#ccc" />
              <Tooltip />
              <Bar dataKey="value" fill="#10b981" barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ padding: "0 60px 60px" }}>
        <h2>System Loading</h2>
        <div style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={systemData}>
              <XAxis dataKey="name" stroke="#ccc" />
              <YAxis stroke="#ccc" />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" barSize={25} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* DELIVERABLES */}
      <div className="critical-section">
        <h2>Critical Deliverables</h2>

        {filteredDeliverables.slice(0, 10).map((item, index) => {
          const dueDate = new Date(item.due_date);
          const today = new Date();
          const diffDays = Math.ceil(
            (dueDate.getTime() - today.getTime()) /
            (1000 * 60 * 60 * 24)
          );

          const isOverdue = diffDays < 0;

          return (
            <div
              key={item.id}
              className={`critical-row ${isOverdue ? "row-overdue" : ""}`}
            >
              <div>{index + 1}</div>
              <div>{item.projects?.name}</div>
              <div>{item.title}</div>
              <div>{dueDate.toLocaleDateString()}</div>
              <div className={isOverdue ? "due-overdue" : ""}>
                {isOverdue
                  ? `${Math.abs(diffDays)} overdue`
                  : `${diffDays} days`}
              </div>
              <div>
                <select
                  value={item.status}
                  onChange={(e) =>
                    updateStatus(item.id, e.target.value)
                  }
                >
                  <option>Not Started</option>
                  <option>In Progress</option>
                  <option>Completed</option>
                </select>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}