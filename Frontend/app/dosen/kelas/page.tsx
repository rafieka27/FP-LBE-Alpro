"use client";

import { useEffect, useState } from "react";
import {
    ClipboardList,
    FileText,
    GraduationCap,
    LayoutDashboard,
    Upload,
    Users,
} from "@/components/icons";

type Student = {
    id: string;
    email: string;
};

type ClassData = {
    id: string;
    code: string;
    name: string;
    subject: string;
    students: Student[];
};

const defaultClasses: ClassData[] = [{
    id: "if-101",
    code: "IF-101",
    name: "PBO-A",
    subject: "Pemrograman Berorientasi Objek",
    students: [],},{
    id: "if-102",
    code: "IF-102",
    name: "PBO-B",
    subject: "Pemrograman Berorientasi Objek",
    students: [],},{
    id: "if-103",
    code: "IF-103",
    name: "PBO-C",
    subject: "Pemrograman Berorientasi Objek",
    students: [],},
];

export default function KelasPage() {
    const [classes, setClasses] = useState<ClassData[]>([]);
    const [selectedClass, setSelectedClass] = useState<ClassData | null>(null);

    const [showClassModal, setShowClassModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);

    const [editingClass, setEditingClass] = useState<ClassData | null>(null);

    const [classCode, setClassCode] = useState("");
    const [className, setClassName] = useState("");
    const [subject, setSubject] = useState("");

    const [studentEmail, setStudentEmail] = useState("");
    const [studentError, setStudentError] = useState("");

    useEffect(() => {
    const savedClasses = localStorage.getItem("myits-classes");

    if (!savedClasses) {
        setClasses(defaultClasses);
        return;
    }

    try {
        const parsedClasses: ClassData[] = JSON.parse(savedClasses);
        setClasses(parsedClasses);
    } catch {
        setClasses(defaultClasses);
    }}, []);

    useEffect(() => {
        if (classes.length > 0) {
            localStorage.setItem("myits-classes", JSON.stringify(classes));
        }
    }, [classes]);

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

    const openEditClass = (classData: ClassData) => {
        setEditingClass(classData);
        setClassCode(classData.code);
        setClassName(classData.name);
        setSubject(classData.subject);
        setShowClassModal(true);
    };

    const saveClass = () => {
        if (!classCode.trim() || !className.trim() || !subject.trim()
    ) {return;
    }

    if (editingClass) {
        const updatedClass: ClassData = {
            ...editingClass,
            code: classCode.trim().toUpperCase(),
            name: className.trim(),
            subject: subject.trim(),
        };

        setClasses((currentClasses) =>
            currentClasses.map((item) => item.id === editingClass.id ? updatedClass : item)
        );

    if (selectedClass?.id === editingClass.id) {setSelectedClass(updatedClass);}
    } else {const newClass: ClassData = {
        id: `class-${Date.now()}`,
        code: classCode.trim().toUpperCase(),
        name: className.trim(),
        subject: subject.trim(),
        students: [],};

      setClasses((currentClasses) => [
        ...currentClasses,
        newClass,
      ]);
    }

    setShowClassModal(false);
    resetClassForm();
  };

  const openClassDetail = (classData: ClassData) => {
    setSelectedClass(classData);
    setStudentEmail("");
    setStudentError("");
    setShowDetailModal(true);
  };

  const addStudent = () => {
    if (!selectedClass) {
      return;
    }

    const email = studentEmail.trim().toLowerCase();

    if (!email) {
      setStudentError("Masukkan email mahasiswa.");
      return;
    }

    if (!email.endsWith("@student.its.ac.id")) {
      setStudentError(
        "Email harus menggunakan @student.its.ac.id."
      );
      return;
    }

    const studentAlreadyExists =
      selectedClass.students.some(
        (student) =>
          student.email.toLowerCase() === email
      );

    if (studentAlreadyExists) {
      setStudentError(
        "Mahasiswa tersebut sudah terdaftar di kelas."
      );
      return;
    }

    const newStudent: Student = {
      id: `student-${Date.now()}`,
      email,
    };

    const updatedClass: ClassData = {
      ...selectedClass,
      students: [
        ...selectedClass.students,
        newStudent,
      ],
    };

    setClasses((currentClasses) =>
      currentClasses.map((item) =>
        item.id === selectedClass.id
          ? updatedClass
          : item
      )
    );

    setSelectedClass(updatedClass);
    setStudentEmail("");
    setStudentError("");
  };

  const removeStudent = (studentId: string) => {
    if (!selectedClass) {
      return;
    }

    const updatedClass: ClassData = {
      ...selectedClass,
      students: selectedClass.students.filter(
        (student) => student.id !== studentId
      ),
    };

    setClasses((currentClasses) =>
      currentClasses.map((item) =>
        item.id === selectedClass.id
          ? updatedClass
          : item
      )
    );

    setSelectedClass(updatedClass);
  };

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <h1 className="page-title">Kelas Saya</h1>
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
        {classes.map((classData) => (
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
                  {classData.students.length}
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

                <span className="active-badge">
                  ✓ Kelas Aktif
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showClassModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowClassModal(false)}
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
                onClick={() =>
                  setShowClassModal(false)
                }
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
                    setClassCode(event.target.value)
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
                    setClassName(event.target.value)
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
                    setSubject(event.target.value)
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
              >
                Batal
              </button>

              <button
                type="button"
                className="btn primary"
                onClick={saveClass}
              >
                {editingClass
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
          onClick={() => setShowDetailModal(false)}
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

                <h2>{selectedClass.name}</h2>

                <p>{selectedClass.subject}</p>
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
                    setStudentEmail(event.target.value)
                  }
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      addStudent();
                    }
                  }}
                  placeholder="5025251001@student.its.ac.id"
                />

                <button
                  type="button"
                  className="btn primary"
                  onClick={addStudent}
                >
                  + Tambah
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
                  <h3>Daftar Mahasiswa</h3>

                  <p>
                    {selectedClass.students.length}{" "}
                    mahasiswa terdaftar
                  </p>
                </div>
              </div>

              {selectedClass.students.length === 0 ? (
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
                        <span>{index + 1}</span>

                        <span className="student-email">
                          {student.email}
                        </span>

                        <button
                          type="button"
                          className="delete-student"
                          onClick={() =>
                            removeStudent(student.id)
                          }
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