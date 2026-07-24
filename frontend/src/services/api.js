const BASE_URL = "https://adaptive-deception-system.onrender.com";

// ---------- AUTH ----------

export const signup = async (email, password, role) => {
  const res = await fetch(`${BASE_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, role }),
  });

  return res.json();
};

export const login = async (email, password) => {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  return res.json();
};

// ---------- EMPLOYEES ----------

export const fetchEmployees = async (token) => {
  const res = await fetch(`${BASE_URL}/employees`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.status === 401) {
    throw new Error("UNAUTHORIZED");
  }

  if (!res.ok) {
    throw new Error("Failed to fetch employees");
  }

  return res.json();
};
export const logoutApi = () => {
  localStorage.removeItem("token");
};