import { Users, ShieldCheck, ShieldOff, Activity, Database } from "lucide-react";
import type { Employee } from "@/types/employee";
import { useAuth } from "@/context/AuthContext";

interface StatsCardsProps {
  employees: Employee[];
  trustScore: number;
  dataMode: "REAL" | "DECOY";
}

const StatsCards = ({ employees, trustScore, dataMode }: StatsCardsProps) => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const trustGradient =
    trustScore >= 70
      ? { card: "from-success/20 to-success/5", icon: "from-success to-emerald-400" }
      : trustScore >= 50
      ? { card: "from-warning/20 to-warning/5", icon: "from-warning to-yellow-400" }
      : { card: "from-destructive/20 to-destructive/5", icon: "from-destructive to-red-400" };

  const cards = [
    {
      label: "Total Records",
      value: employees.length,
      icon: Users,
      gradient: "from-primary/20 to-primary/5",
      iconBg: "from-primary to-accent",
    },
    {
      label: "Trust Score",
      value: trustScore,
      icon: Activity,
      gradient: trustGradient.card,
      iconBg: trustGradient.icon,
    },
    {
      label: "Access Level",
      value: isAdmin ? "Full" : "Limited",
      icon: isAdmin ? ShieldCheck : ShieldOff,
      gradient: isAdmin ? "from-success/20 to-success/5" : "from-destructive/20 to-destructive/5",
      iconBg: isAdmin ? "from-success to-emerald-400" : "from-destructive to-red-400",
    },
    {
      label: "Data Mode",
      value: dataMode,
      icon: Database,
      gradient:
        dataMode === "REAL"
          ? "from-emerald-500/20 to-emerald-500/5"
          : "from-orange-500/20 to-orange-500/5",
      iconBg:
        dataMode === "REAL"
          ? "from-emerald-500 to-green-400"
          : "from-orange-500 to-amber-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <div
          key={card.label}
          className="glass rounded-2xl p-6 gradient-border group hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 cursor-default"
          style={{ animationDelay: `${i * 80}ms`, animation: "stagger-in 0.4s ease-out forwards", opacity: 0 }}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">{card.label}</p>
              <p className="text-3xl font-semibold text-foreground">{card.value}</p>
            </div>
            <div
              className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.iconBg} flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}
            >
              <card.icon className="w-5 h-5 text-foreground" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
