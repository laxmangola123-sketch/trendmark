import React, { useState } from "react";
import { useAdminData } from "../lib/useAdminData";
import AdminStats from "../components/admin/AdminStats";
import UsersTable from "../components/admin/UsersTable";
import PaymentsTable from "../components/admin/PaymentsTable";
import EmailsTable from "../components/admin/EmailsTable";
import PlansAdmin from "../components/admin/PlansAdmin";
import StocksAdmin from "../components/admin/StocksAdmin";
import KycAdmin from "../components/admin/KycAdmin";
import ContentAdmin from "../components/admin/ContentAdmin";

const TABS = [
  { id: "users",    label: "Users" },
  { id: "payments", label: "Payments" },
  { id: "kyc",      label: "KYC" },
  { id: "content",  label: "Content" },
  { id: "plans",    label: "Plans" },
  { id: "stocks",   label: "Stocks" },
  { id: "emails",   label: "Emails" },
];

export default function Admin() {
  const { stats, users, emails, plans, stocks, kyc, payments, loading, reload } = useAdminData();
  const [tab, setTab] = useState("users");

  return (
    <main className="max-w-7xl mx-auto px-6 py-10">
      <div className="tag-uppercase text-volt mb-2">Admin control center</div>
      <h1 className="font-heading font-black text-4xl tracking-tighter mb-8">Everything, in one view.</h1>

      {loading && !stats && <div className="text-white/50 text-sm mb-6">Loading admin data...</div>}
      {stats && <AdminStats stats={stats} />}

      <div className="flex flex-wrap gap-2 mb-4">
        {TABS.map((t) => (
          <button
            key={t.id}
            data-testid={`admin-tab-${t.id}`}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-md text-sm ${tab === t.id ? "btn-primary" : "btn-outline"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "users"    && <UsersTable users={users} onChange={reload} />}
      {tab === "payments" && <PaymentsTable payments={payments} onChange={reload} />}
      {tab === "kyc"      && <KycAdmin items={kyc} onChange={reload} />}
      {tab === "content"  && <ContentAdmin />}
      {tab === "plans"    && <PlansAdmin plans={plans} onChange={reload} />}
      {tab === "stocks"   && <StocksAdmin stocks={stocks} onChange={reload} />}
      {tab === "emails"   && <EmailsTable emails={emails} />}
    </main>
  );
}
