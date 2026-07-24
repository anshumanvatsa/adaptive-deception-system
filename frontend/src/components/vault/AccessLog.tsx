import { Terminal } from "lucide-react";
import type { AccessLogEntry } from "@/types/employee";
import { useEffect, useRef } from "react";

interface AccessLogProps {
  logs: AccessLogEntry[];
}

const AccessLog = ({ logs }: AccessLogProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const getActionColor = (action: string) => {
    switch (action) {
      case "DECRYPT": return "text-success";
      case "DENIED": return "text-destructive";
      case "AUTH": return "text-primary";
      case "ROLE_SET": return "text-warning";
      default: return "text-muted-foreground";
    }
  };

  return (
    <div className="glass rounded-2xl overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-3 border-b border-white/[0.06]">
        <Terminal className="w-4 h-4 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Access Log</span>
        <span className="ml-auto w-2 h-2 rounded-full bg-success animate-pulse-glow" />
      </div>
      <div ref={scrollRef} className="p-4 max-h-48 overflow-y-auto font-mono text-xs space-y-1.5 bg-background/40">
        {logs.map((log, i) => (
          <div
            key={log.id}
            className="flex gap-3 opacity-0"
            style={{ animationDelay: `${i * 100}ms`, animation: "stagger-in 0.3s ease-out forwards" }}
          >
            <span className="text-muted-foreground/50 flex-shrink-0">
              {new Date(log.timestamp).toLocaleTimeString()}
            </span>
            <span className={`flex-shrink-0 font-medium ${getActionColor(log.action)}`}>
              [{log.action}]
            </span>
            <span className="text-muted-foreground truncate">{log.detail}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AccessLog;
