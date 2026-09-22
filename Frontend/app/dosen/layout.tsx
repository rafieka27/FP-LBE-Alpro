"use client";

import {
  useEffect,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import Sidebar from "@/components/Sidebar";

export default function DosenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const [name, setName] = useState(
    "Dr. Rizky Januar Akbar"
  );

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const token =
      localStorage.getItem(
        "eduportal-token"
      );

    const role =
      localStorage.getItem(
        "eduportal-role"
      );

    if (
      !token ||
      role !== "dosen"
    ) {
      router.replace("/login");
      return;
    }

    const storedName =
      localStorage.getItem(
        "eduportal-name"
      );

    if (storedName) {
      setName(storedName);
    }

    setLoading(false);
  }, [router]);

  if (loading) {
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
        role="dosen"
        name={name}
      />

      <main className="main">
        {children}
      </main>
    </div>
  );
}