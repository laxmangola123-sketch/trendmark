import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function Signup({ onCreated }) {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signup(form.name.trim(), form.email.trim().toLowerCase(), form.password);
      toast.success("Account created! Choose a membership or start your 7-day trial.");
      onCreated?.();
      navigate("/dashboard?welcome=1");
    } catch (err) {
      const msg = err?.response?.data?.detail || "Something went wrong. Please try again.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-72px)] flex items-center justify-center px-6 py-12">
      <motion.div initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}} className="w-full max-w-md card-tactical rounded-2xl p-8" data-testid="signup-form">
        <div className="tag-uppercase text-volt mb-2">Create account</div>
        <h1 className="font-heading font-black text-3xl tracking-tighter mb-2">Start your 7-day trial</h1>
        <p className="text-white/60 text-sm mb-6">No credit card required. Cancel anytime.</p>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="tag-uppercase text-white/50 block mb-2">Name</label>
            <input data-testid="signup-name" required value={form.name} onChange={e => setForm({...form, name: e.target.value})}
              className="w-full px-4 py-3 rounded-md text-sm" placeholder="Alex Trader" />
          </div>
          <div>
            <label className="tag-uppercase text-white/50 block mb-2">Email</label>
            <input data-testid="signup-email" required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
              className="w-full px-4 py-3 rounded-md text-sm" placeholder="you@example.com" />
          </div>
          <div>
            <label className="tag-uppercase text-white/50 block mb-2">Password</label>
            <input data-testid="signup-password" required type="password" minLength={6} value={form.password} onChange={e => setForm({...form, password: e.target.value})}
              className="w-full px-4 py-3 rounded-md text-sm" placeholder="At least 6 characters" />
          </div>

          {error && <div data-testid="signup-error" className="text-sm text-blaze bg-blaze/10 border border-blaze/30 rounded-md px-3 py-2">{error}</div>}

          <button data-testid="signup-submit" type="submit" disabled={loading} className="btn-primary w-full py-3 rounded-md font-semibold text-sm">
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <div className="text-sm text-white/50 mt-6 text-center">
          Already have an account? <Link to="/login" data-testid="signup-to-login" className="text-volt hover:text-white transition-colors">Log in</Link>
        </div>
      </motion.div>
    </main>
  );
}
