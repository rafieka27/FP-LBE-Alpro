"use client";

import { useState } from "react";
import {
  FileText,
  Plus,
  Upload,
  CalendarClock,
  Check,
  Trash,
  Pencil,
  X,
} from "@/components/icons";
import { assignments as initialAssignments, classes } from "@/lib/data";

type Assignment = {
  id: number;
  title: string;
  className: string;
  due: string;
  desc: string;
  file: string;
  status: string;
  submissions: string;
};

export default function DosenTugas() {
  const [assignments, setAssignments] = useState<Assignment[]>(
    initialAssignments.map((a, index) => ({
      ...a,
      id: index + 1,
    }))
  );

  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [title, setTitle] = useState("");
  const [className, setClassName] = useState(classes[0]?.name || "");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const resetForm = () => {
    setTitle("");
    setClassName(classes[0]?.name || "");
    setDescription("");
    setDeadline("");
    setFile(null);
    setEditingId(null);
  };

  const handleAdd = () => {
    resetForm();
    setShowForm(true);
  };

  const handleEdit = (assignment: Assignment) => {
    setEditingId(assignment.id);
    setTitle(assignment.title);
    setClassName(assignment.className);
    setDescription(assignment.desc);
    setDeadline(assignment.due);
    setFile(null);
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    const assignment = assignments.find((item) => item.id === id);

    if (!assignment) return;

    const confirmed = window.confirm(
      `Hapus tugas "${assignment.title}"?\n\nData tugas akan dihapus dari daftar.`
    );

    if (!confirmed) return;

    setAssignments((prev) =>
      prev.filter((assignment) => assignment.id !== id)
    );
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!title.trim()) {
      alert("Judul tugas wajib diisi.");
      return;
    }

    if (!description.trim()) {
      alert("Deskripsi tugas wajib diisi.");
      return;
    }

    if (!deadline) {
      alert("Tenggat waktu wajib diisi.");
      return;
    }

    if (editingId !== null) {
      setAssignments((prev) =>
        prev.map((assignment) =>
          assignment.id === editingId
            ? {
                ...assignment,
                title,
                className,
                desc: description,
                due: deadline,
                file: file ? file.name : assignment.file,
              }
            : assignment
        )
      );

      alert("Tugas berhasil diperbarui.");
    } else {
      const newAssignment: Assignment = {
        id: Date.now(),
        title,
        className,
        desc: description,
        due: deadline,
        file: file ? file.name : "Tidak ada file",
        status: "Aktif",
        submissions: "0/0",
      };

      setAssignments((prev) => [newAssignment, ...prev]);

      alert("Tugas berhasil ditambahkan.");
    }

    resetForm();
    setShowForm(false);
  };

  return (
    <div className="page">
      {/* HEADER */}
      <div className="page-heading">
        <div>
          <h1 className="page-title">Tugas</h1>

          <p className="page-subtitle">
            Upload, edit, dan kelola tugas berdasarkan kelas.
          </p>
        </div>

        <button className="btn primary" onClick={handleAdd}>
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
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 4,
            }}
          >
            <div>
              <h2 className="section-title">
                {editingId !== null ? "Edit Tugas" : "Buat Tugas"}
              </h2>

              <p className="section-subtitle">
                {editingId !== null
                  ? "Perbarui informasi tugas yang sudah tersedia."
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
                textAlign: "center",
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

              <button className="btn primary" onClick={handleAdd}>
                <Plus size={15} />
                Tambah Tugas
              </button>
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
                <label>Judul Tugas</label>

                <input
                  className="input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Tugas 1 - Class & Object"
                />
              </div>

              {/* KELAS */}
              <div className="field">
                <label>Kelas</label>

                <select
                  className="select"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* DESKRIPSI */}
              <div className="field">
                <label>Deskripsi</label>

                <textarea
                  className="textarea"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Jelaskan instruksi dan ketentuan tugas..."
                />
              </div>

              {/* DEADLINE + FILE */}
              <div className="grid-2">
                <div className="field">
                  <label>Tenggat Waktu</label>

                  <input
                    className="input"
                    type="datetime-local"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                  />
                </div>

                <div className="field">
                  <label>File Tugas</label>

                  <input
                    className="input"
                    type="file"
                    onChange={(e) =>
                      setFile(e.target.files?.[0] || null)
                    }
                  />
                </div>
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
                  style={{ flex: 1 }}
                >
                  {editingId !== null ? (
                    <>
                      <Check size={15} />
                      Simpan Perubahan
                    </>
                  ) : (
                    <>
                      <Upload size={15} />
                      Upload / Simpan Tugas
                    </>
                  )}
                </button>

                {editingId !== null && (
                  <button
                    type="button"
                    className="btn"
                    onClick={() => {
                      resetForm();
                      setShowForm(false);
                    }}
                  >
                    Batal
                  </button>
                )}
              </div>
            </form>
          )}
        </div>

        {/* LIST TUGAS */}
        <div className="card">
          <h2 className="section-title">Tugas Terupload</h2>

          <p className="section-subtitle">
            Daftar tugas yang sudah tersedia.
          </p>

          <div
            style={{
              display: "grid",
              gap: 12,
              marginTop: 18,
            }}
          >
            {assignments.length === 0 ? (
              <div
                style={{
                  padding: 40,
                  textAlign: "center",
                  color: "#64748b",
                }}
              >
                <FileText size={40} />

                <p style={{ marginTop: 12 }}>
                  Belum ada tugas.
                </p>
              </div>
            ) : (
              assignments.map((assignment) => (
                <div className="assignment" key={assignment.id}>
                  {/* INFO */}
                  <div style={{ flex: 1 }}>
                    <div className="assignment-title">
                      {assignment.title}
                    </div>

                    <div className="assignment-desc">
                      <FileText
                        size={12}
                        style={{
                          verticalAlign: "-2px",
                        }}
                      />{" "}
                      {assignment.file}

                      <br />

                      {assignment.className} ·{" "}
                      {assignment.submissions}
                    </div>
                  </div>

                  {/* RIGHT */}
                  <div
                    style={{
                      textAlign: "right",
                      minWidth: 170,
                    }}
                  >
                    <span className="badge green">
                      {assignment.status}
                    </span>

                    <div
                      className="deadline"
                      style={{ marginTop: 7 }}
                    >
                      <CalendarClock
                        size={12}
                        style={{
                          verticalAlign: "-2px",
                        }}
                      />{" "}
                      {assignment.due}
                    </div>

                    {/* ACTION */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: 8,
                        marginTop: 12,
                      }}
                    >
                      <button
                        type="button"
                        className="btn small"
                        onClick={() =>
                          handleEdit(assignment)
                        }
                      >
                        <Pencil size={13} />
                        Edit
                      </button>

                      <button
                        type="button"
                        className="btn small danger"
                        onClick={() =>
                          handleDelete(assignment.id)
                        }
                      >
                        <Trash size={13} />
                        Hapus
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}