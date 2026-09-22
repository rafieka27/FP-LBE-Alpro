const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8080";

export async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
) {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem(
          "eduportal-token"
        )
      : null;

  const headers = new Headers(
    options.headers
  );

  // JSON hanya untuk body yang bukan FormData.
  // FormData harus dibiarkan agar browser
  // membuat Content-Type + boundary sendiri.
  if (
    !headers.has("Content-Type") &&
    options.body &&
    !(options.body instanceof FormData)
  ) {
    headers.set(
      "Content-Type",
      "application/json"
    );
  }

  if (token) {
    headers.set(
      "Authorization",
      `Bearer ${token}`
    );
  }

  const response = await fetch(
    `${API_URL}${endpoint}`,
    {
      ...options,
      headers,
    }
  );

  const contentType =
    response.headers.get(
      "content-type"
    );

  const data =
    contentType?.includes(
      "application/json"
    )
      ? await response.json()
      : await response.text();

  if (!response.ok) {
    const message =
      typeof data === "object" &&
      data?.error
        ? data.error
        : `Request gagal (${response.status})`;

    throw new Error(message);
  }

  return data;
}

// =========================
// AUTH
// =========================

export async function loginApi(
  email: string,
  password: string
) {
  return apiFetch(
    "/api/auth/login",
    {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
      }),
    }
  );
}

export async function getMeApi() {
  return apiFetch("/api/me");
}

// =========================
// CLASSES
// =========================

export async function getClassesApi() {
  return apiFetch("/api/classes");
}

export async function createClassApi(
  data: {
    code: string;
    name: string;
    subject: string;
  }
) {
  return apiFetch("/api/classes", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateClassApi(
  id: number,
  data: {
    code?: string;
    name?: string;
    subject?: string;
  }
) {
  return apiFetch(
    `/api/classes/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    }
  );
}

export async function deleteClassApi(
  id: number
) {
  return apiFetch(
    `/api/classes/${id}`,
    {
      method: "DELETE",
    }
  );
}

export async function addStudentApi(
  classId: number,
  email: string
) {
  return apiFetch(
    `/api/classes/${classId}/students`,
    {
      method: "POST",
      body: JSON.stringify({
        email,
      }),
    }
  );
}

export async function removeStudentApi(
  classId: number,
  studentId: number
) {
  return apiFetch(
    `/api/classes/${classId}/students/${studentId}`,
    {
      method: "DELETE",
    }
  );
}

// =========================
// ASSIGNMENTS
// =========================

export async function getAssignmentsApi() {
  return apiFetch(
    "/api/assignments"
  );
}

export async function createAssignmentApi(
  data:
    | {
        title: string;
        description: string;
        file_url: string;
        due_at: string;
        status: string;
        class_id: number;
      }
    | FormData
) {
  return apiFetch(
    "/api/assignments",
    {
      method: "POST",
      body:
        data instanceof FormData
          ? data
          : JSON.stringify(data),
    }
  );
}

export async function updateAssignmentApi(
  id: number,
  data:
    | {
        title: string;
        description: string;
        file_url: string;
        due_at: string;
        status: string;
        class_id: number;
      }
    | FormData
) {
  return apiFetch(
    `/api/assignments/${id}`,
    {
      method: "PUT",
      body:
        data instanceof FormData
          ? data
          : JSON.stringify(data),
    }
  );
}

export async function deleteAssignmentApi(
  id: number
) {
  return apiFetch(
    `/api/assignments/${id}`,
    {
      method: "DELETE",
    }
  );
}

// =========================
// GRADES
// =========================

export async function getGradesApi() {
  return apiFetch("/api/grades");
}

export async function getGradesByClassApi(
  classId: number,
  component: string
) {
  return apiFetch(
    `/api/grades?class_id=${classId}&component=${encodeURIComponent(
      component
    )}`
  );
}

export async function saveGradeApi(
  data: {
    student_id: number;
    class_id: number;
    component: string;
    score: number;
    note?: string;
    published?: boolean;
  }
) {
  return apiFetch(
    "/api/grades",
    {
      method: "POST",
      body: JSON.stringify({
        student_id:
          data.student_id,

        class_id:
          data.class_id,

        component:
          data.component,

        score: data.score,

        note:
          data.note || "",

        published:
          data.published ?? false,
      }),
    }
  );
}

export async function getStudentGradesApi(
  studentId: number
) {
  return apiFetch(
    `/api/students/${studentId}/grades`
  );
}