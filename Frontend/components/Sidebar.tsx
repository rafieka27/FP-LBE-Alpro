"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import {
  ClipboardList,
  GraduationCap,
  LogOut,
  Upload,
  Users,
  FileText,
  LayoutDashboard,
} from "@/components/icons";

import type { Role } from "@/lib/data";

const menus: Record<
  Role,
  { label: string; href: string; icon: any }[]
> = {
  dosen: [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Nilai Mahasiswa",
      href: "/dosen/nilai",
      icon: ClipboardList,
    },
    {
      label: "Tugas",
      href: "/dosen/tugas",
      icon: Upload,
    },
    {
      label: "Kelas Saya",
      href: "/dosen/kelas",
      icon: Users,
    },
  ],

  asisten: [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Input Nilai",
      href: "/asisten/nilai",
      icon: ClipboardList,
    },
  ],

  mahasiswa: [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Tugas",
      href: "/mahasiswa/tugas",
      icon: FileText,
    },
    {
      label: "Rekap Nilai",
      href: "/mahasiswa/nilai",
      icon: GraduationCap,
    },
  ],
};

export default function Sidebar({
  role,
  name,
}: {
  role: Role;
  name: string;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((x) => x[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const roleLabel =
    role === "dosen"
      ? "Dosen"
      : role === "asisten"
      ? "Asisten Dosen"
      : "Mahasiswa";

const handleLogout = () => {
  localStorage.removeItem("eduportal-token");
  localStorage.removeItem("eduportal-email");
  localStorage.removeItem("eduportal-role");
  localStorage.removeItem("eduportal-name");

  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("email");

  router.push("/login");
};

  return (
    <aside className="sidebar">

      {/* =========================
          BRAND
          ========================= */}
      <div className="sidebar-brand">

        <img
          src="/logo-myits-white.svg"
          alt="myITS"
          className="sidebar-brand-logo"
        />

        <span className="sidebar-brand-recap">
          Recap
        </span>

      </div>

      {/* =========================
          NAVIGATION
          ========================= */}
      <nav className="sidebar-nav">

        {menus[role].map(
          ({ label, href, icon: Icon }) => {

            const active = pathname === href;

            return (
              <Link
                key={href}
                href={href}
                className={`sidebar-nav-link ${
                  active ? "active" : ""
                }`}
              >
                <Icon size={19} />

                <span>
                  {label}
                </span>
              </Link>
            );
          }
        )}

      </nav>

      {/* =========================
          USER + LOGOUT
          ========================= */}
      <div className="sidebar-bottom">

        <div className="sidebar-profile">

          <div className="sidebar-avatar">
            {initials}
          </div>

          <div className="sidebar-profile-copy">

            <div className="sidebar-profile-name">
              {name}
            </div>

            <div className="sidebar-profile-role">
              {roleLabel}
            </div>

          </div>

        </div>

        <button
          type="button"
          className="sidebar-logout"
          onClick={handleLogout}
        >
          <LogOut size={17} />

          <span>
            Logout
          </span>
        </button>

      </div>

    </aside>
  );
}