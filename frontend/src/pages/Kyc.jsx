import React, { useEffect, useState } from "react";
import { api, getToken } from "../lib/api";
import { toast } from "sonner";
import { useAuth } from "../lib/auth";
import { motion } from "framer-motion";
import { ShieldCheck, Clock, XCircle, Upload } from "lucide-react";

const STATE_STYLES = {
  approved: { icon: ShieldCheck, tone: "text-laser", label: "APPROVED" },
  pending:  { icon: Clock,       tone: "text-amber", label: "PENDING REVIEW" },
  rejected: { icon: XCircle,     tone: "text-blaze", label: "REJECTED" },
  none:     { icon: Upload,      tone: "text-white/70", label: "NOT SUBMITTED" },
};

export default function KycPage() {
  const { refresh } = useAuth();
  const [kyc, setKyc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    full_name: "", dob: "",
    address_line1: "", address_city: "", address_state: "", address_zip: "",
    passport_number: "",
  });
  const [file, setFile] = useState(null);

  useEffect(() => {
    api.get("/api/kyc/me").then(({data}) => setKyc(data.kyc)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!file) return toast.error("Please attach a PDF document.");
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      fd.append("document", file);
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/kyc/submit`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Submission failed");
      setKyc(data.kyc);
      await refresh();
      toast.success("KYC submitted. Our team will review it shortly.");
    } catch (err) {
      toast.error(err.message);
    } finally { setSubmitting(false); }
  };

  const state = STATE_STYLES[kyc?.status || "none"];
  const StateIcon = state.icon;

  return (
    <div className="max-w-4xl">
      <div className="tag-uppercase text-volt mb-2">KYC verification</div>
      <h1 className="font-heading font-black text-4xl tracking-tighter mb-6">Verify your identity</h1>

      <motion.div initial={{opacity:0, y:16}} animate={{opacity:1, y:0}} className="card-tactical rounded-xl p-6 mb-8 flex items-center gap-4" data-testid="kyc-status-card">
        <StateIcon className={state.tone} size={28}/>
        <div className="flex-1">
          <div className={`font-heading font-bold text-lg ${state.tone}`}>{state.label}</div>
          <div className="text-white/60 text-sm">
            {kyc?.status === "approved" && "You are fully verified. Premium features unlocked."}
            {kyc?.status === "pending"  && "Our team is reviewing your documents. You'll hear back within 24h."}
            {kyc?.status === "rejected" && `Submission rejected. ${kyc.notes || "Please resubmit correct documents."}`}
            {(!kyc || kyc?.status === "none") && "Submit US-style KYC (passport + DOB + address + PDF) to unlock full trading features."}
          </div>
        </div>
      </motion.div>

      {loading && <div className="text-white/50 text-sm">Loading...</div>}

      {(!loading && (!kyc || kyc.status === "rejected")) && (
        <form onSubmit={submit} className="card-tactical rounded-xl p-6 space-y-4" data-testid="kyc-form">
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Full legal name" testId="kyc-name"           value={form.full_name}       onChange={v => setForm({...form, full_name: v})}/>
            <Field label="Date of birth (YYYY-MM-DD)" testId="kyc-dob" value={form.dob}             onChange={v => setForm({...form, dob: v})} placeholder="1990-01-15"/>
            <Field label="Passport number" testId="kyc-passport"       value={form.passport_number} onChange={v => setForm({...form, passport_number: v})}/>
            <Field label="Address line 1" testId="kyc-address1"        value={form.address_line1}   onChange={v => setForm({...form, address_line1: v})}/>
            <Field label="City" testId="kyc-city"                      value={form.address_city}    onChange={v => setForm({...form, address_city: v})}/>
            <Field label="State" testId="kyc-state"                    value={form.address_state}   onChange={v => setForm({...form, address_state: v})} placeholder="NJ"/>
            <Field label="ZIP" testId="kyc-zip"                        value={form.address_zip}     onChange={v => setForm({...form, address_zip: v})} placeholder="08540"/>
          </div>

          <div>
            <label className="tag-uppercase text-white/50 block mb-2">Upload document (PDF)</label>
            <input data-testid="kyc-file" type="file" accept="application/pdf" required
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full text-sm text-white/80"/>
            <p className="text-xs text-white/40 mt-2">Passport scan or drivers-license PDF. Max 10 MB.</p>
          </div>

          <button data-testid="kyc-submit" type="submit" disabled={submitting} className="btn-primary w-full py-3 rounded-md font-semibold text-sm">
            {submitting ? "Submitting..." : "Submit for review"}
          </button>
        </form>
      )}

      {kyc && kyc.status !== "rejected" && (
        <div className="card-tactical rounded-xl p-6 text-sm text-white/70 space-y-2" data-testid="kyc-submission-summary">
          <div><span className="text-white/40">Full name:</span> {kyc.full_name}</div>
          <div><span className="text-white/40">DOB:</span> {kyc.dob}</div>
          <div><span className="text-white/40">Passport:</span> {kyc.passport_number}</div>
          <div><span className="text-white/40">Address:</span> {kyc.address_line1}, {kyc.address_city}, {kyc.address_state} {kyc.address_zip}</div>
          <div><span className="text-white/40">Submitted:</span> {kyc.submitted_at?.slice(0, 16).replace("T", " ")}</div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, testId, placeholder }) {
  return (
    <div>
      <label className="tag-uppercase text-white/50 block mb-2">{label}</label>
      <input data-testid={testId} required value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full px-4 py-3 rounded-md text-sm"/>
    </div>
  );
}
