"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import {
  getClassesApi,
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

type Grade = {
  id: number;
  student_id: number;
  class_id: number;
  component: string;
  score: number;
  note: string;
  published: boolean;
};

type DisplayRow = {
  component: string;
  score: number | null;
  published: boolean;
};

const assessmentComponents = [
  "Tugas",
  "Keaktifan",
  "Praktikum 1",
  "Praktikum 2",
  "Praktikum 3",
  "Praktikum 4",
  "Praktikum 5",
  "Remidi 1",
  "Remidi 2",
  "Remidi 3",
  "Remidi 4",
  "Remidi 5",
  "Final Praktikum",
];

function getGradeLabel(score: number) {
  if (score >= 85) return "A";
  if (score >= 70) return "B";
  if (score >= 55) return "C";
  if (score >= 40) return "D";
  return "E";
}

function getGradeClass(score: number) {
  if (score >= 85) return "green";
  if (score >= 70) return "blue";
  return "orange";
}

export default function MahasiswaNilai() {
  const [studentId, setStudentId] =
    useState<number | null>(null);

  const [classes, setClasses] =
    useState<ClassItem[]>([]);

  const [grades, setGrades] =
    useState<Grade[]>([]);

  const [selectedClassId, setSelectedClassId] =
    useState<number | "">("");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const me = await getMeApi();

      const id =
        me?.id ??
        me?.user?.id ??
        null;

      if (!id) {
        throw new Error(
          "ID mahasiswa tidak ditemukan."
        );
      }

      setStudentId(id);

      const [classResponse, gradeResponse] =
        await Promise.all([
          getClassesApi(),
          getStudentGradesApi(id),
        ]);

      const classList: ClassItem[] =
        Array.isArray(classResponse)
          ? classResponse
          : [];

      const gradeList: Grade[] =
        Array.isArray(gradeResponse)
          ? gradeResponse
          : [];

      setClasses(classList);
      setGrades(gradeList);

      const enrolledClasses =
        classList.filter((classItem) =>
          (classItem.students || []).some(
            (student) =>
              student.id === id
          )
        );

      const firstClass =
        enrolledClasses[0] ??
        classList.find((classItem) =>
          gradeList.some(
            (grade) =>
              grade.class_id ===
              classItem.id
          )
        );

      if (firstClass) {
        setSelectedClassId(
          firstClass.id
        );
      }
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Gagal mengambil rekap nilai."
      );
    } finally {
      setLoading(false);
    }
  }

  const visibleClasses = useMemo(() => {
    if (studentId === null) {
      return [];
    }

    const enrolledClasses =
      classes.filter((classItem) =>
        (classItem.students || []).some(
          (student) =>
            student.id === studentId
        )
      );

    if (enrolledClasses.length > 0) {
      return enrolledClasses;
    }

    const gradedClassIds = new Set(
      grades.map(
        (grade) =>
          grade.class_id
      )
    );

    return classes.filter(
      (classItem) =>
        gradedClassIds.has(
          classItem.id
        )
    );
  }, [
    classes,
    grades,
    studentId,
  ]);

  const selectedClass =
    useMemo(() => {
      if (
        selectedClassId === ""
      ) {
        return null;
      }

      return (
        visibleClasses.find(
          (classItem) =>
            classItem.id ===
            selectedClassId
        ) ?? null
      );
    }, [
      selectedClassId,
      visibleClasses,
    ]);

  const classGrades =
    useMemo(() => {
      if (
        selectedClassId === ""
      ) {
        return [];
      }

      return grades.filter(
        (grade) =>
          grade.class_id ===
          selectedClassId
      );
    }, [
      grades,
      selectedClassId,
    ]);

  const gradeMap = useMemo(() => {
    const map = new Map<
      string,
      Grade
    >();

    classGrades.forEach((grade) => {
      map.set(
        grade.component,
        grade
      );
    });

    return map;
  }, [classGrades]);

  const displayRows =
    useMemo<DisplayRow[]>(() => {
      return assessmentComponents.map(
        (component) => {
          const grade =
            gradeMap.get(component);

          return {
            component,
            score:
              grade?.score ?? null,
            published:
              grade?.published ??
              false,
          };
        }
      );
    }, [gradeMap]);

  const publishedGrades =
    useMemo(() => {
      return classGrades.filter(
        (grade) =>
          grade.published
      );
    }, [classGrades]);

  const average =
    useMemo(() => {
      if (
        publishedGrades.length ===
        0
      ) {
        return 0;
      }

      const total =
        publishedGrades.reduce(
          (sum, grade) =>
            sum +
            Number(
              grade.score
            ),
          0
        );

      return Math.round(
        total /
          publishedGrades.length
      );
    }, [publishedGrades]);

  const predicate =
    useMemo(() => {
      if (
        publishedGrades.length ===
        0
      ) {
        return "-";
      }

      return getGradeLabel(
        average
      );
    }, [
      publishedGrades.length,
      average,
    ]);

  const availableCount =
    publishedGrades.length;

  return (
    <AppShell>
      <div className="page">
        {/* HEADER */}
        <div className="page-heading">
          <div>
            <h1 className="page-title">
              Rekap Nilai
            </h1>

            <p className="page-subtitle">
              Rekap nilai berdasarkan kelas
              yang diikuti mahasiswa.
            </p>
          </div>

          <span className="badge blue">
            Gasal 2026/2027
          </span>
        </div>

        {loading ? (
          <div className="card">
            <p>
              Memuat rekap nilai...
            </p>
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
              onClick={loadData}
            >
              Coba Lagi
            </button>
          </div>
        ) : (
          <>
            {/* FILTER KELAS */}
            <div className="card">
              <div
                className="field"
                style={{
                  maxWidth: 520,
                }}
              >
                <label>
                  Kelas / Mata Kuliah
                </label>

                <select
                  className="select"
                  value={
                    selectedClassId
                  }
                  onChange={(e) =>
                    setSelectedClassId(
                      e.target.value
                        ? Number(
                            e.target.value
                          )
                        : ""
                    )
                  }
                >
                  <option value="">
                    Pilih kelas
                  </option>

                  {visibleClasses.map(
                    (classItem) => (
                      <option
                        key={
                          classItem.id
                        }
                        value={
                          classItem.id
                        }
                      >
                        {classItem.code} -{" "}
                        {classItem.name} -{" "}
                        {classItem.subject}
                      </option>
                    )
                  )}
                </select>
              </div>

              {selectedClass && (
                <div
                  style={{
                    marginTop: 16,
                    padding:
                      "14px 16px",
                    borderRadius: 10,
                    background:
                      "#f8fafc",
                  }}
                >
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 16,
                    }}
                  >
                    {selectedClass.code} ·{" "}
                    {selectedClass.name}
                  </div>

                  <div
                    style={{
                      marginTop: 4,
                      color: "#64748b",
                      fontSize: 14,
                    }}
                  >
                    {
                      selectedClass.subject
                    }
                  </div>
                </div>
              )}
            </div>

            {/* SUMMARY */}
            <div
              className="grid-4"
              style={{
                marginTop: 20,
              }}
            >
              <div className="card score-card">
                <div className="score">
                  {average}
                </div>

                <div className="score-label">
                  Rata-rata
                </div>
              </div>

              <div className="card score-card">
                <div className="score">
                  {predicate}
                </div>

                <div className="score-label">
                  Predikat Sementara
                </div>
              </div>

              <div className="card score-card">
                <div className="score">
                  {
                    availableCount
                  }
                </div>

                <div className="score-label">
                  Nilai Tersedia
                </div>
              </div>

              <div className="card score-card">
                <div className="score">
                  {
                    assessmentComponents.length
                  }
                </div>

                <div className="score-label">
                  Total Komponen
                </div>
              </div>
            </div>

            {/* DETAIL NILAI */}
            <div
              className="card"
              style={{
                marginTop: 20,
              }}
            >
              <h2 className="section-title">
                Detail Nilai
              </h2>

              <p className="section-subtitle">
                Semua komponen penilaian
                ditampilkan. Tanda "-"
                berarti belum dinilai.
              </p>

              {selectedClassId ===
              "" ? (
                <div
                  style={{
                    padding: 40,
                    textAlign:
                      "center",
                    color: "#64748b",
                  }}
                >
                  Pilih kelas terlebih dahulu.
                </div>
              ) : (
                <div
                  className="table-wrap"
                  style={{
                    marginTop: 18,
                  }}
                >
                  <table>
                    <thead>
                      <tr>
                        <th>
                          Kelas
                        </th>

                        <th>
                          Komponen
                        </th>

                        <th>
                          Nilai
                        </th>

                        <th>
                          Grade
                        </th>

                        <th>
                          Status
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {displayRows.map(
                        (row) => (
                          <tr
                            key={
                              row.component
                            }
                          >
                            <td>
                              {
                                selectedClass
                                  ?.code
                              }
                            </td>

                            <td>
                              {
                                row.component
                              }
                            </td>

                            <td>
                              {row.score ===
                              null ? (
                                <span
                                  style={{
                                    color:
                                      "#94a3b8",
                                    fontWeight:
                                      600,
                                  }}
                                >
                                  -
                                </span>
                              ) : (
                                <b>
                                  {
                                    row.score
                                  }
                                </b>
                              )}
                            </td>

                            <td>
                              {row.score ===
                              null ? (
                                <span className="badge orange">
                                  -
                                </span>
                              ) : (
                                <span
                                  className={`badge ${getGradeClass(
                                    row.score
                                  )}`}
                                >
                                  {getGradeLabel(
                                    row.score
                                  )}
                                </span>
                              )}
                            </td>

                            <td>
                              {row.published ? (
                                <span className="badge green">
                                  Tersedia
                                </span>
                              ) : (
                                <span className="badge orange">
                                  Belum dinilai
                                </span>
                              )}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}