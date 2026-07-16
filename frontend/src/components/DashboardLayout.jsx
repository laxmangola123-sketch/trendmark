import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { LayoutDashboard, Briefcase, TrendingUp, BarChart3, Bookmark, ShieldCheck } from "lucide-react";
import { useAuth } from "../lib/auth";

const NAV = [
  { to: "/dashboard",           label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/dashboard/portfolio", label: "Portfolio", icon: Briefcase },
  { to: "/dashboard/markets",   label: "Markets",   icon: TrendingUp },
  { to: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/dashboard/watchlist", label: "Watchlist", icon: Bookmark },
  { to: "/kyc",                 label: "KYC",       icon: ShieldCheck },
];

function itemClass({ isActive }) {
  return [
    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all",
    isActive
      ? "bg-volt/10 border border-volt/40 text-volt shadow-[0_0_16px_-6px_rgba(0,122,255,0.6)]"
      : "text-white/60 hover:text-white hover:bg-white/5 border border-transparent",
  ].join(" ");
}

export default function DashboardLayout() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
      <aside className="lg:sticky lg:top-24 self-start" data-testid="dashboard-sidebar">
        <div className="card-tactical rounded-2xl p-3">
          <div className="px-3 py-2 mb-2">
            <div className="tag-uppercase text-white/40 text-[10px]">Member area</div>
            <div className="font-heading font-bold text-white text-sm truncate">{user.name || user.email}</div>
          </div>
          <nav className="flex flex-col gap-1">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.end}
                data-testid={`side-nav-${n.label.toLowerCase()}`}
                className={itemClass}
              >
                <n.icon size={18} />
                <span>{n.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>

      <main className="min-w-0">
        <Outlet />
      </main>
    </div>
  );
}
