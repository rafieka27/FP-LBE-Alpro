"use client";

import { FormEvent, useState } from "react";
import {
  CheckCircle2,
  LockKeyhole,
  Mail,
} from "@/components/icons";
import { useRouter } from "next/navigation";

const demos = [
  {
    role: "dosen",
    label: "Dosen",
    email: "dosen@its.ac.id",
    password: "demo123",
  },
  {
    role: "asisten",
    label: "Asisten Dosen",
    email: "asisten@its.ac.id",
    password: "demo123",
  },
  {
    role: "mahasiswa",
    label: "Mahasiswa",
    email: "5025251001@student.its.ac.id",
    password: "demo123",
  },
];

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();

    setError("");

    const found = demos.find(
      (demo) =>
        demo.email.toLowerCase() === email.toLowerCase() &&
        demo.password === password
    );

    if (!found) {
      setError("Email atau password salah.");
      return;
    }
    localStorage.setItem("eduportal-role", found.role);
    localStorage.setItem("eduportal-email", found.email);
    router.push("/dashboard");
  };

  const useDemo = (demo: (typeof demos)[number]) => {
    setEmail(demo.email);
    setPassword(demo.password);
    setError("");
  };

  return (
    <main className="login-page">
      <section className="login-hero">
        <div className="brand">
          <img
            src="/logo-myits-white.svg"
            alt="myITS"
            className="brand-logo"
          />

          <span className="brand-recap">
            Recap
          </span>
        </div>
        <div className="login-hero-inner">

          <div className="hero-kicker">
            ACADEMIC RESULTS MANAGEMENT
          </div>

          <h1 className="hero-title">
            Rekap Nilai Akademik
          </h1>

          <p className="hero-copy">
            Rekap nilai, pengumpulan tugas, dan pengelolaan kelas
            dalam satu platform akademik.
          </p>

          <div className="feature-list">

            <div className="feature">
              <CheckCircle2 size={17} />
              <span>
                Input nilai manual maupun CSV
              </span>
            </div>

            <div className="feature">
              <CheckCircle2 size={17} />
              <span>
                Akses berbeda untuk Dosen, Asisten, dan Mahasiswa
              </span>
            </div>

            <div className="feature">
              <CheckCircle2 size={17} />
              <span>
                Rekap nilai terpusat dan transparan
              </span>
            </div>

          </div>

        </div>

      </section>
      <section className="login-panel">

        <div className="login-card">

          <h2 className="login-title">
            Masuk ke myITS Recap
          </h2>

          <p className="login-subtitle">
            Gunakan akun ITS Anda untuk mengakses portal akademik.
          </p>
          {error && (
            <div className="error">
              {error}
            </div>
          )}
          <form
            className="login-form"
            onSubmit={submit}
          >
            <div className="field">

              <label>
                Email
              </label>

              <div
                style={{
                  position: "relative",
                }}
              >

                <Mail
                  size={16}
                  style={{
                    position: "absolute",
                    left: 12,
                    top: 13,
                    color: "#8792a5",
                  }}
                />

                <input
                  className="input"
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  placeholder="NRP@student.its.ac.id"
                  style={{
                    paddingLeft: 40,
                  }}
                  required
                />

              </div>

            </div>
            <div className="field">

              <label>
                Password
              </label>

              <div
                style={{
                  position: "relative",
                }}
              >

                <LockKeyhole
                  size={16}
                  style={{
                    position: "absolute",
                    left: 12,
                    top: 13,
                    color: "#8792a5",
                  }}
                />

                <input
                  className="input"
                  type="password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  placeholder="Masukkan password"
                  style={{
                    paddingLeft: 40,
                  }}
                  required
                />

              </div>

            </div>
            <button
              className="btn primary"
              type="submit"
            >
              Masuk
            </button>

          </form>
          <div className="demo">

            <div className="demo-title">
              AKUN DEMO
            </div>

            {demos.map((demo) => (
              <button
                key={demo.role}
                type="button"
                className="demo-btn"
                onClick={() => useDemo(demo)}
              >

                <span>
                  {demo.label}
                </span>

                <span>
                  {demo.email}
                </span>

              </button>
            ))}

          </div>

        </div>

      </section>

    </main>
  );
}