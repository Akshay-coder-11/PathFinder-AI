import { motion, AnimatePresence } from 'motion/react';
import { X, Cpu, Layout, Server, Database, Loader2 } from 'lucide-react';

interface SystemBlueprintModalProps {
  showDevHub: boolean;
  setShowDevHub: (show: boolean) => void;
  devHubData: any;
  devHubLoading: boolean;
  fetchDevHubData: () => void;
}

export default function SystemBlueprintModal({
  showDevHub,
  setShowDevHub,
  devHubData,
  devHubLoading,
  fetchDevHubData,
}: SystemBlueprintModalProps) {
  return (
    <AnimatePresence>
      {showDevHub && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-950/65 backdrop-blur-md p-4 sm:p-6 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
            className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 p-6 sm:p-8 relative space-y-6 text-slate-900 dark:text-white my-8 max-h-[90vh] overflow-y-auto"
          >
            <button
              onClick={() => setShowDevHub(false)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-amber-400 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
              title="Close Panel"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1.5 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-600 rounded-lg text-white">
                  <Cpu className="w-5 h-5" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight mt-0">System Blueprint & Database Panel</h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                Understand exactly which files and directories play the role of the <strong>Frontend (MERN interface)</strong>, the <strong>Backend (Express API Server)</strong>, and the <strong>Database/Admin storage environment</strong>.
              </p>
            </div>

            {/* Architecture Map Blocks */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* 1. FRONTEND BLOCK */}
              <div className="p-5 rounded-2xl border border-blue-100 dark:border-blue-950/40 bg-blue-50/30 dark:bg-blue-950/5 space-y-4">
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                  <Layout className="w-5 h-5 shrink-0" />
                  <span className="text-xs font-black uppercase tracking-widest font-sans">1. FRONTEND (Client UI)</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-300 leading-relaxed font-sans font-medium">
                  This is what you see in the browser. It compiles React code, maintains immediate page states, handles styling via Tailwind CSS, and uses Lucide for beautiful icons.
                </p>
                
                <div className="text-[11px] font-mono space-y-2 pt-1">
                  <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800/60">
                    <span className="text-emerald-500 font-bold font-sans">📄 /frontend/App.tsx</span>
                    <p className="text-[10px] text-slate-400 pt-0.5 font-sans leading-tight">Hosts the user assessment workflows, custom dark theme setups, roadmap milestones, and visual components.</p>
                  </div>
                  <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800/60">
                    <span className="text-emerald-500 font-bold font-sans">📄 /frontend/index.css</span>
                    <p className="text-[10px] text-slate-400 pt-0.5 font-sans leading-tight">Compiles active Tailwind utility properties and implements custom brand themes.</p>
                  </div>
                </div>
                <span className="inline-block text-[10px] bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 font-black px-2 mt-2 py-1 rounded-md uppercase tracking-wider font-sans">
                  Runs in: User's Browser
                </span>
              </div>

              {/* 2. BACKEND BLOCK */}
              <div className="p-5 rounded-2xl border border-indigo-100 dark:border-indigo-950/40 bg-indigo-50/30 dark:bg-indigo-950/5 space-y-4">
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                  <Server className="w-5 h-5 shrink-0" />
                  <span className="text-xs font-black uppercase tracking-widest font-sans">2. BACKEND (Express Server)</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-300 leading-relaxed font-sans font-medium">
                  A secure Node.js process. It runs on the server, exposes REST APIs, validates authentication requests, and safely proxies calls to Gemini AI without leaking API keys.
                </p>
                
                <div className="text-[11px] font-mono space-y-2 pt-1">
                  <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800/60">
                    <span className="text-indigo-500 font-bold font-sans">📄 /backend/server.ts</span>
                    <p className="text-[10px] text-slate-400 pt-0.5 font-sans leading-tight">Begins Express server at port 3000. Houses authentication controller, chat systems, and profiles.</p>
                  </div>
                  <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800/60">
                    <span className="text-indigo-500 font-bold font-sans">📄 /backend/auth.ts</span>
                    <p className="text-[10px] text-slate-400 pt-0.5 font-sans leading-tight">Generates JWT security credentials and implements user session middleware.</p>
                  </div>
                </div>
                <span className="inline-block text-[10px] bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 font-black px-2 mt-2 py-1 rounded-md uppercase tracking-wider font-sans">
                  Runs on: Cloud Run (NodeJS)
                </span>
              </div>

              {/* 3. DATABASE / ADMIN BLOCK */}
              <div className="p-5 rounded-2xl border border-emerald-100 dark:border-emerald-950/40 bg-emerald-50/30 dark:bg-emerald-950/5 space-y-4">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                  <Database className="w-5 h-5 shrink-0" />
                  <span className="text-xs font-black uppercase tracking-widest font-sans">3. STORAGE / DB (State)</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-300 leading-relaxed font-sans font-medium">
                  Ensures records generated by students (e.g., profiles, roadmaps, goals) are persisted securely across server reboots.
                </p>
                
                <div className="text-[11px] font-mono space-y-2 pt-1">
                  <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800/60">
                    <span className="text-emerald-600 font-bold font-sans">📄 /backend/db.ts</span>
                    <p className="text-[10px] text-slate-400 pt-0.5 font-sans leading-tight">Handles schema modeling. Automatically fails over to beautiful local file backup system databases if MongoDB link is absent.</p>
                  </div>
                  <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800/60">
                    <span className="text-emerald-600 font-bold font-sans">📁 /data/</span>
                    <p className="text-[10px] text-slate-400 pt-0.5 font-sans leading-tight">Local folder holding physical JSON document structure backups.</p>
                  </div>
                </div>
                <span className="inline-block text-[10px] bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-black px-2 mt-2 py-1 rounded-md uppercase tracking-wider font-sans">
                  Data Mode: JSON / MongoDB
                </span>
              </div>

            </div>

            {/* LIVE ADMIN PANEL / DATA VIEWER */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 flex items-center gap-1.5 uppercase tracking-wide mt-0">
                    🛡️ Real-Time Admin Console Statistics
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">Live query analytics aggregated straight from the backend database models.</p>
                </div>
                
                <button
                  onClick={fetchDevHubData}
                  disabled={devHubLoading}
                  className="px-4 py-2 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-xl text-xs font-bold font-sans flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
                >
                  {devHubLoading ? <Loader2 className="w-3 px-1 animate-spin" /> : "Refresh Analytics"}
                </button>
              </div>

              {devHubLoading ? (
                <div className="p-12 border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 rounded-2xl flex flex-col items-center justify-center text-center">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                  <p className="text-xs text-slate-400 mt-2 font-black uppercase tracking-wider">Fetching live database stats...</p>
                </div>
              ) : devHubData ? (
                <div className="space-y-4">
                  {/* Database metadata badges */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/25 space-y-1">
                      <span className="text-[10px] text-slate-400 uppercase tracking-widest font-black block">Storage System</span>
                      <span className="text-sm font-black text-blue-600 dark:text-blue-400">{devHubData.storageType}</span>
                    </div>
                    <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/25 space-y-1">
                      <span className="text-[10px] text-slate-400 uppercase tracking-widest font-black block">Registered Students</span>
                      <span className="text-sm font-black text-slate-800 dark:text-slate-100">{devHubData.users?.length || 0} Accounts</span>
                    </div>
                    <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/25 space-y-1">
                      <span className="text-[10px] text-slate-400 uppercase tracking-widest font-black block">Roadmaps Saved</span>
                      <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">{devHubData.totalRecommendations || 0} Generated</span>
                    </div>
                    <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-805 bg-slate-50/50 dark:bg-slate-950/25 space-y-1">
                      <span className="text-[10px] text-slate-400 uppercase tracking-widest font-black block">Server Health</span>
                      <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 font-sans">Active - {devHubData.serverUptimeHours || "0.00"} Hrs</span>
                    </div>
                  </div>

                  {/* Active Registered Users Table inside DB */}
                  <div className="border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50/20 dark:bg-slate-950/10">
                    <div className="px-5 py-3 bg-slate-150 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-705 flex justify-between items-center">
                      <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        👤 Registered Students in Database
                      </span>
                      <span className="text-[10px] px-2 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full font-bold font-sans">
                        Total database entries: {devHubData.users?.length || 0}
                      </span>
                    </div>
                    
                    <div className="p-2 max-h-[180px] overflow-y-auto space-y-1.5 font-sans">
                      {devHubData.users && devHubData.users.length > 0 ? (
                        devHubData.users.map((u: any, idx: number) => (
                          <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80 hover:border-slate-200 dark:hover:border-slate-700 transition-all text-xs">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-slate-105 dark:bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-500 font-mono">
                                {idx + 1}
                              </span>
                              <div>
                                <span className="font-bold text-slate-800 dark:text-slate-100">{u.name}</span>
                                <span className="text-[10px] text-slate-400 block sm:inline sm:ml-2">({u.email})</span>
                              </div>
                            </div>
                            <span className="text-[10px] text-slate-400 block mt-1 sm:mt-0 italic font-mono uppercase bg-slate-50 dark:bg-slate-900 px-2 py-0.5 rounded-md border border-slate-150 dark:border-slate-800/50">
                              DB_ENTRY_VERIFIED
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="py-8 text-center text-slate-400 text-xs">
                          No registered accounts inside the database storage yet. Sign up using the register button in the navigation bar!
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 text-center py-6">Unable to retrieve system diagnostic data.</p>
              )}
            </div>

            {/* Close Button at bottom */}
            <div className="flex justify-end border-t border-slate-100 dark:border-slate-800 pt-5">
              <button
                onClick={() => setShowDevHub(false)}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold font-sans cursor-pointer transition-colors shadow-lg shadow-blue-500/15"
              >
                Awesome, I Understand!
              </button>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
