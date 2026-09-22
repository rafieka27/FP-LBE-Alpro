"use client";

import {
  ChangeEvent,
  useEffect,
  useState,
} from "react";

import {
  Download,
  Save,
  Upload,
} from "@/components/icons";

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
  created_by: number;
  student?: {
    id: number;
    nrp: string;
    name: string;
    email: string;
  };
};

type StudentGrade = {
  student: Student;
  score: number | null;
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

function parseCsvLine(line: string) {
  const result: string[] = [];
  let current = "";
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (
        insideQuotes &&
        line[i + 1] === '"'
      ) {
        current += '"';
        i++;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (
      char === "," &&
      !insideQuotes
    ) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current.trim());

  return result;
}

export default function DosenNilai() {
  const [classes, setClasses] =
    useState<ClassItem[]>([]);

  const [classId, setClassId] =
    useState<number | "">("");

  const [assessment, setAssessment] =
    useState("Tugas");

  const [mode, setMode] = useState<
    "manual" | "csv"
  >("manual");

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
          const grade =
            gradeMap.get(
              student.id
            );

          return {
            student,
            score:
              grade?.score ?? null,
            published:
              grade?.published ??
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

  async function handleSave() {
    if (classId === "") {
      alert(
        "Pilih kelas terlebih dahulu."
      );
      return;
    }

    if (
      students.length === 0
    ) {
      alert(
        "Belum ada mahasiswa di kelas ini."
      );
      return;
    }

    try {
      setSaving(true);

      for (
        const item of students
      ) {
        if (item.score === null) {
          continue;
        }

        await saveGradeApi({
          student_id:
            item.student.id,

          class_id:
            classId,

          component:
            assessment,

          score: item.score,

          note: "",

          published:
            item.published,
        });
      }

      alert(
        "Nilai berhasil disimpan."
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

  async function handlePublish() {
    if (classId === "") {
      alert(
        "Pilih kelas terlebih dahulu."
      );
      return;
    }

    const itemsToPublish =
      students.filter(
        (item) =>
          item.score !== null
      );

    if (
      itemsToPublish.length === 0
    ) {
      alert(
        "Belum ada nilai yang bisa dipublikasikan."
      );
      return;
    }

    const confirmed =
      window.confirm(
        `Publikasikan nilai ${assessment} untuk ${itemsToPublish.length} mahasiswa?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setSaving(true);

      for (
        const item of itemsToPublish
      ) {
        await saveGradeApi({
          student_id:
            item.student.id,

          class_id:
            classId,

          component:
            assessment,

          score: item.score!,

          note: "",

          published: true,
        });
      }

      alert(
        "Nilai berhasil dipublikasikan."
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
          : "Gagal mempublikasikan nilai."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleUnpublish() {
    if (classId === "") {
      alert(
        "Pilih kelas terlebih dahulu."
      );
      return;
    }

    const publishedStudents =
      students.filter(
        (item) =>
          item.published &&
          item.score !== null
      );

    if (
      publishedStudents.length === 0
    ) {
      alert(
        "Belum ada nilai yang dipublikasikan."
      );
      return;
    }

    const confirmed =
      window.confirm(
        `Tarik publikasi nilai ${assessment} untuk ${publishedStudents.length} mahasiswa?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setSaving(true);

      for (
        const item of publishedStudents
      ) {
        await saveGradeApi({
          student_id:
            item.student.id,

          class_id:
            classId,

          component:
            assessment,

          score: item.score!,

          note: "",

          published: false,
        });
      }

      alert(
        "Publikasi nilai berhasil dibatalkan."
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
          : "Gagal membatalkan publikasi."
      );
    } finally {
      setSaving(false);
    }
  }

  function handleDownloadTemplate() {
    const header =
      "Student ID,Student Name,Score\n";

    const rows = students
      .map(
        (item) =>
          `${item.student.nrp},"${item.student.name}",${
            item.score ?? ""
          }`
      )
      .join("\n");

    const csv =
      header + rows;

    const blob =
      new Blob([csv], {
        type: "text/csv;charset=utf-8;",
      });

    const url =
      URL.createObjectURL(
        blob
      );

    const link =
      document.createElement(
        "a"
      );

    link.href = url;

    link.download =
      `template-${assessment
        .toLowerCase()
        .replaceAll(
          " ",
          "-"
        )}.csv`;

    document.body.appendChild(
      link
    );

    link.click();

    link.remove();

    URL.revokeObjectURL(
      url
    );
  }

  async function handleCsvUpload(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    if (classId === "") {
      alert(
        "Pilih kelas terlebih dahulu."
      );

      event.target.value = "";

      return;
    }

    try {
      setSaving(true);

      const text =
        await file.text();

      const lines = text
        .split(/\r?\n/)
        .map((line) =>
          line.trim()
        )
        .filter(Boolean);

      if (
        lines.length < 2
      ) {
        throw new Error(
          "File CSV kosong atau tidak memiliki data."
        );
      }

      const headers =
        parseCsvLine(
          lines[0]
        ).map((header) =>
          header
            .toLowerCase()
            .replace(
              /\s+/g,
              " "
            )
            .trim()
        );

      const studentIdIndex =
        headers.findIndex(
          (header) =>
            header ===
            "student id"
        );

      const scoreIndex =
        headers.findIndex(
          (header) =>
            header ===
            "score"
        );

      if (
        studentIdIndex ===
          -1 ||
        scoreIndex === -1
      ) {
        throw new Error(
          "Format CSV harus memiliki kolom Student ID dan Score."
        );
      }

      const selectedClass =
        classes.find(
          (item) =>
            item.id === classId
        );

      if (
        !selectedClass
      ) {
        throw new Error(
          "Kelas tidak ditemukan."
        );
      }

      const classStudents =
        selectedClass.students ||
        [];

      let successCount = 0;

      const errors: string[] =
        [];

      for (
        let i = 1;
        i < lines.length;
        i++
      ) {
        const columns =
          parseCsvLine(
            lines[i]
          );

        const studentId =
          columns[
            studentIdIndex
          ]?.trim();

        const scoreText =
          columns[
            scoreIndex
          ]?.trim();

        if (
          !studentId ||
          !scoreText
        ) {
          errors.push(
            `Baris ${i + 1}: data tidak lengkap.`
          );

          continue;
        }

        const score =
          Number(
            scoreText
          );

        if (
          Number.isNaN(score) ||
          score < 0 ||
          score > 100
        ) {
          errors.push(
            `Baris ${i + 1}: nilai harus berada di antara 0 sampai 100.`
          );

          continue;
        }

        const student =
          classStudents.find(
            (item) =>
              item.nrp ===
                studentId ||
              String(
                item.id
              ) === studentId
          );

        if (!student) {
          errors.push(
            `Baris ${i + 1}: mahasiswa ${studentId} tidak ditemukan di kelas.`
          );

          continue;
        }

        await saveGradeApi({
          student_id:
            student.id,

          class_id:
            classId,

          component:
            assessment,

          score,

          note: "",

          published: false,
        });

        successCount++;
      }

      await loadGrades(
        classId,
        assessment
      );

      if (
        errors.length > 0
      ) {
        alert(
          `CSV selesai diproses.\n\n` +
            `Berhasil: ${successCount}\n` +
            `Gagal: ${errors.length}\n\n` +
            errors.join("\n")
        );
      } else {
        alert(
          `CSV berhasil diupload.\n\n${successCount} nilai berhasil disimpan sebagai draft.`
        );
      }
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Gagal memproses file CSV."
      );
    } finally {
      setSaving(false);

      event.target.value = "";
    }
  }

  if (loading) {
    return (
      <div className="page">
        <div className="card">
          <p>
            Memuat data kelas...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <h1 className="page-title">
            Nilai Mahasiswa
          </h1>

          <p className="page-subtitle">
            Pilih kelas dan komponen
            penilaian, lalu input atau
            upload nilai.
          </p>
        </div>

        <div className="tabs">
          <button
            className={`tab ${
              mode === "manual"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setMode("manual")
            }
          >
            Manual Entry
          </button>

          <button
            className={`tab ${
              mode === "csv"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setMode("csv")
            }
          >
            CSV Upload
          </button>
        </div>
      </div>

      <div className="card">
        <div className="filters">
          <div className="field">
            <label>Kelas</label>

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
                    key={item.id}
                    value={item.id}
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

        {mode === "csv" ? (
          <div className="upload-box">
            <div className="upload-icon">
              <Upload size={20} />
            </div>

            <h3>
              Upload nilai{" "}
              {assessment}
            </h3>

            <p className="section-subtitle">
              CSV harus berisi
              Student ID, Student
              Name, Score.
            </p>

            <label
              className="btn primary"
              style={{
                cursor: saving
                  ? "not-allowed"
                  : "pointer",
                opacity: saving
                  ? 0.6
                  : 1,
              }}
            >
              <Upload size={15} />

              {saving
                ? "Memproses..."
                : "Pilih File CSV"}

              <input
                type="file"
                accept=".csv,text/csv"
                onChange={
                  handleCsvUpload
                }
                disabled={saving}
                style={{
                  display: "none",
                }}
              />
            </label>

            <button
              className="btn"
              style={{
                marginLeft: 8,
              }}
              onClick={
                handleDownloadTemplate
              }
              disabled={
                saving ||
                students.length ===
                  0
              }
            >
              <Download size={15} />
              Download Template
            </button>
          </div>
        ) : (
          <>
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
                          Nilai{" "}
                          {assessment}
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
                              {item.score ===
                              null ? (
                                <span className="badge orange">
                                  -
                                </span>
                              ) : (
                                <span
                                  className={`badge ${getGradeClass(
                                    item.score
                                  )}`}
                                >
                                  {getGradeLabel(
                                    item.score
                                  )}
                                </span>
                              )}
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
                    gap: 10,
                    justifyContent:
                      "flex-end",
                    marginTop: 16,
                    flexWrap:
                      "wrap",
                  }}
                >
                  <button
                    className="btn"
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
                      : "Simpan Draft"}
                  </button>

                  <button
                    className="btn primary"
                    onClick={
                      handlePublish
                    }
                    disabled={
                      saving
                    }
                  >
                    <Save size={15} />

                    {saving
                      ? "Memproses..."
                      : "Publikasikan Nilai"}
                  </button>

                  <button
                    className="btn"
                    onClick={
                      handleUnpublish
                    }
                    disabled={
                      saving
                    }
                  >
                    Tarik Publikasi
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}