"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/app/lib/supabase";

export default function ProjectDetails() {
  const { id } = useParams();
  const [project, setProject] = useState<any>(null);

  useEffect(() => {
    fetchProject();
  }, []);

  async function fetchProject() {
    const { data } = await supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .single();

    setProject(data);
  }

  if (!project) return <div style={{ padding: 40 }}>Loading...</div>;

  return (
    <div style={{ padding: 40 }}>
      <h1>{project.name}</h1>
      <p>Location: {project.location}</p>
      <p>Status: {project.status}</p>
    </div>
  );
}