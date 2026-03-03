"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from "recharts";

export default function Dashboard() {
  const statusData = [
    { name: "Overdue", value: 2 },
    { name: "Due Soon", value: 1 },
    { name: "Completed", value: 5 }
  ];

  const systemLoadData = [
    { name: "Electrical", value: 8 },
    { name: "HVAC", value: 5 },
    { name: "Plumbing", value: 3 }
  ];

  const portfolioData = [
    { name: "Residential", value: 6 },
    { name: "Commercial", value: 3 },
    { name: "Mixed Use", value: 2 }
  ];

  return (
    <div style={{ padding: "40px" }}>

      {/* KPI ROW */}
      <div style={kpiRow}>
        <KPIBox title="OVERDUE" value="2" color="#b91c1c" />
        <KPIBox title="DUE IN 7 DAYS" value="0" color="#ca8a04" />
        <KPIBox title="DUE IN 15 DAYS" value="0" color="#1d4ed8" />
      </div>

      <div style={{ ...kpiFullWidth }}>
        <KPIBox title="ACTIVE DELIVERABLES" value="4" color="#059669" full />
      </div>

      {/* CHART ROW */}
      <div style={rowStyle}>
        <ChartCard title="STATUS DISTRIBUTION">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={statusData}
                dataKey="value"
                nameKey="name"
                outerRadius={95}
                label
              >
                {statusData.map((_, index) => (
                  <Cell
                    key={index}
                    fill={["#ef4444", "#facc15", "#22c55e"][index % 3]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="SYSTEM LOAD">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={systemLoadData}>
              <XAxis dataKey="name" stroke="#ccc" />
              <YAxis stroke="#ccc" />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div style={{ ...chartFullWidth }}>
        <ChartCard title="PROJECT PORTFOLIO">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={portfolioData}>
              <XAxis dataKey="name" stroke="#ccc" />
              <YAxis stroke="#ccc" />
              <Tooltip />
              <Bar dataKey="value" fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

/* ---------- COMPONENTS ---------- */

function KPIBox({
  title,
  value,
  color,
  full = false
}: {
  title: string;
  value: string;
  color: string;
  full?: boolean;
}) {
  return (
    <div
      style={{
        flex: full ? undefined : 1,
        background: color,
        padding: "30px",
        borderRadius: "20px",
        color: "white",
        boxShadow: "0 15px 35px rgba(0,0,0,0.5)"
      }}
    >
      <div style={{ opacity: 0.8 }}>{title}</div>
      <div style={{ fontSize: "40px", marginTop: "10px" }}>{value}</div>
    </div>
  );
}

function ChartCard({
  title,
  children
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div style={premiumCard}>
      <h3 style={titleStyle}>{title}</h3>
      {children}
    </div>
  );
}

/* ---------- STYLES ---------- */

const kpiRow = {
  display: "flex",
  gap: "30px"
};

const kpiFullWidth = {
  marginTop: "30px"
};

const rowStyle = {
  display: "flex",
  gap: "30px",
  marginTop: "40px"
};

const chartFullWidth = {
  marginTop: "40px"
};

const premiumCard = {
  flex: 1,
  background: "linear-gradient(145deg, #0f1e3a, #0b1730)",
  padding: "30px",
  borderRadius: "20px",
  color: "white",
  boxShadow: "0 15px 35px rgba(0,0,0,0.6)"
};

const titleStyle = {
  marginBottom: "20px",
  letterSpacing: "1px",
  fontWeight: 500
};