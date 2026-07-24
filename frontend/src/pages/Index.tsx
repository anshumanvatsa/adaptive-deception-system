import { useState, useMemo, useCallback } from "react";
import Navbar from "@/components/vault/Navbar";
import StatsCards from "@/components/vault/StatsCards";
import SearchBar from "@/components/vault/SearchBar";
import EmployeeTable from "@/components/vault/EmployeeTable";
import EmployeeModal from "@/components/vault/EmployeeModal";
import AccessLog from "@/components/vault/AccessLog";
import type { AccessLogEntry, Employee } from "@/types/employee";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { RefreshCw } from "lucide-react";

const Index = () => {
  const { employees, meta, loading, error, reloadEmployees } = useApp();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const filteredCount = useMemo(
    () =>
      employees.filter(
        (e) =>
          e.name.toLowerCase().includes(search.toLowerCase()) ||
          e.department.toLowerCase().includes(search.toLowerCase())
      ).length,
    [employees, search]
  );

  const handleRefresh = useCallback(() => {
    reloadEmployees();
  }, [reloadEmployees]);

  const logs = useMemo<AccessLogEntry[]>(() => {
    const trustScore = meta?.trust_score ?? 70;
    const dataMode = meta?.data_mode ?? "REAL";

    const getTierLabel = (score: number) => {
      if (score >= 75) return "TRUSTED";
      if (score >= 45) return "SUSPICIOUS";
      return "HOSTILE";
    };

    const getModeDetail = () => {
      if (dataMode === "REAL") return `TRUSTED tier — real decrypted data served (trust ${trustScore} ≥ 75)`;
      if (dataMode === "ENCRYPTED_REAL") return `SUSPICIOUS tier — tarpitted, ciphertext returned (trust ${trustScore} 45–74)`;
      return `HOSTILE tier — seeded decoy data served (trust ${trustScore} < 45)`;
    };

    const base: AccessLogEntry[] = [
      {
        id: "1",
        timestamp: new Date().toISOString(),
        action: "AUTH",
        user: user?.email || "unknown",
        detail: `Authenticated as ${(user?.role || "user").toUpperCase()} — tier=${getTierLabel(trustScore)} trust=${trustScore}`,
      },
      {
        id: "2",
        timestamp: new Date(Date.now() - 45000).toISOString(),
        action: "VIEW",
        user: user?.email || "unknown",
        detail: `Fetched ${employees.length} employee record(s) — mode=${dataMode}`,
      },
      {
        id: "3",
        timestamp: new Date(Date.now() - 90000).toISOString(),
        action: dataMode === "REAL" ? "DECRYPT" : dataMode === "ENCRYPTED_REAL" ? "TARPIT" : "DENIED",
        user: user?.email || "unknown",
        detail: getModeDetail(),
      },
    ];
    return base;
  }, [user, employees.length, meta]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-10">
        {/* Stats */}
        <StatsCards
          employees={employees}
          trustScore={meta?.trust_score ?? 70}
          dataMode={meta?.data_mode ?? "REAL"}
        />

        {/* Table Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Employee Directory</h2>
              <p className="text-sm text-muted-foreground mt-0.5">{filteredCount} records</p>
            </div>
            <div className="flex items-center gap-3">
              <SearchBar value={search} onChange={setSearch} />
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-white/[0.05] border border-white/[0.08] text-muted-foreground hover:text-foreground hover:border-white/20 transition-all disabled:opacity-50"
                title="Refresh data (affects trust score)"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </button>
            </div>
          </div>
          {loading && <p className="text-sm text-muted-foreground">Loading employees…</p>}
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="mt-6 overflow-x-auto">
            <EmployeeTable search={search} onSelect={setSelectedEmployee} />
          </div>
        </div>

        {/* Access Log */}
        <AccessLog logs={logs} />
      </main>

      <EmployeeModal employee={selectedEmployee} onClose={() => setSelectedEmployee(null)} />
    </div>
  );
};

export default Index;
