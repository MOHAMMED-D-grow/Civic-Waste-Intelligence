import React from "react";
import { ShieldCheck, Phone, MessageCircle, ExternalLink, Heart } from "lucide-react";
import { ViewState } from "../types";

interface FooterProps {
  onNavigate: (view: ViewState) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="border-t border-emerald-900/40 bg-[#040a06] text-xs text-emerald-500/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand & Mission */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <span className="font-mono font-bold text-white text-sm tracking-tight">
                CLEANWATCH<span className="text-emerald-400"> AI</span>
              </span>
            </div>
            <p className="text-xs text-emerald-400/60 max-w-sm leading-relaxed">
              AI-Powered Open-Area Waste Detection & Smart Civic Reporting. Designed to facilitate evidence-based reporting to municipal sanitation and public health authorities.
            </p>
            <div className="text-[11px] text-emerald-500/50 font-mono">
              Coimbatore City Municipal Corporation (CCMC) Civic Framework
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div className="space-y-2">
            <div className="text-xs font-mono uppercase tracking-wider text-emerald-300 font-semibold">
              Navigation
            </div>
            <ul className="space-y-1.5 text-xs text-emerald-400/80">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate("dashboard")}
                  className="hover:text-emerald-200 transition"
                >
                  Dashboard Overview
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate("report-waste")}
                  className="hover:text-emerald-200 transition"
                >
                  Report Open-Area Waste
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate("reports")}
                  className="hover:text-emerald-200 transition"
                >
                  Saved Incident Reports
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate("acts")}
                  className="hover:text-emerald-200 transition"
                >
                  Acts & Waste Rules
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Official Helplines */}
          <div className="space-y-2">
            <div className="text-xs font-mono uppercase tracking-wider text-emerald-300 font-semibold">
              Municipal Contacts
            </div>
            <div className="space-y-1.5 text-xs text-emerald-400/80">
              <a
                href="https://wa.me/918190000200"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 hover:text-emerald-200 transition"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>CCMC WhatsApp: 8190000200</span>
              </a>
              <a
                href="tel:04222390261"
                className="flex items-center gap-1.5 hover:text-emerald-200 transition"
              >
                <Phone className="w-3.5 h-3.5 text-teal-400" />
                <span>Main: 0422-2390261</span>
              </a>
              <a
                href="tel:04222390262"
                className="flex items-center gap-1.5 hover:text-emerald-200 transition"
              >
                <Phone className="w-3.5 h-3.5 text-teal-400" />
                <span>Health Desk: 0422-2390262</span>
              </a>
              <a
                href="tel:04222390263"
                className="flex items-center gap-1.5 hover:text-emerald-200 transition"
              >
                <Phone className="w-3.5 h-3.5 text-teal-400" />
                <span>Control Room: 0422-2390263</span>
              </a>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-emerald-950/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]">
          <div>
            &copy; {new Date().getFullYear()} CleanWatch AI &bull; Civic Environmental Intelligence
          </div>
          <div className="text-emerald-500/50">
            OpenStreetMap Contributors &bull; Solid Waste Management Rules 2016
          </div>
        </div>
      </div>
    </footer>
  );
};
