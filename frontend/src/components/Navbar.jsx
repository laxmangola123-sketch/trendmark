import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { LineChart, LogOut } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="glass sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2" data-testid="brand-logo">
          <div className="w-8 h-8 rounded-md bg-volt flex items-center justify-center">
            <LineChart size={18} className="text-white" />
          </div>
          <span className="font-heading font-black text-lg tracking-tight">TrendTracker <span className="text-volt">Pro</span></span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm text-white/70">
          <NavLink to="/plans" data-testid="nav-plans" className={({isActive})=> isActive ? "text-white" : "hover:text-white transition-colors"}>Plans</NavLink>
          <a href="/#how" className="hover:text-white transition-colors">How it works</a>
          <a href="/#faq" className="hover:text-white transition-colors">FAQ</a>
          {user && <NavLink to="/dashboard" data-testid="nav-dashboard" className={({isActive})=> isActive ? "text-white" : "hover:text-white transition-colors"}>Dashboard</NavLink>}
          {/* KYC / Portfolio / Markets / etc. live in the dashboard sidebar. Admin link intentionally hidden. */}
        </nav>

        <div className="flex items-center gap-3">
          {!user ? (
            <>
              <Link to="/login" data-testid="nav-login" className="btn-outline px-4 py-2 rounded-md text-sm">Log in</Link>
              <Link to="/signup" data-testid="nav-signup" className="btn-primary px-4 py-2 rounded-md text-sm font-semibold">Get started</Link>
            </>
          ) : (
            <>
              <span className="hidden sm:inline text-xs text-white/60" data-testid="nav-user-email">{user.email}</span>
              <button data-testid="nav-logout" onClick={() => { logout(); navigate("/"); }} className="btn-outline px-3 py-2 rounded-md text-sm flex items-center gap-1"><LogOut size={14}/>Logout</button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
