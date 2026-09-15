"use client";
import { useEffect, useState } from "react";
import { Bell, Search } from "@/components/icons";
import { useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import type { Role } from "@/lib/data";

const fallback: Record<Role, string> = { dosen: "Dr. Rizky Januar Akbar", asisten: "Rafi Eka Pramudya", mahasiswa: "Adit Pratama" };
export default function AppShell({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role | null>(null);
  const router = useRouter();
  useEffect(()=>{ const r=localStorage.getItem("eduportal-role") as Role | null; if(!r) router.replace("/login"); else setRole(r); },[router]);
  if(!role) return <div style={{padding:40}}>Loading...</div>;
  return <div className="app-shell"><Sidebar role={role} name={fallback[role]}/><main className="main"><header className="topbar"><div className="crumb">Institut Teknologi Sepuluh Nopember / Academic Portal</div><div className="top-actions"><button className="icon-button"><Search size={17}/></button><button className="icon-button"><Bell size={17}/></button></div></header>{children}</main></div>;
}
