"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import {
  BookOpen,
  ClipboardCheck,
  FileText,
  Users,
} from "@/components/icons";
import Link from "next/link";
import type { Role } from "@/lib/data";
import {
  getClassesApi,
  getAssignmentsApi,
  getMeApi,
  getStudentGradesApi,
} from "@/lib/api";

type Student = {
  id: number;
  nrp: string;
  name: string;
  email: string;
};

type ClassItem = {
  id: number;
  code: string;
  name: string;
  subject: string;
  students?: Student[];
};

type Assignment = {
  id: number;
  title: string;
  description: string;
  file_url: string;
  due_at: string;
  status: string;
  class_id: number;
  class?: {
    id: number;
    code: string;
    name: string;
    subject: string;
  };
};

type Grade = {
  id: number;
  student_id: number;
  class_id: number;
  component: string;
  score: number;
  published: boolean;
};

type DashboardStats = {
  classCount: number;
  studentCount: number;
  assignmentCount: number;
  componentCount: number;
  average: number;
};

function formatDateTime(value: string) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function Dashboard() {
  const [role, setRole] =
    useState<Role | null>(null);

  const [classes, setClasses] =
    useState<ClassItem[]>([]);

  const [assignments, setAssignments] =
    useState<Assignment[]>([]);

  const [stats, setStats] =
    useState<DashboardStats>({
      classCount: 0,
      studentCount: 0,
      assignmentCount: 0,
      componentCount: 0,
      average: 0,
    });

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      setLoading(true);

      const storedRole =
        localStorage.getItem(
          "eduportal-role"
        ) as Role | null;

      if (!storedRole) {
        return;
      }

      setRole(storedRole);

      const [
        classResponse,
        assignmentResponse,
      ] = await Promise.all([
        getClassesApi(),
        getAssignmentsApi(),
      ]);

      const classList: ClassItem[] =
        Array.isArray(classResponse)
          ? classResponse
          : [];

      const assignmentList: Assignment[] =
        Array.isArray(assignmentResponse)
          ? assignmentResponse
          : [];

      setAssignments(assignmentList);

      if (
        storedRole === "dosen" ||
        storedRole === "asisten"
      ) {
        setClasses(classList);

        const studentIds =
          new Set<number>();

        const componentNames =
          new Set<string>();

        for (const classItem of classList) {
          (
            classItem.students || []
          ).forEach((student) => {
            studentIds.add(student.id);
          });

          try {
            const gradeResponse = await fetch(
              `http://localhost:8080/api/grades?class_id=${classItem.id}`,
              {
                headers: {
                  Authorization:
                    `Bearer ${localStorage.getItem(
                      "eduportal-token"
                    )}`,
                },
              }
            );

            if (gradeResponse.ok) {
              const classGrades: Grade[] =
                await gradeResponse.json();

              classGrades.forEach((grade) => {
                componentNames.add(
                  grade.component
                );
              });
            }
          } catch (error) {
            console.error(
              `Gagal mengambil nilai kelas ${classItem.id}`,
              error
            );
          }
        }

        setStats({
          classCount: classList.length,
          studentCount: studentIds.size,
          assignmentCount:
            assignmentList.filter(
              (assignment) =>
                assignment.status ===
                "Aktif"
            ).length,
          componentCount:
            componentNames.size,
          average: 0,
        });

        return;
      }

      if (storedRole === "mahasiswa") {
        const me = await getMeApi();

        const studentId =
          me?.id ??
          me?.user?.id ??
          null;

        if (!studentId) {
          throw new Error(
            "ID mahasiswa tidak ditemukan."
          );
        }

        // Cari hanya kelas yang diikuti mahasiswa
        const enrolledClasses =
          classList.filter(
            (classItem) =>
              (
                classItem.students ||
                []
              ).some(
                (student) =>
                  student.id ===
                  studentId
              )
          );

        setClasses(
          enrolledClasses
        );

        const enrolledClassIds =
          new Set(
            enrolledClasses.map(
              (classItem) =>
                classItem.id
            )
          );

        // Nilai published mahasiswa
        const gradeResponse =
          await getStudentGradesApi(
            studentId
          );

        const studentGrades: Grade[] =
          Array.isArray(gradeResponse)
            ? gradeResponse
            : [];

        const total =
          studentGrades.reduce(
            (sum, grade) =>
              sum + Number(grade.score),
            0
          );

        const average =
          studentGrades.length > 0
            ? Math.round(
                total /
                  studentGrades.length
              )
            : 0;

        // Hanya tugas dari kelas yang diikuti
        const studentAssignments =
          assignmentList.filter(
            (assignment) =>
              enrolledClassIds.has(
                assignment.class_id
              ) &&
              assignment.status ===
                "Aktif"
          );

        setStats({
          classCount:
            enrolledClasses.length,

          studentCount: 0,

          assignmentCount:
            studentAssignments.length,

          componentCount:
            studentGrades.length,

          average,
        });

        // Penting: Dashboard mahasiswa
        // hanya menyimpan tugas dari kelasnya.
        setAssignments(
          studentAssignments
        );
      }
    } catch (error) {
      console.error(
        "Dashboard error:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  if (!role || loading) {
    return (
      <AppShell>
        <div className="page">
          <div className="card">
            <p>
              Memuat dashboard...
            </p>
          </div>
        </div>
      </AppShell>
    );
  }

  const activeAssignments =
    assignments.filter(
      (assignment) =>
        assignment.status ===
        "Aktif"
    );

  return (
    <AppShell>
      <div className="page">
        {/* HEADER */}
        <div className="page-heading">
          <div>
            <h1 className="page-title">
              {role === "dosen"
                ? "Dashboard Dosen"
                : role === "asisten"
                ? "Dashboard Asisten Dosen"
                : "Dashboard Mahasiswa"}
            </h1>

            <p className="page-subtitle">
              Ringkasan aktivitas akademik
              dan akses cepat.
            </p>
          </div>
        </div>

        {/* STATISTICS */}
        <div className="grid-4">
          {role === "mahasiswa" ? (
            <>
              <Stat
                icon={BookOpen}
                label="Mata Kuliah"
                value={String(
                  stats.classCount
                )}
              />

              <Stat
                icon={ClipboardCheck}
                label="Nilai Published"
                value={String(
                  stats.componentCount
                )}
              />

              <Stat
                icon={FileText}
                label="Tugas Aktif"
                value={String(
                  stats.assignmentCount
                )}
              />

              <Stat
                icon={BookOpen}
                label="Rata-rata"
                value={String(
                  stats.average
                )}
              />
            </>
          ) : (
            <>
              <Stat
                icon={Users}
                label="Mahasiswa"
                value={String(
                  stats.studentCount
                )}
              />

              <Stat
                icon={ClipboardCheck}
                label="Komponen Nilai"
                value={String(
                  stats.componentCount
                )}
              />

              <Stat
                icon={FileText}
                label="Tugas Aktif"
                value={String(
                  stats.assignmentCount
                )}
              />

              <Stat
                icon={BookOpen}
                label="Kelas"
                value={String(
                  stats.classCount
                )}
              />
            </>
          )}
        </div>

        {/* MAIN CONTENT */}
        <div
          className="grid-2"
          style={{
            marginTop: 20,
          }}
        >
          {/* LEFT CARD */}
          <div className="card">
            <h2 className="section-title">
              {role === "mahasiswa"
                ? "Tugas Terbaru"
                : "Kelas Saya"}
            </h2>

            <p className="section-subtitle">
              {role === "mahasiswa"
                ? "Tugas dari kelas yang sedang kamu ikuti."
                : "Kelas yang sedang dikelola."}
            </p>

            {role === "mahasiswa" ? (
              activeAssignments.length ===
              0 ? (
                <div
                  style={{
                    padding: 30,
                    textAlign:
                      "center",
                    color: "#64748b",
                  }}
                >
                  Belum ada tugas
                  untuk kelas yang
                  kamu ikuti.
                </div>
              ) : (
                activeAssignments
                  .slice(0, 3)
                  .map(
                    (assignment) => (
                      <div
                        className="assignment"
                        key={
                          assignment.id
                        }
                      >
                        <div>
                          <div className="assignment-title">
                            {
                              assignment.title
                            }
                          </div>

                          <div className="assignment-desc">
                            {assignment
                              .class
                              ?.name ||
                              `Kelas #${assignment.class_id}`}
                          </div>
                        </div>

                        <span className="deadline">
                          {formatDateTime(
                            assignment.due_at
                          )}
                        </span>
                      </div>
                    )
                  )
              )
            ) : classes.length === 0 ? (
              <div
                style={{
                  padding: 30,
                  textAlign:
                    "center",
                  color: "#64748b",
                }}
              >
                Belum ada kelas.
              </div>
            ) : (
              classes
                .slice(0, 5)
                .map(
                  (classItem) => (
                    <div
                      className="class-card"
                      key={
                        classItem.id
                      }
                    >
                      <div>
                        <div className="class-name">
                          {classItem.name}
                        </div>

                        <div className="meta">
                          {
                            classItem.subject
                          }
                          {" · "}
                          {
                            (
                              classItem
                                .students ||
                              []
                            ).length
                          }{" "}
                          mahasiswa
                        </div>
                      </div>

                      <span className="badge blue">
                        Aktif
                      </span>
                    </div>
                  )
                )
            )}
          </div>

          {/* QUICK ACTION */}
          <div className="card">
            <h2 className="section-title">
              Aksi Cepat
            </h2>

            <p className="section-subtitle">
              Jalan pintas menuju fitur
              utama.
            </p>

            {role === "dosen" && (
              <>
                <Quick
                  href="/dosen/nilai"
                  icon={ClipboardCheck}
                  text="Input / Edit Nilai"
                />

                <Quick
                  href="/dosen/tugas"
                  icon={FileText}
                  text="Upload Tugas"
                />

                <Quick
                  href="/dosen/kelas"
                  icon={Users}
                  text="Kelola Kelas"
                />
              </>
            )}

            {role === "asisten" && (
              <Quick
                href="/asisten/nilai"
                icon={ClipboardCheck}
                text="Input Nilai Asisten"
              />
            )}

            {role === "mahasiswa" && (
              <>
                <Quick
                  href="/mahasiswa/tugas"
                  icon={FileText}
                  text="Lihat Tugas"
                />

                <Quick
                  href="/mahasiswa/nilai"
                  icon={ClipboardCheck}
                  text="Lihat Rekap Nilai"
                />
              </>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <div className="card">
      <div className="stat-row">
        <div>
          <div className="stat-label">
            {label}
          </div>

          <div className="stat-value">
            {value}
          </div>
        </div>

        <div className="stat-icon">
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

function Quick({
  href,
  icon: Icon,
  text,
}: {
  href: string;
  icon: any;
  text: string;
}) {
  return (
    <Link
      href={href}
      className="class-card"
      style={{
        marginTop: 10,
      }}
    >
      <span
        style={{
          display: "flex",
          gap: 10,
          alignItems: "center",
          fontWeight: 700,
        }}
      >
        <Icon size={17} />
        {text}
      </span>

      <span>→</span>
    </Link>
  );
}