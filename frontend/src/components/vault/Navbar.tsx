import { Shield, LogOut, Activity, Lock, LockOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useApp } from "@/context/AppContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { meta } = useApp() || { meta: { trust_score: 70, data_mode: "REAL" } };

  const isAdmin = user?.role === "admin";
  const trust = meta?.trust_score ?? 70;
  const dataMode = meta?.data_mode ?? "REAL";

  // Trust badge colour
  const trustColor =
    trust >= 70
      ? "bg-success/10 text-success border-success/20"
      : trust >= 50
      ? "bg-warning/10 text-warning border-warning/20"
      : "bg-destructive/10 text-destructive border-destructive/20";

  const trustLabel =
    trust >= 70 ? "High Trust" : trust >= 50 ? "Medium Trust" : "Low Trust";

  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur-xl bg-background/70 border-b border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Left — Logo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Shield className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold tracking-tight text-foreground">VaultView</span>
        </div>

        {/* Center — Badges */}
        <div className="flex items-center gap-2">
          {/* Role badge */}
          <div
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-300 ${
              isAdmin
                ? "bg-success/10 text-success border-success/20"
                : "bg-destructive/10 text-destructive border-destructive/20"
            }`}
          >
            {isAdmin ? <LockOpen className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
            <span>{isAdmin ? "Admin" : "User"}</span>
          </div>

          {/* Trust badge */}
          <div
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${trustColor}`}
          >
            <Activity className="w-3 h-3" />
            <span>{trustLabel} ({trust})</span>
          </div>

          {/* Data mode badge */}
          <div
            className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${
              dataMode === "REAL"
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                : "bg-orange-500/10 text-orange-400 border-orange-500/20"
            }`}
          >
            {dataMode === "REAL" ? "🔓" : "🎭"} {dataMode}
          </div>
        </div>

        {/* Right — User info + logout */}
        <div className="flex items-center gap-3">
          {user && (
            <span className="hidden sm:block text-xs text-muted-foreground truncate max-w-[160px]">
              {user.email}
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="gap-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
