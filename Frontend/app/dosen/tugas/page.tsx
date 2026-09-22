"use client";

import { FormEvent, useEffect, useState } from "react";

import {
  FileText,
  Plus,
  Upload,
  CalendarClock,
  Check,
  Trash,
  Pencil,
  X,
  Download,
} from "@/components/icons";

import {
  getAssignmentsApi,
  createAssignmentApi,
  updateAssignmentApi,
  deleteAssignmentApi,
  getClassesApi,
} from "@/lib/api";

type ClassItem = {
  id: number;
  code: string;
  name: string;
  subject: string;
};

type ApiAssignment = {
  id: number;
  title: string;
  description: string;
  file_url: string;
  due_at: string;
  status: string;
  class_id: number;
  class?: ClassItem;
};

type Assignment = {
  id: number;
  title: string;
  classId: number;
  className: string;
  dueAt: string;
  due: string;
  desc: string;
  file: string;
  fileUrl: string;
  status: string;
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

function toDatetimeLocal(value: string) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const pad = (number: number) =>
    String(number).padStart(2, "0");

  return `${date.getFullYear()}-${pad(
    date.getMonth() + 1
  )}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
}

function getFileUrl(fileUrl: string) {
  if (!fileUrl) return "";

  if (
    fileUrl.startsWith("http://") ||
    fileUrl.startsWith("https://")
  ) {
    return fileUrl;
  }

  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:8080";

  return `${apiUrl}${fileUrl.startsWith("/") ? "" : "/"}${fileUrl}`;
}

function mapAssignment(
  item: ApiAssignment,
  classList: ClassItem[]
): Assignment {
  const selectedClass =
    classList.find(
      (classItem) =>
        classItem.id === item.class_id
    );

  return {
    id: item.id,
    title: item.title,
    classId: item.class_id,
    className:
      item.class?.name ||
      selectedClass?.name ||
      `Kelas #${item.class_id}`,
    dueAt: item.due_at,
    due: formatDateTime(item.due_at),
    desc: item.description || "",
    file:
      item.file_url
        ? item.file_url.split("/").pop() || "File tersedia"
        : "Tidak ada file",
    fileUrl: item.file_url || "",
    status: item.status || "Aktif",
  };
}

export default function DosenTugas() {
  const [assignments, setAssignments] =
    useState<Assignment[]>([]);

  const [classes, setClasses] =
    useState<ClassItem[]>([]);

  const [editingId, setEditingId] =
    useState<number | null>(null);

  const [showForm, setShowForm] =
    useState(false);

  const [title, setTitle] =
    useState("");

  const [classId, setClassId] =
    useState<number | "">("");

  const [description, setDescription] =
    useState("");

  const [deadline, setDeadline] =
    useState("");

  const [file, setFile] =
    useState<File | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);

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

      const assignmentList: ApiAssignment[] =
        Array.isArray(assignmentResponse)
          ? assignmentResponse
          : [];

      setClasses(classList);

      setAssignments(
        assignmentList.map(
          (assignment) =>
            mapAssignment(
              assignment,
              classList
            )
        )
      );

      if (classList.length > 0) {
        setClassId(classList[0].id);
      }
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Gagal mengambil data tugas."
      );
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setTitle("");
    setDescription("");
    setDeadline("");
    setFile(null);
    setEditingId(null);

    if (classes.length > 0) {
      setClassId(classes[0].id);
    } else {
      setClassId("");
    }
  }

  function handleAdd() {
    resetForm();
    setShowForm(true);
  }

  function handleEdit(
    assignment: Assignment
  ) {
    setEditingId(assignment.id);
    setTitle(assignment.title);
    setClassId(assignment.classId);
    setDescription(assignment.desc);
    setDeadline(
      toDatetimeLocal(
        assignment.dueAt
      )
    );
    setFile(null);
    setShowForm(true);
  }

  async function handleDelete(
    id: number
  ) {
    const assignment =
      assignments.find(
        (item) =>
          item.id === id
      );

    if (!assignment) return;

    const confirmed =
      window.confirm(
        `Hapus tugas "${assignment.title}"?\n\nFile dan data tugas akan dihapus.`
      );

    if (!confirmed) return;

    try {
      setSaving(true);

      await deleteAssignmentApi(id);

      setAssignments((prev) =>
        prev.filter(
          (item) =>
            item.id !== id
        )
      );

      alert(
        "Tugas berhasil dihapus."
      );
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Gagal menghapus tugas."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmit(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (!title.trim()) {
      alert(
        "Judul tugas wajib diisi."
      );
      return;
    }

    if (classId === "") {
      alert(
        "Kelas wajib dipilih."
      );
      return;
    }

    if (!description.trim()) {
      alert(
        "Deskripsi tugas wajib diisi."
      );
      return;
    }

    if (!deadline) {
      alert(
        "Tenggat waktu wajib diisi."
      );
      return;
    }

    try {
      setSaving(true);

      const formData =
        new FormData();

      formData.append(
        "title",
        title.trim()
      );

      formData.append(
        "description",
        description.trim()
      );

      formData.append(
        "due_at",
        new Date(
          deadline
        ).toISOString()
      );

      formData.append(
        "status",
        "Aktif"
      );

      formData.append(
        "class_id",
        String(classId)
      );

      if (file) {
        formData.append(
          "file",
          file
        );
      }

      let response: ApiAssignment;

      if (editingId !== null) {
        response =
          (await updateAssignmentApi(
            editingId,
            formData
          )) as ApiAssignment;

        const updated =
          mapAssignment(
            response,
            classes
          );

        setAssignments((prev) =>
          prev.map(
            (assignment) =>
              assignment.id ===
              editingId
                ? updated
                : assignment
          )
        );

        alert(
          "Tugas berhasil diperbarui."
        );
      } else {
        response =
          (await createAssignmentApi(
            formData
          )) as ApiAssignment;

        const created =
          mapAssignment(
            response,
            classes
          );

        setAssignments((prev) => [
          created,
          ...prev,
        ]);

        alert(
          "Tugas berhasil dibuat dan file berhasil diupload."
        );
      }

      resetForm();
      setShowForm(false);
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Gagal menyimpan tugas."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="page">
        <div className="card">
          <p>
            Memuat data tugas...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      {/* HEADER */}
      <div className="page-heading">
        <div>
          <h1 className="page-title">
            Tugas
          </h1>

          <p className="page-subtitle">
            Upload, edit, dan kelola tugas
            berdasarkan kelas.
          </p>
        </div>

        <button
          className="btn primary"
          onClick={handleAdd}
          disabled={
            saving ||
            classes.length === 0
          }
        >
          <Plus size={16} />
          Buat Tugas
        </button>
      </div>

      <div className="grid-2">
        {/* FORM */}
        <div className="card">
          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "center",
              marginBottom: 4,
            }}
          >
            <div>
              <h2 className="section-title">
                {editingId !== null
                  ? "Edit Tugas"
                  : "Buat Tugas"}
              </h2>

              <p className="section-subtitle">
                {editingId !== null
                  ? "Perbarui informasi tugas."
                  : "Buat tugas baru untuk mahasiswa."}
              </p>
            </div>

            {showForm && (
              <button
                type="button"
                className="icon-btn"
                onClick={() => {
                  resetForm();
                  setShowForm(false);
                }}
                title="Tutup"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {!showForm ? (
            <div
              style={{
                padding: "40px 20px",
                textAlign:
                  "center",
                color: "#64748b",
              }}
            >
              <FileText size={42} />

              <p
                style={{
                  marginTop: 14,
                  marginBottom: 16,
                  fontWeight: 600,
                }}
              >
                Belum memilih aksi
              </p>

              <button
                className="btn primary"
                onClick={handleAdd}
                disabled={
                  classes.length ===
                    0 ||
                  saving
                }
              >
                <Plus size={15} />
                Tambah Tugas
              </button>

              {classes.length ===
                0 && (
                <p
                  style={{
                    marginTop: 12,
                    color: "#ef4444",
                    fontSize: 13,
                  }}
                >
                  Belum ada kelas.
                </p>
              )}
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              style={{
                display: "grid",
                gap: 14,
                marginTop: 18,
              }}
            >
              {/* JUDUL */}
              <div className="field">
                <label>
                  Judul Tugas
                </label>

                <input
                  className="input"
                  value={title}
                  onChange={(e) =>
                    setTitle(
                      e.target.value
                    )
                  }
                  placeholder="Contoh: Tugas 1 - Class & Object"
                  disabled={saving}
                />
              </div>

              {/* KELAS */}
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
                  disabled={saving}
                >
                  <option value="">
                    Pilih kelas
                  </option>

                  {classes.map(
                    (classItem) => (
                      <option
                        key={
                          classItem.id
                        }
                        value={
                          classItem.id
                        }
                      >
                        {classItem.name} -{" "}
                        {
                          classItem.subject
                        }
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* DESKRIPSI */}
              <div className="field">
                <label>
                  Deskripsi
                </label>

                <textarea
                  className="textarea"
                  value={description}
                  onChange={(e) =>
                    setDescription(
                      e.target.value
                    )
                  }
                  placeholder="Jelaskan instruksi dan ketentuan tugas..."
                  disabled={saving}
                />
              </div>

              {/* DEADLINE */}
              <div className="field">
                <label>
                  Tenggat Waktu
                </label>

                <input
                  className="input"
                  type="datetime-local"
                  value={deadline}
                  onChange={(e) =>
                    setDeadline(
                      e.target.value
                    )
                  }
                  disabled={saving}
                />
              </div>

              {/* FILE */}
              <div className="field">
                <label>
                  File Tugas
                </label>

                <input
                  className="input"
                  type="file"
                  accept=".pdf,.doc,.docx,.zip,.rar,.ppt,.pptx,.xlsx,.xls"
                  onChange={(e) =>
                    setFile(
                      e.target.files?.[0] ||
                        null
                    )
                  }
                  disabled={saving}
                />

                {file && (
                  <p
                    style={{
                      marginTop: 6,
                      fontSize: 13,
                      color: "#64748b",
                    }}
                  >
                    File dipilih:{" "}
                    <strong>
                      {file.name}
                    </strong>{" "}
                    ({Math.round(
                      file.size / 1024
                    )}{" "}
                    KB)
                  </p>
                )}
              </div>

              {/* BUTTON */}
              <div
                style={{
                  display: "flex",
                  gap: 10,
                }}
              >
                <button
                  type="submit"
                  className="btn primary"
                  style={{
                    flex: 1,
                  }}
                  disabled={saving}
                >
                  {editingId !== null ? (
                    <>
                      <Check size={15} />
                      {saving
                        ? "Menyimpan..."
                        : "Simpan Perubahan"}
                    </>
                  ) : (
                    <>
                      <Upload size={15} />
                      {saving
                        ? "Mengupload..."
                        : "Upload / Simpan Tugas"}
                    </>
                  )}
                </button>

                {editingId !== null && (
                  <button
                    type="button"
                    className="btn"
                    onClick={() => {
                      resetForm();
                      setShowForm(
                        false
                      );
                    }}
                    disabled={saving}
                  >
                    Batal
                  </button>
                )}
              </div>
            </form>
          )}
        </div>

        {/* LIST */}
        <div className="card">
          <h2 className="section-title">
            Tugas Terupload
          </h2>

          <p className="section-subtitle">
            Daftar tugas yang sudah
            tersedia.
          </p>

          <div
            style={{
              display: "grid",
              gap: 12,
              marginTop: 18,
            }}
          >
            {assignments.length ===
            0 ? (
              <div
                style={{
                  padding: 40,
                  textAlign:
                    "center",
                  color: "#64748b",
                }}
              >
                <FileText size={40} />

                <p
                  style={{
                    marginTop: 12,
                  }}
                >
                  Belum ada tugas.
                </p>
              </div>
            ) : (
              assignments.map(
                (assignment) => (
                  <div
                    className="assignment"
                    key={
                      assignment.id
                    }
                  >
                    <div
                      style={{
                        flex: 1,
                      }}
                    >
                      <div className="assignment-title">
                        {
                          assignment.title
                        }
                      </div>

                      <div className="assignment-desc">
                        <FileText
                          size={12}
                          style={{
                            verticalAlign:
                              "-2px",
                          }}
                        />{" "}
                        {assignment.file}

                        <br />

                        {
                          assignment.className
                        }
                      </div>
                    </div>

                    <div
                      style={{
                        textAlign:
                          "right",
                        minWidth: 190,
                      }}
                    >
                      <span className="badge green">
                        {
                          assignment.status
                        }
                      </span>

                      <div
                        className="deadline"
                        style={{
                          marginTop: 7,
                        }}
                      >
                        <CalendarClock
                          size={12}
                          style={{
                            verticalAlign:
                              "-2px",
                          }}
                        />{" "}
                        {assignment.due}
                      </div>

                      {/* ACTION */}
                      <div
                        style={{
                          display:
                            "flex",
                          justifyContent:
                            "flex-end",
                          gap: 8,
                          marginTop: 12,
                        }}
                      >
                        {assignment.fileUrl && (
                          <button
                            type="button"
                            className="btn small"
                            onClick={() =>
                              window.open(
                                getFileUrl(
                                  assignment.fileUrl
                                ),
                                "_blank"
                              )
                            }
                          >
                            <Download
                              size={13}
                            />
                            Lihat File
                          </button>
                        )}

                        <button
                          type="button"
                          className="btn small"
                          onClick={() =>
                            handleEdit(
                              assignment
                            )
                          }
                          disabled={
                            saving
                          }
                        >
                          <Pencil
                            size={13}
                          />
                          Edit
                        </button>

                        <button
                          type="button"
                          className="btn small danger"
                          onClick={() =>
                            handleDelete(
                              assignment.id
                            )
                          }
                          disabled={
                            saving
                          }
                        >
                          <Trash
                            size={13}
                          />
                          Hapus
                        </button>
                      </div>
                    </div>
                  </div>
                )
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}