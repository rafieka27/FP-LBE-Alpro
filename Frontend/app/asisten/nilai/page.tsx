"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { Save } from "@/components/icons";

import {
  getClassesApi,
  getGradesByClassApi,
  saveGradeApi,
} from "@/lib/api";

type Student = {
  id: number;
  nrp: string;
  name: string;
  email: string;
  role: string;
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

type StudentGrade = {
  student: Student;
  score: number | null;
  note: string;
  published: boolean;
};

const assessmentOptions = [
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

function shouldAutoPublish(
  component: string
) {
  return (
    component === "Keaktifan" ||
    component.startsWith("Praktikum") ||
    component.startsWith("Remidi") ||
    component === "Final Praktikum"
  );
}

export default function AsistenNilai() {
  const [classes, setClasses] =
    useState<ClassItem[]>([]);

  const [classId, setClassId] =
    useState<number | "">("");

  const [assessment, setAssessment] =
    useState("Keaktifan");

  const [students, setStudents] =
    useState<StudentGrade[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [loadingGrades, setLoadingGrades] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    if (classId !== "") {
      loadGrades(
        classId,
        assessment
      );
    } else {
      setStudents([]);
    }
  }, [classId, assessment, classes]);

  async function loadClasses() {
    try {
      setLoading(true);

      const response =
        await getClassesApi();

      const classList: ClassItem[] =
        Array.isArray(response)
          ? response
          : [];

      setClasses(classList);

      if (
        classList.length > 0
      ) {
        setClassId(
          classList[0].id
        );
      }
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Gagal mengambil data kelas."
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadGrades(
    selectedClassId: number,
    selectedComponent: string
  ) {
    try {
      setLoadingGrades(true);

      const selectedClass =
        classes.find(
          (item) =>
            item.id ===
            selectedClassId
        );

      if (!selectedClass) {
        setStudents([]);
        return;
      }

      const response =
        await getGradesByClassApi(
          selectedClassId,
          selectedComponent
        );

      const grades: Grade[] =
        Array.isArray(response)
          ? response
          : [];

      const gradeMap =
        new Map<
          number,
          {
            score: number;
            note: string;
            published: boolean;
          }
        >();

      grades.forEach((grade) => {
        gradeMap.set(
          grade.student_id,
          {
            score: Number(
              grade.score
            ),
            note:
              grade.note || "",
            published:
              Boolean(
                grade.published
              ),
          }
        );
      });

      const studentList =
        (
          selectedClass.students ||
          []
        ).map((student) => {
          const existing =
            gradeMap.get(
              student.id
            );

          return {
            student,
            score:
              existing?.score ??
              null,
            note:
              existing?.note ??
              "",
            published:
              existing?.published ??
              false,
          };
        });

      setStudents(
        studentList
      );
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Gagal mengambil nilai."
      );

      setStudents([]);
    } finally {
      setLoadingGrades(false);
    }
  }

  function updateScore(
    studentId: number,
    value: string
  ) {
    if (value === "") {
      setStudents((prev) =>
        prev.map((item) =>
          item.student.id ===
          studentId
            ? {
                ...item,
                score: null,
              }
            : item
        )
      );

      return;
    }

    const numericValue =
      Number(value);

    const score =
      Number.isNaN(
        numericValue
      )
        ? null
        : Math.max(
            0,
            Math.min(
              100,
              numericValue
            )
          );

    setStudents((prev) =>
      prev.map((item) =>
        item.student.id ===
        studentId
          ? {
              ...item,
              score,
            }
          : item
      )
    );
  }

  function updateNote(
    studentId: number,
    value: string
  ) {
    setStudents((prev) =>
      prev.map((item) =>
        item.student.id === studentId
          ? {
              ...item,
              note: value,
            }
          : item
      )
    );
  }

  async function handleSave() {
    if (classId === "") {
      alert(
        "Pilih kelas terlebih dahulu."
      );
      return;
    }

    if (
      students.length ===
      0
    ) {
      alert(
        "Belum ada mahasiswa di kelas ini."
      );
      return;
    }

    const autoPublish =
      shouldAutoPublish(
        assessment
      );

    const itemsToSave =
      students.filter(
        (item) =>
          item.score !== null
      );

    if (
      itemsToSave.length === 0
    ) {
      alert(
        "Belum ada nilai yang diisi."
      );
      return;
    }

    try {
      setSaving(true);

      for (
        const item of itemsToSave
      ) {
        await saveGradeApi({
          student_id:
            item.student.id,

          class_id:
            classId,

          component:
            assessment,

          score:
            item.score!,

          note:
            item.note,

          published:
            autoPublish,
        });
      }

      alert(
        autoPublish
          ? `Nilai ${assessment} berhasil disimpan dan dipublikasikan.`
          : `Nilai ${assessment} berhasil disimpan sebagai draft.`
      );

      await loadGrades(
        classId,
        assessment
      );
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Gagal menyimpan nilai."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <AppShell>
        <div className="page">
          <div className="card">
            <p>
              Memuat data kelas...
            </p>
          </div>
        </div>
      </AppShell>
    );
  }

  const autoPublish =
    shouldAutoPublish(
      assessment
    );

  return (
    <AppShell>
      <div className="page">
        <div className="page-heading">
          <div>
            <h1 className="page-title">
              Input Nilai Asisten
            </h1>

            <p className="page-subtitle">
              Kelola nilai tugas,
              keaktifan, praktikum,
              remidi, dan final
              praktikum.
            </p>
          </div>
        </div>

        <div className="card">
          <div className="filters">
            <div className="field">
              <label>
                Kelas
              </label>

              <select
                className="select"
                value={classId}
                onChange={(e) =>
                  setClassId(
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

                {classes.map(
                  (item) => (
                    <option
                      key={
                        item.id
                      }
                      value={
                        item.id
                      }
                    >
                      {item.name}
                    </option>
                  )
                )}
              </select>
            </div>

            <div className="field">
              <label>
                Komponen Nilai
              </label>

              <select
                className="select"
                value={assessment}
                onChange={(e) =>
                  setAssessment(
                    e.target.value
                  )
                }
              >
                {assessmentOptions.map(
                  (item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>
                  )
                )}
              </select>
            </div>

            <div className="field">
              <label>
                Semester
              </label>

              <select
                className="select"
                defaultValue="Gasal 2026/2027"
              >
                <option>
                  Gasal 2026/2027
                </option>
              </select>
            </div>
          </div>

          <div
            style={{
              marginTop: 16,
              marginBottom: 16,
              padding:
                "12px 16px",
              borderRadius: 10,
              background:
                autoPublish
                  ? "#ecfdf5"
                  : "#fff7ed",
              color:
                autoPublish
                  ? "#047857"
                  : "#c2410c",
              fontSize: 14,
            }}
          >
            {autoPublish
              ? `${assessment} akan langsung dipublikasikan dan dapat dilihat mahasiswa.`
              : `${assessment} akan disimpan sebagai draft.`}
          </div>

          {loadingGrades ? (
            <div
              style={{
                padding: 40,
                textAlign:
                  "center",
                color: "#64748b",
              }}
            >
              Memuat nilai
              mahasiswa...
            </div>
          ) : students.length ===
            0 ? (
            <div
              style={{
                padding: 40,
                textAlign:
                  "center",
                color: "#64748b",
              }}
            >
              <p>
                Belum ada mahasiswa
                yang terdaftar di
                kelas ini.
              </p>
            </div>
          ) : (
            <>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>
                        Student ID
                      </th>

                      <th>
                        Nama Mahasiswa
                      </th>

                      <th>
                        {assessment}
                      </th>

                      <th>
                        Catatan
                      </th>

                      <th>
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {students.map(
                      (item) => (
                        <tr
                          key={
                            item
                              .student
                              .id
                          }
                        >
                          <td>
                            {item
                              .student
                              .nrp ||
                              item
                                .student
                                .email}
                          </td>

                          <td>
                            {
                              item
                                .student
                                .name
                            }
                          </td>

                          <td>
                            <input
                              className="score-input"
                              type="number"
                              min="0"
                              max="100"
                              value={
                                item.score ??
                                ""
                              }
                              onChange={(
                                e
                              ) =>
                                updateScore(
                                  item
                                    .student
                                    .id,
                                  e
                                    .target
                                    .value
                                )
                              }
                              disabled={
                                saving
                              }
                            />
                          </td>

                          <td>
                            <input
                              className="input"
                              value={
                                item.note
                              }
                              placeholder="Opsional"
                              onChange={(
                                e
                              ) =>
                                updateNote(
                                  item
                                    .student
                                    .id,
                                  e
                                    .target
                                    .value
                                )
                              }
                              disabled={
                                saving
                              }
                            />
                          </td>

                          <td>
                            <span
                              className={`badge ${
                                item
                                  .published
                                  ? "green"
                                  : "orange"
                              }`}
                            >
                              {item
                                .published
                                ? "Published"
                                : "Draft"}
                            </span>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>

              <div
                style={{
                  display:
                    "flex",
                  justifyContent:
                    "flex-end",
                  marginTop: 16,
                }}
              >
                <button
                  className="btn primary"
                  onClick={
                    handleSave
                  }
                  disabled={
                    saving
                  }
                >
                  <Save size={15} />

                  {saving
                    ? "Menyimpan..."
                    : autoPublish
                    ? "Simpan & Publish"
                    : "Simpan Nilai"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}