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

const [riskData,setRiskData]=useState<any[]>([]);
const [systemLoad,setSystemLoad]=useState<any[]>([]);
const [agingData,setAgingData]=useState<any[]>([]);
const [topProjects,setTopProjects]=useState<any[]>([]);

const [overdue,setOverdue]=useState(0);
const [due7,setDue7]=useState(0);
const [due15,setDue15]=useState(0);
const [active,setActive]=useState(0);

useEffect(()=>{
loadData();
},[]);

async function loadData(){

const {data}=await supabase
.from("deliverables")
.select(`
*,
projects(name)
`);

const records=data||[];

setDeliverables(records);

calculateAnalytics(records);

}

function calculateAnalytics(records:any[]){

const today=new Date();

let o=0;
let d7=0;
let d15=0;
let a=0;

const projectMap:any={};
const systemMap:any={};

const aging={
b1:0,
b2:0,
b3:0,
b4:0
};

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
Object.keys(systemMap).map(s=>({
name:s,
value:systemMap[s]
}))
);

const risk=Object.keys(projectMap).map(p=>{

const score=
projectMap[p].o*3+
projectMap[p].d7*2+
projectMap[p].d15*1;

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

return(

<div className="dashboard-container">

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


{/* MAIN CHARTS */}

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

</div>


{/* ANALYTICS */}

<div className="analytics-grid">

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

</div>

);

}