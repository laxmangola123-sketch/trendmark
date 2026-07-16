import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
    return (
        <footer className="bg-black text-white/70 border-t border-white/10 mt-20">

            <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-3 gap-10">

                {/* Brand */}
                <div>
                    <h2 className="text-2xl font-black text-white mb-3">
                        TrendTracker Pro
                    </h2>

                    <p className="text-sm leading-6">
                        Elite market intelligence, credit-based memberships,
                        private WhatsApp signal groups.
                    </p>

                    {/* Social Icons */}
                    <div className="flex gap-4 mt-6">

                        {/* Instagram */}
                        <a
                            href="https://www.instagram.com/tredtrackerpro.net01?igsh=MTBzbWtucGk1YzBkeA=="
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition"
                            title="Instagram"
                        >
                            <svg
                                width="22"
                                height="22"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <rect x="2" y="2" width="20" height="20" rx="5" />
                                <circle cx="12" cy="12" r="4" />
                                <circle cx="17.5" cy="6.5" r="1" />
                            </svg>
                        </a>

                        {/* X */}
                        <a
                            href="https://x.com/Tredtrackerpro?s=20"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition"
                            title="X"
                        >
                            <svg
                                width="22"
                                height="22"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                            >
                                <path d="M18.244 2H21.55l-7.227 8.26L22.8 22h-6.607l-5.17-6.75L5.1 22H1.79l7.73-8.84L1.5 2h6.775l4.67 6.17L18.244 2z" />
                            </svg>
                        </a>

                        {/* WhatsApp */}
                        <a
                            href="https://chat.whatsapp.com/KV3VevGEylIAnrsh9YdyBp"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition"
                            title="WhatsApp"
                        >
                            <svg
                                width="22"
                                height="22"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                            >
                                <path d="M20.52 3.48A11.82 11.82 0 0 0 12.04 0C5.41 0 .02 5.39.02 12.02c0 2.12.56 4.19 1.62 6.02L0 24l6.13-1.61a11.97 11.97 0 0 0 5.89 1.51h.01c6.63 0 12.02-5.39 12.02-12.02 0-3.21-1.25-6.23-3.53-8.4zM12.03 21.84a9.82 9.82 0 0 1-4.99-1.36l-.36-.22-2.72.72.73-2.65-.23-.37A9.82 9.82 0 1 1 12.03 21.84z" />
                            </svg>
                        </a>

                        {/* Facebook */}
                        <a
                            href="https://www.facebook.com/share/1DHkpC1MWE/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition"
                            title="Facebook"
                        >
                            <svg
                                width="22"
                                height="22"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                            >
                                <path d="M14 8h3V4h-3c-3.31 0-6 2.69-6 6v3H5v4h3v7h4v-7h3l1-4h-4v-3c0-1.1.9-2 2-2z" />
                            </svg>
                        </a>

                    </div>
                </div>

                {/* Product */}
                <div>
                    <h3 className="text-white font-bold mb-4">
                        Product
                    </h3>

                    <ul className="space-y-3 text-sm">
                        <li>
                            <Link to="/plans" className="hover:text-white">
                                Plans
                            </Link>
                        </li>

                        <li>
                            <a href="#how" className="hover:text-white">
                                How it works
                            </a>
                        </li>

                        <li>
                            <a href="#faq" className="hover:text-white">
                                FAQ
                            </a>
                        </li>

                        <li>
                            <a href="#disclaimer" className="hover:text-white">
                                Disclaimer
                            </a>
                        </li>
                    </ul>
                </div>

                {/* Support & Company */}
                <div>
                    <h3 className="text-white font-bold mb-4">
                        Support
                    </h3>

                    <p className="text-sm">
                        +1 (609) 629-1212
                    </p>

                    <p className="text-sm mt-2">
                        info@trftechnologies.com
                    </p>

                    <p className="text-sm mt-2">
                        Princeton, New Jersey USA 08540
                    </p>

                    <div className="mt-8">
                        <h3 className="text-white font-bold mb-2">
                            Company
                        </h3>

                        <p className="text-sm">
                            TRF Technologies LLC
                        </p>
                    </div>
                </div>

            </div>

            {/* Bottom */}
            <div className="border-t border-white/10 py-5 text-center text-sm">
                © 2026 TrendTracker Pro
                <br />
                All rights reserved.
            </div>

        </footer>
    );
}