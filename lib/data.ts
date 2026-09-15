export type Role = "dosen" | "asisten" | "mahasiswa";

export const classes = [
  { id: "IF-101", name: "PBO-A", code: "IF-101", students: 42, subject: "Pemrograman Berorientasi Objek" },
  { id: "IF-102", name: "PBO-B", code: "IF-102", students: 39, subject: "Pemrograman Berorientasi Objek" },
  { id: "IF-103", name: "PBO-C", code: "IF-103", students: 41, subject: "Pemrograman Berorientasi Objek" },
];

export const students = [
  ["5025251001", "Adit Pratama"], ["5025251002", "Bima Saputra"], ["5025251003", "Citra Lestari"],
  ["5025251004", "Daffa Ramadhan"], ["5025251005", "Elvina Putri"], ["5025251006", "Farhan Akmal"],
  ["5025251007", "Gilang Maulana"], ["5025251008", "Hana Salsabila"]
];

export const lecturerAssessments = ["Tugas", "ETS", "EAS", "Quiz 1", "Quiz 2", "Quiz 3", "Quiz 4", "Final Project"];
export const assistantAssessments = ["Tugas", "Keaktifan", "Praktikum 1", "Praktikum 2", "Praktikum 3", "Praktikum 4", "Praktikum 5", "Remidi 1", "Remidi 2", "Remidi 3", "Remidi 4", "Remidi 5", "Final Praktikum"];

export const assignments = [
  { title: "Tugas 1 - Class & Object", className: "PBO-A", due: "18 Sep 2026, 23:59", desc: "Implementasi class, object, constructor, dan method pada studi kasus sederhana.", file: "Tugas-1-OOP.pdf", status: "Aktif", submissions: "36/42" },
  { title: "Tugas 2 - Inheritance", className: "PBO-A", due: "25 Sep 2026, 23:59", desc: "Menerapkan inheritance dan overriding pada project kelompok.", file: "Tugas-2-Inheritance.pdf", status: "Aktif", submissions: "31/42" },
  { title: "Mini Project - Polymorphism", className: "PBO-B", due: "02 Okt 2026, 23:59", desc: "Membuat aplikasi mini yang menerapkan konsep polymorphism.", file: "Mini-Project.pdf", status: "Aktif", submissions: "22/39" }
];

export const grades = students.map(([id, name], i) => ({
  id, name,
  tugas: [82, 88, 76, 91, 85, 79, 94, 87][i],
  ets: [78, 86, 80, 92, 83, 75, 90, 88][i],
  eas: [84, 90, 78, 95, 87, 81, 92, 89][i],
  quiz1: [80, 92, 78, 90, 85, 77, 95, 88][i],
  quiz2: [86, 89, 82, 93, 88, 80, 94, 90][i],
  quiz3: [81, 87, 79, 91, 86, 78, 93, 89][i],
  quiz4: [88, 91, 84, 96, 89, 82, 95, 92][i],
  finalProject: [90, 94, 86, 97, 91, 84, 96, 93][i],
}));

export const studentGradeRows = [
  ["Tugas", 82, "Dosen"], ["ETS", 78, "Dosen"], ["EAS", 84, "Dosen"], ["Quiz 1", 80, "Dosen"], ["Quiz 2", 86, "Dosen"], ["Quiz 3", 81, "Dosen"], ["Quiz 4", 88, "Dosen"], ["Final Project", 90, "Dosen"],
  ["Keaktifan", 92, "Asisten"], ["Praktikum 1", 88, "Asisten"], ["Praktikum 2", 90, "Asisten"], ["Praktikum 3", 85, "Asisten"], ["Praktikum 4", 94, "Asisten"], ["Praktikum 5", 89, "Asisten"], ["Final Praktikum", 91, "Asisten"]
];
