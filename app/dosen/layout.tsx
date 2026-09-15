"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";

export default function DosenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [name, setName] = useState("Dr. Rizky Januar Akbar");

  useEffect(() => {
    const storedName = localStorage.getItem("eduportal-name");

    if (storedName) {
      setName(storedName);
    }
  }, []);

  return (
    <div className="app-shell">
      <Sidebar role="dosen" name={name} />

      <main className="main">
        {children}
      </main>
    </div>
  );
}