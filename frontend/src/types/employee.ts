export type Role = "admin" | "user";

export interface Employee {
  emp_id: number;
  name: string;
  department: string;
  designation: string;
  email: string;
  phone: string;
  city: string;
  age: number;
  salary: string;
  bank_account: string;
  data_mode: "REAL" | "DECOY";
  trust_score: number;
  // legacy field kept for backward compatibility with existing table components
  trust?: string;
}

export interface AccessLogEntry {
  id: string;
  timestamp: string;
  action: string;
  user: string;
  detail: string;
}
