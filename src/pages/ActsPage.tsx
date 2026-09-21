import React from "react";
import {
  BookOpen,
  Scale,
  Building2,
  ExternalLink,
  ShieldCheck,
  Landmark,
  CheckCircle2,
  Leaf,
  Recycle,
  AlertTriangle,
  Info,
  Globe,
  FileText,
} from "lucide-react";
import { ViewState } from "../types";

interface ActsPageProps {
  onNavigate: (view: ViewState) => void;
}

interface GovernmentResource {
  id: string;
  title: string;
  authority: string;
  badge: string;
  description: string;
  url: string;
  buttonLabel: string;
  icon: React.ReactNode;
}

const GOVERNMENT_RESOURCES: GovernmentResource[] = [
  {
    id: "swm-rules",
    title: "Solid Waste Management Rules, 2016",
    authority: "Ministry of Environment, Forest and Climate Change & CPCB",
    badge: "National Statutory Framework",
    description:
      "India's central rules governing municipal solid waste management, notified under the Environment (Protection) Act, 1986. They mandate source segregation into wet, dry, and domestic hazardous streams, prohibit open dumping and burning of refuse, and define statutory responsibilities for waste generators and urban local bodies.",
    url: "https://cpcb.gov.in/waste-management-rules/",
    buttonLabel: "Read Official Rules",
    icon: <Scale className="w-5 h-5 text-emerald-400" />,
  },
  {
    id: "moefcc",
    title: "Ministry of Environment, Forest and Climate Change (MoEFCC)",
    authority: "Government of India",
    badge: "Central Ministry",
    description:
      "The nodal central government ministry responsible for the planning, promotion, coordination, and oversight of environmental policy, biodiversity protection, forestry, and national waste management regulations across India.",
    url: "https://moef.gov.in/",
    buttonLabel: "Visit Official Website",
    icon: <Landmark className="w-5 h-5 text-emerald-400" />,
  },
  {
    id: "cpcb",
    title: "Central Pollution Control Board (CPCB)",
    authority: "Statutory Organization under MoEFCC",
    badge: "Technical & Regulatory Board",
    description:
      "India's apex statutory organization for environmental monitoring, pollution control, and technical guidance. CPCB publishes standards, technical directives, and monitoring frameworks for scientific solid and plastic waste management.",
    url: "https://cpcb.gov.in/",
    buttonLabel: "Visit CPCB",
    icon: <Building2 className="w-5 h-5 text-teal-400" />,
  },
  {
    id: "sbm-urban",
    title: "Swachh Bharat Mission – Urban",
    authority: "Ministry of Housing and Urban Affairs (MoHUA)",
    badge: "National Urban Mission",
    description:
      "India's flagship urban cleanliness and sanitation initiative. Learn about nationwide initiatives dedicated to achieving 'Garbage Free Cities', 100% scientific solid-waste processing, door-to-door segregated collection, and remediation of legacy dumpsites.",
    url: "https://swachhbharaturban.gov.in/",
    buttonLabel: "Visit Official Platform",
    icon: <Globe className="w-5 h-5 text-emerald-400" />,
  },
  {
    id: "ccmc",
    title: "Coimbatore City Municipal Corporation (CCMC)",
    authority: "Local Urban Governing Body — Coimbatore, Tamil Nadu",
    badge: "Local Municipal Authority",
    description:
      "The urban local authority governing Coimbatore. Access official municipal information, civic sanitation schedules, door-to-door waste collection services, and municipal grievance redressal resources dedicated to maintaining clean urban wards.",
    url: "https://www.ccmc.gov.in/",
    buttonLabel: "Visit CCMC Website",
    icon: <Building2 className="w-5 h-5 text-teal-300" />,
  },
];

export const ActsPage: React.FC<ActsPageProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-16">
      {/* Page Header */}
      <div className="space-y-2 border-b border-emerald-900/40 pb-5">
        <div className="inline-flex items-center gap-2 text-xs font-mono uppercase text-emerald-400 font-semibold tracking-wider">
          <BookOpen className="w-4 h-4" />
          <span>Statutory Framework & Verified Government Portals</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
          Acts & Waste Rules
        </h1>
        <p className="text-xs sm:text-sm text-emerald-300/80 max-w-3xl leading-relaxed">
          Learn about India's official waste-management rules, responsibilities, and government resources.
        </p>
      </div>

      {/* Official Government Source Verification Advisory */}
      <div className="rounded-2xl border border-emerald-800/60 bg-[#071911]/90 p-4 sm:p-5 flex items-start gap-3.5 text-xs text-emerald-200/90 leading-relaxed shadow-sm">
        <Info className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="text-white block font-semibold">
            Verified Official Portals:
          </strong>
          <span>
            Every resource listed below connects directly to official Indian government web platforms (`.gov.in` / `.nic.in`) and statutory municipal bodies. All links open securely in a new browser tab.
          </span>
        </div>
      </div>

      {/* SECTION: 5 SEPARATED GOVERNMENT RESOURCE CARDS */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs font-mono uppercase text-emerald-400 font-bold tracking-wider">
          <FileText className="w-4 h-4" />
          <span>Official National & Municipal Resources</span>
        </div>

        <div className="grid grid-cols-1 gap-5">
          {GOVERNMENT_RESOURCES.map((resource) => (
            <div
              key={resource.id}
              className="rounded-2xl border border-emerald-900/50 bg-[#07160f]/85 p-6 sm:p-7 space-y-4 hover:border-emerald-700/60 transition shadow-lg flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-800/50 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      {resource.icon}
                    </div>
                    <div>
                      <span className="text-[11px] font-mono text-emerald-400 font-semibold block">
                        {resource.authority}
                      </span>
                      <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                        {resource.title}
                      </h2>
                    </div>
                  </div>

                  <span className="self-start sm:self-auto px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-950/90 text-emerald-300 border border-emerald-800/60">
                    {resource.badge}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-emerald-200/80 leading-relaxed pt-1">
                  {resource.description}
                </p>
              </div>

              <div className="pt-3 border-t border-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="text-[11px] font-mono text-emerald-500/70 truncate max-w-md">
                  Official Portal: <span className="text-emerald-400/90">{resource.url}</span>
                </span>

                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2 transition active:scale-95 shrink-0 self-start sm:self-auto"
                >
                  <span>{resource.buttonLabel}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 6: WASTE SEGREGATION & CITIZEN RESPONSIBILITY */}
      <section className="rounded-2xl border border-emerald-900/50 bg-[#07160f]/85 p-6 sm:p-8 space-y-6 shadow-lg">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase text-emerald-400 font-bold tracking-wider">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Civic Awareness Guide</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Waste Segregation & Citizen Responsibility
          </h2>
          <p className="text-xs sm:text-sm text-emerald-300/80 leading-relaxed max-w-3xl">
            Responsible municipal waste management starts at the household and community level. Under the <em>Solid Waste Management Rules, 2016</em>, every waste generator is encouraged to separate waste at source into three distinct streams before handover.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 1. Wet / Biodegradable */}
          <div className="p-5 rounded-xl bg-[#061d13] border border-emerald-800/60 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Leaf className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-mono font-bold text-emerald-300 uppercase tracking-wider">
                  Wet / Biodegradable Waste
                </h3>
              </div>
              <p className="text-xs text-emerald-200/80 leading-relaxed">
                Organic matter that decomposes naturally over time.
              </p>
              <ul className="text-xs text-emerald-200/70 space-y-1 pl-4 list-disc">
                <li>Kitchen food leftovers & vegetable peels</li>
                <li>Fruit waste, egg shells & tea grounds</li>
                <li>Garden leaves, grass clippings & flowers</li>
              </ul>
            </div>
            <div className="text-[11px] font-mono text-emerald-400/90 pt-2 border-t border-emerald-900/60">
              Hand over daily for municipal composting & bio-methanation.
            </div>
          </div>

          {/* 2. Dry / Recyclable */}
          <div className="p-5 rounded-xl bg-[#071a24] border border-teal-800/60 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-teal-500/20 flex items-center justify-center text-teal-400">
                  <Recycle className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-mono font-bold text-teal-300 uppercase tracking-wider">
                  Dry / Recyclable Waste
                </h3>
              </div>
              <p className="text-xs text-teal-200/80 leading-relaxed">
                Clean, non-biodegradable items that can be recycled or processed.
              </p>
              <ul className="text-xs text-teal-200/70 space-y-1 pl-4 list-disc">
                <li>Paper, newspapers, magazines & books</li>
                <li>Cardboard cartons & packaging boxes</li>
                <li>Plastics (bottles, containers, covers)</li>
                <li>Glass bottles & tin/aluminum cans</li>
              </ul>
            </div>
            <div className="text-[11px] font-mono text-teal-400/90 pt-2 border-t border-teal-900/60">
              Keep clean and dry for Material Recovery Facilities (MRFs).
            </div>
          </div>

          {/* 3. Domestic Hazardous */}
          <div className="p-5 rounded-xl bg-[#1d1215] border border-red-900/60 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-red-500/20 flex items-center justify-center text-red-400">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-mono font-bold text-red-300 uppercase tracking-wider">
                  Domestic Hazardous Waste
                </h3>
              </div>
              <p className="text-xs text-red-200/80 leading-relaxed">
                Items requiring careful isolation and specialized safe disposal.
              </p>
              <ul className="text-xs text-red-200/70 space-y-1 pl-4 list-disc">
                <li>Expired medicines & chemical bottles</li>
                <li>Used batteries & electronic peripherals</li>
                <li>Discarded paint cans, solvent & pesticide containers</li>
                <li>Sanitary pads & diapers (wrapped separately)</li>
              </ul>
            </div>
            <div className="text-[11px] font-mono text-red-400/90 pt-2 border-t border-red-950">
              Wrap securely and deposit into hazardous waste collection.
            </div>
          </div>
        </div>

        {/* Educational Disclaimer (Mandatory) */}
        <div className="p-3.5 rounded-xl bg-black/40 border border-emerald-950 text-xs text-emerald-400/70 leading-relaxed flex items-start gap-2">
          <Info className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
          <span>
            <em>Educational Disclaimer:</em> This summary is provided solely for civic literacy and community awareness. It does not constitute formal legal counsel or an exhaustive statutory briefing. For full legislative texts and binding municipal bye-laws, please consult the official Government of India and CCMC resources linked above.
          </span>
        </div>
      </section>

      {/* Bottom CTA to Report Open-Area Waste */}
      <div className="p-6 rounded-2xl border border-emerald-800/60 bg-gradient-to-r from-emerald-950/60 via-[#0a1e14] to-[#071810] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-base font-bold text-white">
            Observed open-area garbage accumulation?
          </h3>
          <p className="text-xs text-emerald-300/70">
            Submit photographic evidence, verify coordinates, and alert municipal authorities via CleanWatch AI.
          </p>
        </div>

        <button
          id="acts-report-incident-btn"
          type="button"
          onClick={() => onNavigate("report-waste")}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold rounded-xl transition shadow-[0_0_15px_rgba(16,185,129,0.3)] shrink-0"
        >
          Report an Incident Now
        </button>
      </div>
    </div>
  );
};
