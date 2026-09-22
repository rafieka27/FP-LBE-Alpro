"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import {
  Download,
  FileText,
} from "@/components/icons";

import {
  getAssignmentsApi,
  getClassesApi,
  getMeApi,
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

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8080";

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

function getFileUrl(fileUrl: string) {
  if (!fileUrl) return "";

  if (
    fileUrl.startsWith("http://") ||
    fileUrl.startsWith("https://")
  ) {
    return fileUrl;
  }

  return `${API_URL}${
    fileUrl.startsWith("/") ? "" : "/"
  }${fileUrl}`;
}

export default function MahasiswaTugas() {
  const [assignments, setAssignments] =
    useState<Assignment[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    loadAssignments();
  }, []);

  async function loadAssignments() {
    try {
      setLoading(true);
      setError("");

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

      const enrolledClassIds =
        new Set<number>();

      classList.forEach((classItem) => {
        const isEnrolled =
          (classItem.students || []).some(
            (student) =>
              student.id === studentId
          );

        if (isEnrolled) {
          enrolledClassIds.add(
            classItem.id
          );
        }
      });

      const filteredAssignments =
        assignmentList.filter(
          (assignment) =>
            enrolledClassIds.has(
              assignment.class_id
            )
        );

      setAssignments(
        filteredAssignments
      );
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Gagal mengambil daftar tugas."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <div className="page">
        <div className="page-heading">
          <div>
            <h1 className="page-title">
              Tugas Saya
            </h1>

            <p className="page-subtitle">
              Akses tugas yang diberikan dosen
              dari kelas yang sedang kamu ikuti.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="card">
            <p>Memuat tugas...</p>
          </div>
        ) : error ? (
          <div className="card">
            <p
              style={{
                color: "#dc2626",
                marginBottom: 12,
              }}
            >
              {error}
            </p>

            <button
              className="btn primary"
              onClick={loadAssignments}
            >
              Coba Lagi
            </button>
          </div>
        ) : assignments.length === 0 ? (
          <div className="card">
            <div
              style={{
                padding: 40,
                textAlign: "center",
                color: "#64748b",
              }}
            >
              <FileText size={40} />

              <p
                style={{
                  marginTop: 12,
                }}
              >
                Belum ada tugas untuk kelas
                yang kamu ikuti.
              </p>
            </div>
          </div>
        ) : (
          <div className="card">
            {assignments.map(
              (assignment) => {
                const fileUrl =
                  getFileUrl(
                    assignment.file_url
                  );

                const fileName =
                  assignment.file_url
                    ? assignment.file_url
                        .split("/")
                        .pop() ||
                      "File tersedia"
                    : "Tidak ada file";

                return (
                  <div
                    className="assignment"
                    key={
                      assignment.id
                    }
                  >
                    <div
                      style={{
                        display: "flex",
                        gap: 13,
                      }}
                    >
                      <div className="stat-icon">
                        <FileText size={18} />
                      </div>

                      <div>
                        <div className="assignment-title">
                          {
                            assignment.title
                          }
                        </div>

                        <div className="assignment-desc">
                          {assignment.description ||
                            "Tidak ada deskripsi."}
                        </div>

                        <div
                          className="meta"
                          style={{
                            marginTop: 8,
                          }}
                        >
                          {assignment
                            .class
                            ?.name ||
                            `Kelas #${assignment.class_id}`}
                          {" · "}
                          File: {fileName}
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        textAlign: "right",
                      }}
                    >
                      <span className="badge green">
                        {assignment.status ||
                          "Aktif"}
                      </span>

                      <div
                        className="deadline"
                        style={{
                          marginTop: 8,
                        }}
                      >
                        Deadline
                        <br />
                        {formatDateTime(
                          assignment.due_at
                        )}
                      </div>

                      {fileUrl && (
                        <button
                          className="btn small ghost-blue"
                          style={{
                            marginTop: 8,
                          }}
                          onClick={() =>
                            window.open(
                              fileUrl,
                              "_blank"
                            )
                          }
                        >
                          <Download size={13} />
                          Unduh
                        </button>
                      )}
                    </div>
                  </div>
                );
              }
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}