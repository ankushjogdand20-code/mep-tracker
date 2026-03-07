"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

import {
BarChart,
Bar,
XAxis,
YAxis,
Tooltip,
ResponsiveContainer
} from "recharts";

export default function Dashboard(){

const [deliverables,setDeliverables]=useState<any[]>([]);
const [filteredDeliverables,setFilteredDeliverables]=useState<any[]>([]);

const [projects,setProjects]=useState<string[]>([]);
const [systems,setSystems]=useState<string[]>([]);

const [selectedProject,setSelectedProject]=useState("");
const [selectedSystem,setSelectedSystem]=useState("");
const [selectedStatus,setSelectedStatus]=useState("");

const [overdue,setOverdue]=useState(0);
const [due7,setDue7]=useState(0);
const [due15,setDue15]=useState(0);
const [active,setActive]=useState(0);

const [riskData,setRiskData]=useState<any[]>([]);
const [systemLoad,setSystemLoad]=useState<any[]>([]);
const [agingData,setAgingData]=useState<any[]>([]);
const [topProjects,setTopProjects]=useState<any[]>([]);

const userEmail="ankushjogdand20@gmail.com";

useEffect(()=>{
loadData();
},[]);



async function loadData(){

const {data}=await supabase
.from("deliverables")
.select(`*,projects(name)`);

const records=data||[];

setDeliverables(records);
setFilteredDeliverables(records);

setProjects([...new Set(records.map(r=>r.projects?.name))]);
setSystems([...new Set(records.map(r=>r.system?.toUpperCase()?.trim()))]);

calculateAnalytics(records);

}



function calculateAnalytics(records:any[]){

const today=new Date();

let o=0,d7=0,d15=0,a=0;

const projectMap:any={};
const systemMap:any={};

const aging={b1:0,b2:0,b3:0,b4:0};

records.forEach(item=>{

const due=new Date(item.due_date);
const diff=Math.floor((due.getTime()-today.getTime())/(1000*60*60*24));

if(item.status!=="Completed"){

a++;

if(diff<0){

o++;

const overdue=Math.abs(diff);

if(overdue<=7) aging.b1++;
else if(overdue<=15) aging.b2++;
else if(overdue<=30) aging.b3++;
else aging.b4++;

}
else if(diff<=7) d7++;
else if(diff<=15) d15++;

}

const project=item.projects?.name;

if(project){

if(!projectMap[project]){
projectMap[project]={o:0,d7:0,d15:0};
}

if(diff<0) projectMap[project].o++;
else if(diff<=7) projectMap[project].d7++;
else if(diff<=15) projectMap[project].d15++;

}

const system=item.system?.toUpperCase()?.trim();

if(system){

if(!systemMap[system]) systemMap[system]=0;

if(item.status!=="Completed") systemMap[system]++;

}

});


setOverdue(o);
setDue7(d7);
setDue15(d15);
setActive(a);


setSystemLoad(
Object.keys(systemMap).map(s=>({name:s,value:systemMap[s]}))
);


const risk=Object.keys(projectMap).map(p=>{

const score=
projectMap[p].o*3+
projectMap[p].d7*2+
projectMap[p].d15;

return {name:p,score};

});


setRiskData(risk);

setTopProjects(
risk.sort((a,b)=>b.score-a.score).slice(0,5)
);


setAgingData([
{name:"0-7 Days",value:aging.b1},
{name:"8-15 Days",value:aging.b2},
{name:"16-30 Days",value:aging.b3},
{name:"30+ Days",value:aging.b4}
]);

}



function applyFilters(){

let data=[...deliverables];

if(selectedProject)
data=data.filter(d=>d.projects?.name===selectedProject);

if(selectedSystem)
data=data.filter(d=>d.system?.toUpperCase()===selectedSystem);

if(selectedStatus)
data=data.filter(d=>d.status===selectedStatus);

setFilteredDeliverables(data);

/* 🔥 IMPORTANT FIX → KPIs NOW FOLLOW FILTERS */

calculateAnalytics(data);

}

useEffect(()=>{
applyFilters();
},[selectedProject,selectedSystem,selectedStatus]);



const criticalDeliverables=
[...filteredDeliverables]
.filter(d=>d.status!=="Completed")
.sort((a,b)=>new Date(a.due_date).getTime()-new Date(b.due_date).getTime())
.slice(0,10);



function getDelay(date:any){

const today=new Date();
const due=new Date(date);

const diff=Math.floor((today.getTime()-due.getTime())/(1000*60*60*24));

return diff>0?diff:0;

}



return(

<div className="dashboard-container">


{/* HEADER */}

<div className="header">

<div>

<div className="tagline">IT'S THOUGHTFUL. IT'S</div>

<div className="brand">Rustomjee</div>

<div className="subtitle">MEP Executive Command Center</div>

</div>


<div className="user-panel">

<div className="user-email">{userEmail}</div>

<button className="logout-btn">Logout</button>

</div>

</div>



{/* FILTERS */}

<div className="filters">

<select onChange={(e)=>setSelectedProject(e.target.value)}>
<option value="">All Projects</option>
{projects.map(p=>(
<option key={p}>{p}</option>
))}
</select>


<select onChange={(e)=>setSelectedSystem(e.target.value)}>
<option value="">All Systems</option>
{systems.map(s=>(
<option key={s}>{s}</option>
))}
</select>


<select onChange={(e)=>setSelectedStatus(e.target.value)}>
<option value="">All Status</option>
<option>Not Started</option>
<option>In Progress</option>
<option>Completed</option>
</select>

</div>



{/* KPI */}

<div className="metrics-grid">

<div className="metric-card kpi-critical">
<p>OVERDUE</p>
<h2>{overdue}</h2>
</div>

<div className="metric-card kpi-yellow">
<p>DUE 7 DAYS</p>
<h2>{due7}</h2>
</div>

<div className="metric-card kpi-amber">
<p>DUE 15 DAYS</p>
<h2>{due15}</h2>
</div>

<div className="metric-card kpi-blue">
<p>ACTIVE</p>
<h2>{active}</h2>
</div>

</div>



{/* ANALYTICS GRID */}

<div className="analytics-grid">

<div className="chart-box">

<h2>Project Risk Distribution</h2>

<ResponsiveContainer width="100%" height={300}>
<BarChart data={riskData}>
<XAxis dataKey="name"/>
<YAxis/>
<Tooltip/>
<Bar dataKey="score" fill="#16a34a" barSize={30}/>
</BarChart>
</ResponsiveContainer>

</div>


<div className="chart-box">

<h2>System Loading</h2>

<ResponsiveContainer width="100%" height={300}>
<BarChart data={systemLoad}>
<XAxis dataKey="name"/>
<YAxis/>
<Tooltip/>
<Bar dataKey="value" fill="#3b82f6" barSize={24}/>
</BarChart>
</ResponsiveContainer>

</div>


<div className="chart-box">

<h2>Deliverable Aging</h2>

<ResponsiveContainer width="100%" height={300}>
<BarChart data={agingData}>
<XAxis dataKey="name"/>
<YAxis/>
<Tooltip/>
<Bar dataKey="value" fill="#ef4444" barSize={24}/>
</BarChart>
</ResponsiveContainer>

</div>


<div className="chart-box">

<h2>Top Risk Projects</h2>

<ul className="risk-list">

{topProjects.map((p,i)=>(
<li key={i}>
{p.name} — Risk Score {p.score}
</li>
))}

</ul>

</div>

</div>



{/* CRITICAL DELIVERABLES */}

<div className="deliverables-section">

<h2>Critical Deliverables (Top 10)</h2>

<table className="deliverables-table">

<thead>

<tr>
<th>Sr</th>
<th>Project</th>
<th>Deliverable</th>
<th>Due Date</th>
<th>Delayed By</th>
<th>Status</th>
</tr>

</thead>


<tbody>

{criticalDeliverables.map((d,i)=>{

const delay=getDelay(d.due_date);

return(

<tr key={i}>

<td>{i+1}</td>

<td>{d.projects?.name}</td>

<td>{d.title}</td>

<td>{d.due_date}</td>

<td className="delay">{delay>0?`${delay} days`: "-"}</td>

<td>

<select defaultValue={d.status}>
<option>Not Started</option>
<option>In Progress</option>
<option>Completed</option>
</select>

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