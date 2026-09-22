"use client";

import { useEffect, useState } from "react";
import {
  Bell,
  Search,
} from "@/components/icons";
import {
  usePathname,
  useRouter,
} from "next/navigation";
import Sidebar from "./Sidebar";
import type { Role } from "@/lib/data";

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [role, setRole] =
    useState<Role | null>(null);

  const [name, setName] =
    useState("");

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token =
      localStorage.getItem(
        "eduportal-token"
      );

    const storedRole =
      localStorage.getItem(
        "eduportal-role"
      ) as Role | null;

    const storedName =
      localStorage.getItem(
        "eduportal-name"
      );

    if (!token || !storedRole) {
      router.replace("/login");
      return;
    }

    const validRoles: Role[] = [
      "dosen",
      "asisten",
      "mahasiswa",
    ];

    if (!validRoles.includes(storedRole)) {
      localStorage.removeItem(
        "eduportal-token"
      );
      localStorage.removeItem(
        "eduportal-role"
      );
      localStorage.removeItem(
        "eduportal-name"
      );

      router.replace("/login");
      return;
    }

    if (
      pathname.startsWith("/asisten") &&
      storedRole !== "asisten"
    ) {
      router.replace("/dashboard");
      return;
    }

    if (
      pathname.startsWith("/mahasiswa") &&
      storedRole !== "mahasiswa"
    ) {
      router.replace("/dashboard");
      return;
    }

    if (
      pathname.startsWith("/dosen") &&
      storedRole !== "dosen"
    ) {
      router.replace("/dashboard");
      return;
    }

    setRole(storedRole);

    setName(
      storedName ||
        (storedRole === "dosen"
          ? "Dr. Rizky Januar Akbar"
          : storedRole === "asisten"
          ? "Asisten Dosen Demo"
          : "Mahasiswa")
    );
  }, [pathname, router]);

  if (!role) {
    return (
      <div
        style={{
          padding: 40,
        }}
      >
        Loading...
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Sidebar
        role={role}
        name={name}
      />

      <main className="main">
        <header className="topbar">
          <div className="crumb">
            Institut Teknologi Sepuluh Nopember /
            Academic Portal
          </div>

          <div className="top-actions">
            <button className="icon-button">
              <Search size={17} />
            </button>

            <button className="icon-button">
              <Bell size={17} />
            </button>
          </div>
        </header>

        {children}
      </main>
    </div>
  );
}