// api.ts — VaultView API service layer (v2)
// All requests use JWT Bearer token for authentication.

const BASE_URL = "http://localhost:5000";

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface AuthResponse {
  token: string;
  role: "admin" | "user";
}

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Login failed");
  return data as AuthResponse;
};

export const signup = async (
  email: string,
  password: string,
  role: "admin" | "user"
): Promise<{ message: string }> => {
  const res = await fetch(`${BASE_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, role }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Signup failed");
  return data;
};

export const logoutApi = async (token: string): Promise<void> => {
  await fetch(`${BASE_URL}/auth/logout`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  }).catch(() => {}); // best-effort
};

// ─── Employees ───────────────────────────────────────────────────────────────

export interface EmployeeResponse {
  meta: {
    trust_score: number;
    data_mode: "REAL" | "ENCRYPTED_REAL" | "DECOY";
    role: string;
  };
  employees: import("../types/employee").Employee[];
}

export const fetchEmployees = async (token: string): Promise<EmployeeResponse> => {
  const res = await fetch(`${BASE_URL}/employees`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 401) throw new Error("UNAUTHORIZED");
  if (!res.ok) throw new Error("Failed to fetch employees");
  return res.json();
};
