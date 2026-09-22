"use client";

import { useEffect, useState } from "react";
import { Users } from "@/components/icons";
import {
  getClassesApi,
  createClassApi,
  updateClassApi,
  deleteClassApi,
  addStudentApi,
  removeStudentApi,
} from "@/lib/api";

type Student = {
  id: number;
  nrp?: string;
  name?: string;
  email: string;
};

type ClassData = {
  id: number;
  code: string;
  name: string;
  subject: string;
  lecturer_id?: number;
  students: Student[];
};

function normalizeClass(item: any): ClassData {
  return {
    id: Number(item.id),
    code: item.code,
    name: item.name,
    subject: item.subject,
    lecturer_id: item.lecturer_id,
    students: Array.isArray(item.students)
      ? item.students
      : [],
  };
}

export default function KelasPage() {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [selectedClass, setSelectedClass] =
    useState<ClassData | null>(null);

  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  const [showClassModal, setShowClassModal] =
    useState(false);
  const [showDetailModal, setShowDetailModal] =
    useState(false);

  const [editingClass, setEditingClass] =
    useState<ClassData | null>(null);

  const [classCode, setClassCode] = useState("");
  const [className, setClassName] = useState("");
  const [subject, setSubject] = useState("");

  const [studentEmail, setStudentEmail] =
    useState("");
  const [studentError, setStudentError] =
    useState("");

  const [saving, setSaving] = useState(false);

  const loadClasses = async (
    keepSelectedId?: number
  ) => {
    try {
      setPageError("");

      const data = await getClassesApi();

      const normalized: ClassData[] = Array.isArray(data)
        ? data.map(normalizeClass)
        : [];

      setClasses(normalized);

      if (keepSelectedId !== undefined) {
        const refreshedSelected =
          normalized.find(
            (item) => item.id === keepSelectedId
          ) || null;

        setSelectedClass(refreshedSelected);
      }
    } catch (err) {
      setPageError(
        err instanceof Error
          ? err.message
          : "Gagal mengambil data kelas."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClasses();
  }, []);

  const resetClassForm = () => {
    setClassCode("");
    setClassName("");
    setSubject("");
    setEditingClass(null);
  };

  const openAddClass = () => {
    resetClassForm();
    setShowClassModal(true);
  };

  const openEditClass = (
    classData: ClassData
  ) => {
    setEditingClass(classData);
    setClassCode(classData.code);
    setClassName(classData.name);
    setSubject(classData.subject);
    setShowClassModal(true);
  };

  const saveClass = async () => {
    if (
      !classCode.trim() ||
      !className.trim() ||
      !subject.trim()
    ) {
      alert("Semua data kelas wajib diisi.");
      return;
    }

    try {
      setSaving(true);

      if (editingClass) {
        const classId = editingClass.id;

        await updateClassApi(classId, {
          code: classCode.trim().toUpperCase(),
          name: className.trim(),
          subject: subject.trim(),
        });

        await loadClasses(classId);
      } else {
        await createClassApi({
          code: classCode.trim().toUpperCase(),
          name: className.trim(),
          subject: subject.trim(),
        });

        await loadClasses();
      }

      setShowClassModal(false);
      resetClassForm();
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "Gagal menyimpan kelas."
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteClass = async (classId: number) => {
    const classData = classes.find(
      (item) => item.id === classId
    );

    if (!classData) {
      return;
    }

    const confirmed = window.confirm(
      `Yakin ingin menghapus kelas ${classData.code} - ${classData.name}?\n\nData mahasiswa, tugas, dan nilai yang terkait dengan kelas ini juga dapat terhapus.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setSaving(true);

      await deleteClassApi(classId);

      if (selectedClass?.id === classId) {
        setSelectedClass(null);
        setShowDetailModal(false);
      }

      setClasses((prev) =>
        prev.filter((item) => item.id !== classId)
      );

      alert("Kelas berhasil dihapus.");
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "Gagal menghapus kelas."
      );
    } finally {
      setSaving(false);
    }
  };

  const openClassDetail = (
    classData: ClassData
  ) => {
    setSelectedClass(classData);
    setStudentEmail("");
    setStudentError("");
    setShowDetailModal(true);
  };

  const addStudent = async () => {
    if (!selectedClass) {
      return;
    }

    const email = studentEmail
      .trim()
      .toLowerCase();

    if (!email) {
      setStudentError(
        "Masukkan email mahasiswa."
      );
      return;
    }

    if (!email.endsWith("@student.its.ac.id")) {
      setStudentError(
        "Email harus menggunakan @student.its.ac.id."
      );
      return;
    }

    const exists =
      selectedClass.students.some(
        (student) =>
          student.email.toLowerCase() === email
      );

    if (exists) {
      setStudentError(
        "Mahasiswa tersebut sudah terdaftar di kelas."
      );
      return;
    }

    try {
      setSaving(true);
      setStudentError("");

      const classId = selectedClass.id;

      await addStudentApi(
        classId,
        email
      );

      await loadClasses(classId);

      setStudentEmail("");
    } catch (err) {
      setStudentError(
        err instanceof Error
          ? err.message
          : "Gagal menambahkan mahasiswa."
      );
    } finally {
      setSaving(false);
    }
  };

  const removeStudent = async (
    studentId: number
  ) => {
    if (!selectedClass) {
      return;
    }

    const confirmed = window.confirm(
      "Hapus mahasiswa dari kelas ini?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setSaving(true);

      const classId = selectedClass.id;

      await removeStudentApi(
        classId,
        studentId
      );

      await loadClasses(classId);
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "Gagal menghapus mahasiswa."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <div className="page-heading">
          <div>
            <h1 className="page-title">
              Kelas Saya
            </h1>

            <p className="page-subtitle">
              Memuat data kelas...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (pageError) {
    return (
      <div className="page">
        <div className="page-heading">
          <div>
            <h1 className="page-title">
              Kelas Saya
            </h1>

            <p className="page-subtitle">
              Kelola kelas yang diajar oleh dosen.
            </p>
          </div>
        </div>

        <div className="error">
          {pageError}
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <h1 className="page-title">
            Kelas Saya
          </h1>

          <p className="page-subtitle">
            Pilih dan kelola kelas yang diajar oleh dosen.
          </p>
        </div>

        <button
          type="button"
          className="btn primary"
          onClick={openAddClass}
        >
          + Tambah Kelas
        </button>
      </div>

      <div className="class-grid">
        {classes.length === 0 ? (
          <div className="card">
            <div
              style={{
                padding: 40,
                textAlign: "center",
              }}
            >
              <Users size={32} />

              <h3 style={{ marginTop: 12 }}>
                Belum ada kelas
              </h3>

              <p
                className="section-subtitle"
                style={{ marginTop: 8 }}
              >
                Tambahkan kelas pertama Anda.
              </p>
            </div>
          </div>
        ) : (
          classes.map((classData) => (
            <div
              className="class-management-card"
              key={classData.id}
            >
              <div className="class-card-top">
                <div>
                  <span className="class-code">
                    {classData.code}
                  </span>

                  <h2 className="class-management-name">
                    {classData.name}
                  </h2>

                  <p className="class-management-subject">
                    {classData.subject}
                  </p>
                </div>

                <div className="class-icon">
                  <Users size={21} />
                </div>
              </div>

              <div className="class-card-bottom">
                <div>
                  <div className="student-count">
                    {classData.students?.length ?? 0}
                  </div>

                  <div className="student-count-label">
                    mahasiswa terdaftar
                  </div>
                </div>

                <div className="class-actions">
                  <button
                    type="button"
                    className="btn"
                    onClick={() =>
                      openClassDetail(classData)
                    }
                  >
                    <Users size={15} />
                    Detail
                  </button>

                  <button
                    type="button"
                    className="btn"
                    onClick={() =>
                      openEditClass(classData)
                    }
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    className="btn"
                    onClick={() =>
                      deleteClass(classData.id)
                    }
                    disabled={saving}
                  >
                    Hapus
                  </button>

                  <span className="active-badge">
                    ✓ Kelas Aktif
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showClassModal && (
        <div
          className="modal-overlay"
          onClick={() =>
            setShowClassModal(false)
          }
        >
          <div
            className="modal-card"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="modal-header">
              <div>
                <h2>
                  {editingClass
                    ? "Edit Kelas"
                    : "Tambah Kelas"}
                </h2>

                <p>
                  {editingClass
                    ? "Ubah informasi kelas."
                    : "Tambahkan kelas baru yang Anda ajar."}
                </p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={() => {
                  setShowClassModal(false);
                  resetClassForm();
                }}
              >
                ×
              </button>
            </div>

            <div className="modal-form">
              <div className="field">
                <label>Kode Kelas</label>

                <input
                  className="input"
                  value={classCode}
                  onChange={(event) =>
                    setClassCode(
                      event.target.value
                    )
                  }
                  placeholder="Contoh: IF-104"
                />
              </div>

              <div className="field">
                <label>Nama Kelas</label>

                <input
                  className="input"
                  value={className}
                  onChange={(event) =>
                    setClassName(
                      event.target.value
                    )
                  }
                  placeholder="Contoh: PBO-D"
                />
              </div>

              <div className="field">
                <label>Mata Kuliah</label>

                <input
                  className="input"
                  value={subject}
                  onChange={(event) =>
                    setSubject(
                      event.target.value
                    )
                  }
                  placeholder="Contoh: Pemrograman Berorientasi Objek"
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn"
                onClick={() => {
                  setShowClassModal(false);
                  resetClassForm();
                }}
                disabled={saving}
              >
                Batal
              </button>

              <button
                type="button"
                className="btn primary"
                onClick={saveClass}
                disabled={saving}
              >
                {saving
                  ? "Menyimpan..."
                  : editingClass
                  ? "Simpan Perubahan"
                  : "Tambah Kelas"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDetailModal && selectedClass && (
        <div
          className="modal-overlay"
          onClick={() =>
            setShowDetailModal(false)
          }
        >
          <div
            className="modal-card modal-large"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="modal-header">
              <div>
                <span className="class-code">
                  {selectedClass.code}
                </span>

                <h2>
                  {selectedClass.name}
                </h2>

                <p>
                  {selectedClass.subject}
                </p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={() =>
                  setShowDetailModal(false)
                }
              >
                ×
              </button>
            </div>

            <div className="student-add-section">
              <div>
                <h3>Tambah Mahasiswa</h3>

                <p>
                  Masukkan email ITS mahasiswa.
                </p>
              </div>

              <div className="student-add-form">
                <input
                  className="input"
                  type="email"
                  value={studentEmail}
                  onChange={(event) =>
                    setStudentEmail(
                      event.target.value
                    )
                  }
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      addStudent();
                    }
                  }}
                  placeholder="5025251001@student.its.ac.id"
                />

                <button
                  type="button"
                  className="btn primary"
                  onClick={addStudent}
                  disabled={saving}
                >
                  {saving
                    ? "Menambahkan..."
                    : "+ Tambah"}
                </button>
              </div>

              {studentError && (
                <div className="student-error">
                  {studentError}
                </div>
              )}
            </div>

            <div className="student-list-section">
              <div className="student-list-header">
                <div>
                  <h3>
                    Daftar Mahasiswa
                  </h3>

                  <p>
                    {selectedClass.students.length}{" "}
                    mahasiswa terdaftar
                  </p>
                </div>
              </div>

              {selectedClass.students.length ===
              0 ? (
                <div className="empty-student">
                  <Users size={28} />

                  <strong>
                    Belum ada mahasiswa
                  </strong>

                  <span>
                    Tambahkan mahasiswa menggunakan
                    email ITS mereka.
                  </span>
                </div>
              ) : (
                <div className="student-table">
                  <div className="student-table-header">
                    <span>No</span>
                    <span>Email Mahasiswa</span>
                    <span>Aksi</span>
                  </div>

                  {selectedClass.students.map(
                    (student, index) => (
                      <div
                        className="student-row"
                        key={student.id}
                      >
                        <span>
                          {index + 1}
                        </span>

                        <span className="student-email">
                          {student.email}
                        </span>

                        <button
                          type="button"
                          className="delete-student"
                          onClick={() =>
                            removeStudent(
                              student.id
                            )
                          }
                          disabled={saving}
                          title="Hapus mahasiswa"
                        >
                          Hapus
                        </button>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn"
                onClick={() =>
                  setShowDetailModal(false)
                }
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}