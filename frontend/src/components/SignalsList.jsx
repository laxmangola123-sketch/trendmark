import React from "react";

const SAMPLE_SIGNALS = [
  { pair: "BTC/USDT", side: "LONG", entry: "42,850", tp: "44,200", sl: "42,100", change: "+3.15%" },
  { pair: "ETH/USDT", side: "LONG", entry: "2,320",  tp: "2,410",  sl: "2,280",  change: "+1.86%" },
  { pair: "SOL/USDT", side: "SHORT", entry: "104.20", tp: "98.50",  sl: "106.80", change: "-2.42%" },
];

function sideClasses(side) {
  return side === "LONG" ? "text-laser" : "text-blaze";
}

function changeClasses(change) {
  return change.startsWith("-") ? "text-blaze" : "text-laser";
}

export default function SignalsList({ locked }) {
  return (
    <div className="lg:col-span-2 card-tactical rounded-xl p-6">
      <div className="tag-uppercase text-white/50 mb-3">Today&apos;s Signals</div>
      <div className="space-y-3">
        {SAMPLE_SIGNALS.map((s) => (
          <div key={s.pair} className="flex items-center justify-between border border-white/5 rounded-lg p-4 bg-black/20">
            <div>
              <div className="font-mono text-sm">{s.pair}</div>
              <div className="text-xs text-white/40 mt-1">Entry {s.entry} · TP {s.tp} · SL {s.sl}</div>
            </div>
            <div className="text-right">
              <div className={`tag-uppercase ${sideClasses(s.side)}`}>{s.side}</div>
              <div className={`font-mono text-sm ${changeClasses(s.change)}`}>{s.change}</div>
            </div>
          </div>
        ))}
      </div>
      {locked && (
        <div className="mt-4 text-xs text-white/50 italic">
          These are sample signals. Upgrade to unlock live intraday alerts.
        </div>
      )}
    </div>
  );
}
