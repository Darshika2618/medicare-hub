import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import {
  CalendarCheck,
  Clock,
  FileText,
  LayoutDashboard,
  Pill,
} from "lucide-react";

const navItems = [
  {
    to: "/",
    label: "Dashboard",
    icon: LayoutDashboard,
    ocid: "nav.dashboard_link",
  },
  {
    to: "/medicines",
    label: "Medicines",
    icon: Pill,
    ocid: "nav.medicines_link",
  },
  {
    to: "/reports",
    label: "Reports",
    icon: FileText,
    ocid: "nav.reports_link",
  },
  {
    to: "/followups",
    label: "Follow-ups",
    icon: CalendarCheck,
    ocid: "nav.followups_link",
  },
  {
    to: "/history",
    label: "History",
    icon: Clock,
    ocid: "nav.history_link",
  },
] as const;

export function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border"
      style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
      aria-label="Main navigation"
    >
      <div className="flex items-stretch justify-around max-w-lg mx-auto">
        {navItems.map(({ to, label, icon: Icon, ocid }) => (
          <Link
            key={to}
            to={to}
            data-ocid={ocid}
            className={cn(
              "flex flex-col items-center justify-center gap-1 pt-2 pb-1 px-3 min-w-0 flex-1",
              "min-h-[56px] transition-colors duration-200 rounded-none",
              "text-muted-foreground hover:text-primary",
              "[&.active]:text-primary",
            )}
            activeOptions={to === "/" ? { exact: true } : undefined}
          >
            {({ isActive }) => (
              <>
                <div
                  className={cn(
                    "flex items-center justify-center w-10 h-7 rounded-full transition-all duration-200",
                    isActive && "bg-primary/10",
                  )}
                >
                  <Icon
                    className={cn(
                      "w-5 h-5 transition-colors duration-200",
                      isActive ? "text-primary" : "text-muted-foreground",
                    )}
                    aria-hidden="true"
                  />
                </div>
                <span
                  className={cn(
                    "text-[10px] font-body font-medium leading-none truncate transition-colors duration-200",
                    isActive ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  {label}
                </span>
              </>
            )}
          </Link>
        ))}
      </div>
    </nav>
  );
}
