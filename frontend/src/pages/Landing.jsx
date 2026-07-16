import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, LineChart, ShieldCheck, Zap, UserPlus, CreditCard, MessageCircle, TrendingUp } from "lucide-react";
import StocksTicker from "../components/StocksTicker";
import Footer from "../components/Footer";

const HERO = "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDN8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMGZpbmFuY2UlMjBjaGFydCUyMGRhcmt8ZW58MHx8fHwxNzgzNzMyMTc4fDA&ixlib=rb-4.1.0&q=85";

const STEPS = [
  { icon: UserPlus, title: "Create account", desc: "Sign up in 30 seconds. Every new account gets a 7-day free trial — no card required." },
  { icon: CreditCard, title: "Pick a membership", desc: "Choose one of four credit-based plans (Starter $79 → Ultimate $299) and complete secure payment." },
  { icon: MessageCircle, title: "Join private WhatsApp", desc: "After approval, get instant access to the plan-specific WhatsApp signals group." },
  { icon: TrendingUp, title: "Trade the signals", desc: "Receive real-time entries, targets and stop-losses from our research team." },
];

const WHY = [
  { title: "Human + AI research", desc: "Every signal is cross-verified by a senior analyst and our proprietary AI stack. No noise, just conviction ideas." },
  { title: "Fair credit-based pricing", desc: "$1 = 1 credit = 1 day of premium access. Never overpay for a month you don't fully use." },
  { title: "Verified compliance", desc: "US-based operations, mandatory KYC for members, and audit-ready payment records." },
  { title: "Dedicated support", desc: "Ultimate members get a personal advisor. Everyone gets a real human on chat and email." },
];

const FAQ = [
  { q: "How is TrendTracker Pro different from other signal groups?", a: "We combine institutional-grade research with AI-driven scanning and publish verified results monthly. Signals are risk-managed, not lottery tickets." },
  { q: "When do my credits start counting?", a: "After the admin approves your payment. From that moment, one credit is consumed per calendar day of premium access." },
  { q: "What happens after my credits run out?", a: "Your dashboard access continues (public data), but premium signals and the WhatsApp group are paused until you renew." },
  { q: "Do you offer refunds?", a: "You can cancel at any time. Unused credits are non-refundable but never expire while the account is active." },
  { q: "Is KYC really required?", a: "Yes — as a US-registered service we require passport + basic identity verification before granting premium access. Your data is encrypted and never shared." },
  { q: "Which WhatsApp group do I join?", a: "Each membership tier has its own WhatsApp group. The invite link appears on your dashboard immediately after approval." },
];

export default function Landing() {
  return (
    <main className="relative">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-lines opacity-40" />
        <div className="max-w-7xl mx-auto px-6 pt-16 pb-16 grid lg:grid-cols-12 gap-10 items-center relative">
          <motion.div
            className="lg:col-span-7 relative z-10"
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          >
            <div className="tag-uppercase text-volt mb-5">Elite market intelligence</div>
            <h1 className="font-heading font-black text-4xl sm:text-5xl lg:text-6xl tracking-tighter leading-[1.05]">
              Trade smarter with <span className="text-volt">signals</span> that pay for themselves.
            </h1>
            <p className="text-white/70 mt-6 text-lg max-w-xl leading-relaxed">
              Real-time US stock &amp; ETF signals, private WhatsApp groups per plan, and a members-only dashboard.
              New here? Every account gets a <span className="text-laser font-semibold">7-day free trial</span> — no credit card required.
            </p>
            <div className="flex flex-wrap gap-3 mt-8">
              <Link to="/signup" data-testid="hero-cta-signup" className="btn-primary px-6 py-3 rounded-md font-semibold text-sm flex items-center gap-2">
                Start free trial <ArrowRight size={16}/>
              </Link>
              <Link to="/plans" data-testid="hero-cta-plans" className="btn-outline px-6 py-3 rounded-md font-semibold text-sm">
                View membership plans
              </Link>
            </div>
            <div className="flex gap-8 mt-10 text-sm text-white/60">
              <div><span className="text-white font-bold font-mono">12,400+</span> active traders</div>
              <div><span className="text-laser font-bold font-mono">94.2%</span> signal accuracy</div>
            </div>
          </motion.div>

          <motion.div
            className="lg:col-span-5 relative"
            initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2, duration: 0.6 }}
          >
            <div className="relative rounded-2xl overflow-hidden border border-white/10">
              <img src={HERO} alt="Trading chart" className="w-full h-[420px] object-cover"/>
              <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/40 to-transparent"/>
              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                <div>
                  <div className="tag-uppercase text-white/70">SPX · 1H</div>
                  <div className="font-heading font-black text-2xl">+2.41%</div>
                </div>
                <div className="font-mono text-xs text-laser bg-laser/10 border border-laser/40 px-2 py-1 rounded">LONG · TP1</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* LIVE STOCKS TICKER */}
      <StocksTicker />

      {/* FEATURES */}
      <section className="max-w-7xl mx-auto px-6 py-16 relative">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: LineChart, title: "Real-time signals", desc: "Actionable trade ideas delivered as they happen, with entry, stop-loss, and targets." },
            { icon: ShieldCheck, title: "Risk-managed", desc: "Every position sized responsibly. We never gamble your credits away." },
            { icon: Zap, title: "Credits system", desc: "Membership converts $1 → 1 credit. Each day of access consumes 1 credit." },
          ].map((f, i) => (
            <motion.div key={f.title}
              className="card-tactical rounded-xl p-6"
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
            >
              <f.icon className="text-volt mb-3" size={24}/>
              <h3 className="font-heading font-bold text-xl mb-2">{f.title}</h3>
              <p className="text-white/60 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="max-w-7xl mx-auto px-6 py-16">
        <div className="tag-uppercase text-volt mb-2">How it works</div>
        <h2 className="font-heading font-black text-3xl sm:text-4xl tracking-tighter mb-10">From signup to signals in 4 steps</h2>
        <div className="grid md:grid-cols-4 gap-6">
          {STEPS.map((s, i) => (
            <div key={s.title} className="card-tactical rounded-xl p-6 relative" data-testid={`how-step-${i+1}`}>
              <div className="tag-uppercase text-white/40 mb-3">Step {i+1}</div>
              <s.icon className="text-volt mb-3" size={22}/>
              <h3 className="font-heading font-bold text-lg mb-2">{s.title}</h3>
              <p className="text-white/60 text-sm">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section id="why" className="max-w-7xl mx-auto px-6 py-16">
        <div className="tag-uppercase text-volt mb-2">Why choose us</div>
        <h2 className="font-heading font-black text-3xl sm:text-4xl tracking-tighter mb-10">Built for traders who take this seriously.</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {WHY.map((w) => (
            <div key={w.title} className="card-tactical rounded-xl p-6" data-testid={`why-${w.title.toLowerCase().replace(/\s+/g,'-')}`}>
              <h3 className="font-heading font-bold text-lg mb-2">{w.title}</h3>
              <p className="text-white/60 text-sm leading-relaxed">{w.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="max-w-4xl mx-auto px-6 py-16">
        <div className="tag-uppercase text-volt mb-2">FAQ</div>
        <h2 className="font-heading font-black text-3xl sm:text-4xl tracking-tighter mb-10">Frequently asked questions</h2>
        <div className="space-y-3">
          {FAQ.map((f) => (
            <details key={f.q} className="card-tactical rounded-xl p-5 group" data-testid={`faq-${FAQ.indexOf(f)}`}>
              <summary className="cursor-pointer font-semibold text-white flex items-center justify-between">
                <span>{f.q}</span>
                <span className="text-volt group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="text-white/60 text-sm mt-3 leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* DISCLAIMER */}
      <section id="disclaimer" className="max-w-4xl mx-auto px-6 py-12">
        <div className="card-tactical border-amber/40 rounded-xl p-6" data-testid="disclaimer-section">
          <div className="tag-uppercase text-amber mb-2">Disclaimer</div>
          <p className="text-white/70 text-sm leading-relaxed">
            TrendTracker Pro provides educational trading signals and market analysis. Nothing on this site constitutes financial advice, investment recommendation,
            or a solicitation to buy or sell any security. Trading involves risk of loss and past performance is not indicative of future results. You are solely
            responsible for your own trading decisions. Consult a licensed financial advisor before making investment decisions.
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}
