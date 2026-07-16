import React, { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const loc = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(form.email.trim().toLowerCase(), form.password);
      toast.success(`Welcome back, ${user.name || user.email}!`);
      const next = new URLSearchParams(loc.search).get("next");
      if (next) {
        navigate(next);
      } else if (user.is_admin) {
        navigate("/admin");
      } else if (user.has_membership && user.whatsapp_url) {
        navigate("/welcome-whatsapp");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      const msg = err?.response?.data?.detail || "Login failed.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-72px)] flex items-center justify-center px-6 py-12">
      <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} className="w-full max-w-md card-tactical rounded-2xl p-8" data-testid="login-form">
        <div className="tag-uppercase text-volt mb-2">Sign in</div>
        <h1 className="font-heading font-black text-3xl tracking-tighter mb-2">Welcome back</h1>
        <p className="text-white/60 text-sm mb-6">Log in to check your credits and signals.</p>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="tag-uppercase text-white/50 block mb-2">Email</label>
            <input data-testid="login-email" required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
              className="w-full px-4 py-3 rounded-md text-sm" />
          </div>
          <div>
            <label className="tag-uppercase text-white/50 block mb-2">Password</label>
            <input data-testid="login-password" required type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})}
              className="w-full px-4 py-3 rounded-md text-sm" />
          </div>

          {error && <div data-testid="login-error" className="text-sm text-blaze bg-blaze/10 border border-blaze/30 rounded-md px-3 py-2">{error}</div>}

          <button data-testid="login-submit" type="submit" disabled={loading} className="btn-primary w-full py-3 rounded-md font-semibold text-sm">
            {loading ? "Signing in..." : "Log in"}
          </button>
        </form>

        <div className="text-sm text-white/50 mt-6 text-center">
          New here? <Link to="/signup" data-testid="login-to-signup" className="text-volt hover:text-white transition-colors">Create an account</Link>
        </div>
      </motion.div>
    </main>
  );
}
