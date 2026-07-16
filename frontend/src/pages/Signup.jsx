import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function Signup({ onCreated }) {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();

    setError("");

    if (!form.name.trim()) {
      setError("Name is required.");
      return;
    }

    if (!form.email.trim()) {
      setError("Email is required.");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      await signup(
        form.name.trim(),
        form.email.trim().toLowerCase(),
        form.password
      );

      toast.success("Account created successfully!");

      if (onCreated) {
        onCreated();
      }

      navigate("/dashboard?welcome=1");
    } catch (err) {
      const message =
        err?.message ||
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Something went wrong. Please try again.";

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-72px)] flex items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md card-tactical rounded-2xl p-8"
        data-testid="signup-form"
      >
        <div className="tag-uppercase text-volt mb-2">
          Create Account
        </div>

        <h1 className="font-heading font-black text-3xl tracking-tighter mb-2">
          Start your 7-day free trial
        </h1>

        <p className="text-white/60 text-sm mb-6">
          Create your account to continue.
        </p>

        <form onSubmit={submit} className="space-y-4">

          <div>
            <label className="tag-uppercase text-white/50 block mb-2">
              Name
            </label>

            <input
              type="text"
              required
              value={form.name}
              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value,
                })
              }
              className="w-full px-4 py-3 rounded-md text-sm"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="tag-uppercase text-white/50 block mb-2">
              Email
            </label>

            <input
              type="email"
              required
              value={form.email}
              onChange={(e) =>
                setForm({
                  ...form,
                  email: e.target.value,
                })
              }
              className="w-full px-4 py-3 rounded-md text-sm"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="tag-uppercase text-white/50 block mb-2">
              Password
            </label>

            <input
              type="password"
              required
              minLength={6}
              value={form.password}
              onChange={(e) =>
                setForm({
                  ...form,
                  password: e.target.value,
                })
              }
              className="w-full px-4 py-3 rounded-md text-sm"
              placeholder="Minimum 6 characters"
            />
          </div>

          {error && (
            <div className="text-red-400 bg-red-500/10 border border-red-500/30 rounded-md px-3 py-2 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 rounded-md font-semibold text-sm"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>

        </form>

        <div className="text-center text-white/60 text-sm mt-6">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-volt hover:text-white"
          >
            Login
          </Link>
        </div>
      </motion.div>
    </main>
  );
}