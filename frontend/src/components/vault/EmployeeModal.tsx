import { X, Lock, LockOpen, User, Mail, Building, DollarSign, Phone, MapPin, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Employee } from "@/types/employee";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";

interface EmployeeModalProps {
  employee: Employee | null;
  onClose: () => void;
}

const EmployeeModal = ({ employee, onClose }: EmployeeModalProps) => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [visible, setVisible] = useState(false);

  const isReal = employee?.data_mode === "REAL";

  useEffect(() => {
    if (employee) {
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
    }
  }, [employee]);

  if (!employee) return null;

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  const Field = ({
    icon: Icon,
    label,
    value,
    sensitive,
  }: {
    icon: typeof User;
    label: string;
    value: string;
    sensitive?: boolean;
  }) => (
    <div className="flex items-start gap-3 py-3">
      <div className="w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon className="w-4 h-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
        <p
          className={`text-sm font-medium ${
            sensitive && !isReal
              ? "blur-sm italic text-muted-foreground opacity-60 select-none"
              : "text-foreground"
          }`}
        >
          {value}
        </p>
      </div>
      {sensitive && (
        isReal ? (
          <LockOpen className="w-3.5 h-3.5 text-success mt-2" />
        ) : (
          <Lock className="w-3.5 h-3.5 text-destructive mt-2" />
        )
      )}
    </div>
  );

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-background/60 backdrop-blur-sm transition-opacity duration-300 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
        onClick={handleClose}
      />
      {/* Panel */}
      <div
        className={`fixed right-0 top-0 z-50 h-full w-full max-w-md glass-strong border-l border-white/[0.08] overflow-y-auto transition-transform duration-300 ease-out ${
          visible ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-semibold text-foreground">Employee Details</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Avatar + Name */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/40 to-accent/40 flex items-center justify-center text-xl font-semibold text-foreground mb-3">
              {employee.name.split(" ").map((n) => n[0]).join("")}
            </div>
            <h3 className="text-xl font-semibold text-foreground">{employee.name}</h3>

            {/* Data mode badge */}
            <div
              className={`mt-2 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                isReal
                  ? "bg-success/10 text-success border border-success/20"
                  : "bg-orange-500/10 text-orange-400 border border-orange-500/20"
              }`}
            >
              {isReal ? <LockOpen className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
              {isReal ? "Real Data" : "Decoy Data"}
            </div>

            {!isAdmin && (
              <p className="text-xs text-muted-foreground mt-2">Viewing own record</p>
            )}
          </div>

          {/* Basic Info */}
          <div className="mb-6">
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-1">
              Basic Information
            </h4>
            <div className="glass rounded-xl p-2 divide-y divide-white/[0.04]">
              <Field icon={Mail} label="Email" value={employee.email} />
              <Field icon={Building} label="Department" value={employee.department} />
              <Field icon={Briefcase} label="Designation" value={employee.designation} />
              <Field icon={MapPin} label="City" value={employee.city} />
              <Field icon={User} label="Age" value={String(employee.age)} />
            </div>
          </div>

          {/* Sensitive Info */}
          <div>
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-1">
              Sensitive Information
              {!isReal && (
                <span className="ml-2 normal-case text-orange-400">(Decoy)</span>
              )}
            </h4>
            <div className="glass rounded-xl p-2 divide-y divide-white/[0.04]">
              <Field icon={DollarSign} label="Salary" value={`$${employee.salary}`} sensitive />
              <Field icon={Phone} label="Phone" value={employee.phone} sensitive />
              <Field icon={User} label="Bank Account" value={employee.bank_account} sensitive />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EmployeeModal;
