import type { Employee } from "@/types/employee";
import { useApp } from "@/context/AppContext";

interface EmployeeTableProps {
  onSelect: (employee: Employee) => void;
  search: string;
}

const EmployeeTable = ({ onSelect, search }: EmployeeTableProps) => {
  const { employees } = useApp();
  const safeSearch = (search || "").toLowerCase();

  const filteredEmployees = employees.filter((emp) => {
    return (
      (emp.name || "").toLowerCase().includes(safeSearch) ||
      (emp.department || "").toLowerCase().includes(safeSearch)
    );
  });

  // Data mode badge — REAL or DECOY
  const getModeBadge = (emp: Employee) => {
    const mode = emp.data_mode || (emp.trust === "REAL" ? "REAL" : "DECOY");
    if (mode === "REAL") {
      return (
        <span className="text-xs px-2 py-1 rounded-full bg-green-500/15 text-green-400">
          REAL
        </span>
      );
    }
    return (
      <span className="text-xs px-2 py-1 rounded-full bg-orange-500/15 text-orange-400">
        DECOY
      </span>
    );
  };

  const getSalaryStyle = (emp: Employee) => {
    const mode = emp.data_mode || (emp.trust === "REAL" ? "REAL" : "DECOY");
    return mode === "REAL" ? "text-green-400" : "text-orange-400";
  };

  const getBankStyle = (emp: Employee) => {
    const mode = emp.data_mode || (emp.trust === "REAL" ? "REAL" : "DECOY");
    return mode === "REAL" ? "text-green-400" : "text-orange-400 blur-sm";
  };

  return (
    <div className="glass rounded-2xl">
      <div className="overflow-auto max-h-[500px]">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-white/[0.06]">
              {[
                "Name",
                "Department",
                "Designation",
                "Email",
                "Phone",
                "City",
                "Age",
                "Salary",
                "Bank Account",
                "Mode",
              ].map((h) => (
                <th
                  key={h}
                  className="sticky top-0 backdrop-blur-xl bg-white/[0.03] px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {filteredEmployees.length > 0 ? (
              filteredEmployees.map((emp, i) => (
                <tr
                  key={emp.emp_id}
                  className="border-b border-white/[0.04] hover:bg-white/[0.04] transition-all duration-200 cursor-pointer group"
                  style={{
                    animationDelay: `${i * 60}ms`,
                    animation: "stagger-in 0.4s ease-out forwards",
                    opacity: 0,
                  }}
                  onClick={() => onSelect(emp)}
                >
                  {/* NAME */}
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/40 to-accent/40 flex items-center justify-center text-xs font-medium text-foreground">
                        {emp.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <span className="font-medium text-foreground group-hover:translate-x-0.5 transition-transform">
                        {emp.name}
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    <span className="text-sm px-2.5 py-1 rounded-md bg-white/[0.06] text-muted-foreground">
                      {emp.department}
                    </span>
                  </td>

                  <td className="px-6 py-5 text-sm text-muted-foreground">
                    {emp.designation}
                  </td>

                  <td className="px-6 py-5 text-sm text-muted-foreground">
                    {emp.email}
                  </td>

                  <td className="px-6 py-5 text-sm text-muted-foreground">
                    {emp.phone}
                  </td>

                  <td className="px-6 py-5 text-sm text-muted-foreground">
                    {emp.city}
                  </td>

                  <td className="px-6 py-5 text-sm text-muted-foreground">
                    {emp.age}
                  </td>

                  {/* SALARY */}
                  <td className={`px-6 py-5 text-sm ${getSalaryStyle(emp)}`}>
                    ${emp.salary}{" "}
                    {emp.data_mode === "REAL" ? "🔓" : "🎭"}
                  </td>

                  {/* BANK */}
                  <td className={`px-6 py-5 text-sm font-mono ${getBankStyle(emp)}`}>
                    {emp.bank_account}
                  </td>

                  {/* MODE */}
                  <td className="px-6 py-5">
                    {getModeBadge(emp)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={10} style={{ textAlign: "center", padding: "2rem" }} className="text-muted-foreground text-sm">
                  No employees found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeeTable;