// AppContext.jsx — Employee data context (FINAL FIXED)

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { fetchEmployees } from "../services/api";
import { useAuth } from "./AuthContext";

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const { token, logout } = useAuth();

  const [employees, setEmployees] = useState([]);
  const [meta, setMeta] = useState({
    trust_score: 70,
    data_mode: "REAL",
    role: "user",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadEmployees = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError(null);

      // Backend always returns { meta, employees }
      const data = await fetchEmployees(token);

      setEmployees(data.employees || []);
      setMeta(
        data.meta || {
          trust_score: 70,
          data_mode: "REAL",
          role: "user",
        }
      );
    } catch (err) {
      console.error(err);

      if (err?.message === "UNAUTHORIZED") {
        logout();
        return;
      }

      setError("Could not connect to backend");
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  }, [token, logout]);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  return (
    <AppContext.Provider
      value={{
        employees,
        meta,
        loading,
        error,
        reloadEmployees: loadEmployees,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);