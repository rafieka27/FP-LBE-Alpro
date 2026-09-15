"use client";
import AppShell from "@/components/AppShell";
import { BookOpen, ClipboardCheck, FileText, Users } from "@/components/icons";
import Link from "next/link";
import { classes, assignments } from "@/lib/data";
import { useEffect, useState } from "react";
import type { Role } from "@/lib/data";

export default function Dashboard(){
  const [role,setRole]=useState<Role>("dosen");
  useEffect(()=>setRole((localStorage.getItem("eduportal-role") as Role)||"dosen"),[]);
  return <AppShell><div className="page">
    <div className="page-heading"><div><h1 className="page-title">{role==="dosen"?"Dashboard Dosen":role==="asisten"?"Dashboard Asisten Dosen":"Dashboard Mahasiswa"}</h1><p className="page-subtitle">Ringkasan aktivitas akademik dan akses cepat.</p></div></div>
    <div className="grid-4"><Stat icon={Users} label={role==="mahasiswa"?"Mata Kuliah":"Mahasiswa"} value={role==="mahasiswa"?"4":"122"}/><Stat icon={ClipboardCheck} label="Komponen Nilai" value={role==="dosen"?"8":"13"}/><Stat icon={FileText} label="Tugas Aktif" value={String(assignments.length)}/><Stat icon={BookOpen} label="Kelas" value={role==="mahasiswa"?"4":"3"}/></div>
    <div className="grid-2" style={{marginTop:20}}>
      <div className="card"><h2 className="section-title">{role==="mahasiswa"?"Tugas Terbaru":"Kelas Saya"}</h2><p className="section-subtitle">{role==="mahasiswa"?"Tugas yang perlu diperhatikan.":"Kelas yang sedang dikelola."}</p>
        {role==="mahasiswa"?assignments.slice(0,3).map(a=><div className="assignment" key={a.title}><div><div className="assignment-title">{a.title}</div><div className="assignment-desc">{a.className} · {a.submissions} terkumpul</div></div><span className="deadline">{a.due}</span></div>):classes.map(c=><div className="class-card" key={c.id}><div><div className="class-name">{c.name}</div><div className="meta">{c.subject} · {c.students} mahasiswa</div></div><span className="badge blue">Aktif</span></div>)}
      </div>
      <div className="card"><h2 className="section-title">Aksi Cepat</h2><p className="section-subtitle">Jalan pintas, karena klik tiga puluh kali untuk hal sederhana adalah tradisi software akademik.</p>
        {role==="dosen"&&<><Quick href="/dosen/nilai" icon={ClipboardCheck} text="Input / Edit Nilai"/><Quick href="/dosen/tugas" icon={FileText} text="Upload Tugas"/><Quick href="/dosen/kelas" icon={Users} text="Kelola Kelas"/></>}
        {role==="asisten"&&<Quick href="/asisten/nilai" icon={ClipboardCheck} text="Input Nilai Asisten"/>}
        {role==="mahasiswa"&&<><Quick href="/mahasiswa/tugas" icon={FileText} text="Lihat Tugas"/><Quick href="/mahasiswa/nilai" icon={ClipboardCheck} text="Lihat Rekap Nilai"/></>}
      </div>
    </div>
  </div></AppShell>
}
function Stat({icon:Icon,label,value}:{icon:any,label:string,value:string}){return <div className="card"><div className="stat-row"><div><div className="stat-label">{label}</div><div className="stat-value">{value}</div></div><div className="stat-icon"><Icon size={20}/></div></div></div>}
function Quick({href,icon:Icon,text}:{href:string,icon:any,text:string}){return <Link href={href} className="class-card" style={{marginTop:10}}><span style={{display:"flex",gap:10,alignItems:"center",fontWeight:700}}><Icon size={17}/>{text}</span><span>→</span></Link>}
