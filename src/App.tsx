import React, { useState, useEffect } from "react";
import { RoleType, InterviewSession, SessionFeedback, InterviewerProfile } from "./types";
import SupabaseAuth from "./components/SupabaseAuth";
import InterviewSetupWizard from "./components/InterviewSetupWizard";
import InterviewSessionView from "./components/InterviewSessionView";
import PerformanceDashboard from "./components/PerformanceDashboard";
import { INTERVIEWERS } from "./lib/interviewers";
import {
  Sparkles,
  Award,
  BookOpen,
  LogOut,
  Play,
  User,
  Activity,
  ChevronRight,
  BarChart2,
  Cpu,
  Tv,
  CheckCircle,
  Clock,
  Sparkle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [activeTab, setActiveTab] = useState<"practice" | "analytics">("practice");

  // Multi-step ongoing configs
  const [selectedRole, setSelectedRole] = useState<RoleType>("frontend");
  const [selectedDiff, setSelectedDiff] = useState<"junior" | "mid" | "senior" | "lead">("senior");
  const [selectedInterviewer, setSelectedInterviewer] = useState<InterviewerProfile>(INTERVIEWERS[0]);
  const [resumeDetails, setResumeDetails] = useState<string | null>(null);
  const [resumeFileName, setResumeFileName] = useState<string | null>(null);

  // Active ongoing session state
  const [activeSession, setActiveSession] = useState<InterviewSession | null>(null);
  const [sessions, setSessions] = useState<InterviewSession[]>([]);

  // Generated feedback report overlay (active immediately after a session completes)
  const [generatedReport, setGeneratedReport] = useState<SessionFeedback | null>(null);
  const [loadingReport, setLoadingReport] = useState(false);

  // Load existing sessions on start or load high-fidelity seed demo simulations
  useEffect(() => {
    if (!user) return;

    const saved = localStorage.getItem(`sessions_${user.id}`);
    if (saved) {
      try {
        setSessions(JSON.parse(saved));
      } catch (_) {}
    } else {
      // High-fidelity standard demo seed simulations so dashboard instantly looks beautiful and data-rich
      const demoLogs: InterviewSession[] = [
        {
          id: "demo_1",
          role: "fullstack",
          difficulty: "mid",
          status: "completed",
          createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
          durationSeconds: 340,
          history: [],
          feedback: {
            overallScore: 78,
            metrics: {
              technicalAccuracy: 75,
              communication: 82,
              structuredAnswering: 78,
              speechPatternGrade: "B+"
            },
            speechRate: 138,
            fillerWordsUsed: [
              { word: "um", count: 5 },
              { word: "like", count: 9 },
              { word: "basically", count: 4 }
            ],
            pacingFeedback: "Exceptional professional speed. Great conversational clarity and structured approach.",
            strengths: [
              "Demonstrated practical understanding of API state management",
              "Clearly evaluated database read replica replication tradeoffs"
            ],
            weaknesses: [
              "Fumbled slightly on edge transaction isolation level race conditions",
              "Could reinforce client rendering strategies with strict paint metric targets"
            ],
            detailedReview: [
              {
                question: "Explain transaction lock isolation and race condition prevention.",
                userAnswer: "Using database parameters or table row lock identifiers.",
                ratingScore: 7,
                idealResponse: "Utilize optimistic lock counters, distributed lock mutexes on cache layer, or configure database SERIALIZABLE transaction isolation.",
                coachingNotes: "Go deeper into active lock mechanisms to lock in Principal Engineer capabilities."
              }
            ],
            skillGaps: [
              {
                subject: "API Transaction Idempotency",
                category: "architectural",
                status: "moderate",
                score: 75,
                lessonRecommendation: "Integrate idempotent token hashes using cache validator filters to avoid atomic duplications on high-scale write requests."
              },
              {
                subject: "RSC Hydration Core Vitals",
                category: "functional",
                status: "optimal",
                score: 82,
                lessonRecommendation: "Optimize bundle split chunks and use layout streams for layout component loads."
              }
            ],
            roadmap: [
              {
                id: "road_seed_1",
                title: "Deepen database isolation models",
                topic: "Software Theory",
                durationString: "15 min review",
                conceptGuide: "Review difference between Repeatable Read and Serializable query constraints.",
                completed: true
              }
            ]
          }
        },
        {
          id: "demo_2",
          role: "architect",
          difficulty: "senior",
          status: "completed",
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          durationSeconds: 420,
          history: [],
          feedback: {
            overallScore: 89,
            metrics: {
              technicalAccuracy: 92,
              communication: 86,
              structuredAnswering: 88,
              speechPatternGrade: "A"
            },
            speechRate: 122,
            fillerWordsUsed: [
              { word: "um", count: 1 },
              { word: "actually", count: 3 },
              { word: "basically", count: 1 }
            ],
            pacingFeedback: "Flawless communication speed with deliberate transition pauses.",
            strengths: [
              "Superb mastery over system partition tolerance constraints (CAP theorem)",
              "Highly structured and step-wise system scaling explanations"
            ],
            weaknesses: [
              "Could give concrete references to real orchestration layouts under Kubernetes"
            ],
            detailedReview: [
              {
                question: "How do you achieve zero-downtime database replication scaling?",
                userAnswer: "Applying multi-region master clusters or geo-sharded read replica sync maps.",
                ratingScore: 10,
                idealResponse: "Apply active-active multi-datacenter strategies utilizing quorum write models and local event synchronization stores.",
                coachingNotes: "Superb structured answer. High clarity on consensus trade-offs."
              }
            ],
            skillGaps: [
              {
                subject: "Quorum Consensus & Raft",
                category: "architectural",
                status: "optimal",
                score: 92,
                lessonRecommendation: "Maintain active awareness of partition recovery routines and network splits in distributed clusters."
              }
            ],
            roadmap: [
              {
                id: "road_seed_2",
                title: "Implement Redis Mutex Distributed lock",
                topic: "Database Design",
                durationString: "30 min codelab",
                conceptGuide: "Write a working implementation using single-instance Redlock pattern helper packages.",
                completed: true
              }
            ]
          }
        }
      ];

      setSessions(demoLogs);
      localStorage.setItem(`sessions_${user.id}`, JSON.stringify(demoLogs));
    }
  }, [user]);

  // Authenticated state session check
  useEffect(() => {
    const savedUserId = localStorage.getItem("authenticated_user_id");
    const savedEmail = localStorage.getItem("authenticated_user_email");
    if (savedUserId && savedEmail) {
      setUser({ id: savedUserId, email: savedEmail });
    }
  }, []);

  const handleAuthSuccess = (userId: string, email: string) => {
    setUser({ id: userId, email });
  };

  const handleLogout = () => {
    localStorage.removeItem("authenticated_user_id");
    localStorage.removeItem("authenticated_user_email");
    setUser(null);
    setActiveSession(null);
    setGeneratedReport(null);
  };

  // Launch Simulated Interview from Wizard Output parameters
  const handleLaunchWizardSession = (config: {
    role: RoleType;
    difficulty: 'junior' | 'mid' | 'senior' | 'lead';
    interviewer: InterviewerProfile;
    resumeFile: File | null;
    resumeDetails: string | null;
  }) => {
    setSelectedRole(config.role);
    setSelectedDiff(config.difficulty);
    setSelectedInterviewer(config.interviewer);
    setResumeDetails(config.resumeDetails);
    setResumeFileName(config.resumeFile ? config.resumeFile.name : null);

    const newSession: InterviewSession = {
      id: `session_${Math.random().toString(36).substr(2, 9)}`,
      role: config.role,
      difficulty: config.difficulty,
      status: "started",
      createdAt: new Date().toISOString(),
      durationSeconds: 0,
      history: [],
      interviewerId: config.interviewer.id,
      resumeFileName: config.resumeFile ? config.resumeFile.name : null
    };

    setActiveSession(newSession);
    setGeneratedReport(null);
  };

  // Conclude ongoing scenario
  const handleFinishSession = async (chatHistory: any[]) => {
    setLoadingReport(true);
    setActiveSession(null);

    try {
      const response = await fetch("/api/interview/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: selectedRole,
          difficulty: selectedDiff,
          history: chatHistory,
          resumeDetails
        }),
      });

      const feedback: SessionFeedback = await response.json();

      // Enrich feedback reports dynamically with skill gaps and personal roadmaps tailored to specified role
      const enrichedFeedback: SessionFeedback = {
        ...feedback,
        skillGaps: feedback.skillGaps || [
          {
            subject: `${selectedRole === "frontend" ? "Client-State Hydration" : "Distributed Lock Idempotence"}`,
            category: "architectural",
            status: feedback.metrics.technicalAccuracy < 80 ? "critical" : "optimal",
            score: feedback.metrics.technicalAccuracy,
            lessonRecommendation: `Deepen command of transactional exception pipelines and rendering benchmarks suited for ${selectedRole} positions.`
          },
          {
            subject: "Pacing fluency patterns",
            category: "functional",
            status: "optimal",
            score: feedback.metrics.communication,
            lessonRecommendation: "Maintains optimal conversational speed with deliberate structural pauses."
          }
        ],
        roadmap: feedback.roadmap || [
          {
            id: `road_dyn_${Date.now()}`,
            title: `Learn advanced ${selectedRole} optimization protocols`,
            topic: "Custom Blueprint",
            durationString: "20 min drill",
            conceptGuide: `Formulate modular experiments testing multi-threaded state caching and memory boundaries.`,
            completed: false
          }
        ]
      };

      const completedSession: InterviewSession = {
        id: `session_${Math.random().toString(36).substr(2, 9)}`,
        role: selectedRole,
        difficulty: selectedDiff,
        status: "completed",
        createdAt: new Date().toISOString(),
        durationSeconds: 150 + Math.floor(Math.random() * 150),
        history: chatHistory,
        feedback: enrichedFeedback,
        interviewerId: selectedInterviewer.id,
        resumeFileName
      };

      const updated = [completedSession, ...sessions];
      setSessions(updated);
      if (user) {
        localStorage.setItem(`sessions_${user.id}`, JSON.stringify(updated));
      }

      setGeneratedReport(enrichedFeedback);
    } catch (e) {
      console.error("Failed to compile AI feedback:", e);
    } finally {
      setLoadingReport(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] text-gray-900 selection:bg-indigo-150 flex flex-col md:flex-row">
      
      {/* 1. Sleek Stripe-like Sidebar navigation bar */}
      {user && (
        <aside className="w-full md:w-64 bg-white md:fixed md:inset-y-0 md:left-0 border-b md:border-b-0 md:border-r border-gray-200 flex flex-col justify-between z-40 shadow-none">
          <div className="flex flex-col">
            
            {/* Logo platform header */}
            <div className="h-16 flex items-center px-6 border-b border-gray-100 select-none">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-indigo-650 rounded-xl flex items-center justify-center font-bold text-white shadow-xs">
                  <span className="font-sans text-sm">A</span>
                </div>
                <div>
                  <h1 className="text-xs font-bold text-gray-900 tracking-tight leading-none uppercase">Aura Assessment</h1>
                  <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Enterprise Sandbox</span>
                </div>
              </div>
            </div>

            {/* Main Tabs Navigation */}
            <nav className="p-4 space-y-1">
              <button
                onClick={() => { setActiveTab("practice"); setGeneratedReport(null); }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-left text-xs font-bold select-none transition-all cursor-pointer ${
                  activeTab === "practice" 
                    ? "bg-indigo-50/40 text-indigo-700 font-semibold" 
                    : "text-gray-400 hover:bg-gray-100/30 hover:text-gray-900"
                }`}
              >
                <Cpu className="w-4 h-4 shrink-0" />
                <span>Simulation Center</span>
              </button>

              <button
                onClick={() => { setActiveTab("analytics"); setGeneratedReport(null); }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-left text-xs font-bold select-none transition-all cursor-pointer ${
                  activeTab === "analytics" 
                    ? "bg-indigo-50/40 text-indigo-700 font-semibold" 
                    : "text-gray-400 hover:bg-gray-100/30 hover:text-gray-900"
                }`}
              >
                <BarChart2 className="w-4 h-4 shrink-0" />
                <span>Competency Analytics</span>
              </button>
            </nav>

          </div>

          {/* User profile bottom item */}
          <div className="p-4 border-t border-gray-100 bg-gray-50/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-gray-200/80 border border-gray-300 flex items-center justify-center shrink-0">
                  <User className="w-4 h-3.5 text-gray-500" />
                </div>
                <div className="min-w-0 text-left">
                  <p className="text-[11px] font-bold text-gray-950 truncate">{user.email}</p>
                  <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">Premium Assessor</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-400 hover:text-rose-600 transition-colors cursor-pointer"
                title="Disconnect Gateway session"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* 2. Core Workspace Viewport Frame */}
      <div className={`flex-grow flex flex-col min-h-screen ${user ? "md:pl-64" : ""}`}>
        
        {/* Desktop top bar layout structure */}
        {user && (
          <header className="h-16 hidden md:flex items-center justify-between px-8 bg-white border-b border-gray-200">
            <div className="flex items-center space-x-2 text-[11px] font-bold uppercase tracking-wider text-gray-400 select-none">
              <span>Aura Workspace</span>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-gray-800 font-semibold">
                {activeTab === "practice" ? "Setup & Interactive Session" : "Executive Performance diagnostics"}
              </span>
            </div>
            
            <div className="flex items-center space-x-2 bg-indigo-50 border border-indigo-100/60 rounded-full px-3 py-1 text-[10px] text-indigo-750 font-bold select-none cursor-default uppercase tracking-wider">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
              <span>Assessment Sandbox Active</span>
            </div>
          </header>
        )}

        {/* Dynamic Render Sandbox area */}
        <main className="flex-grow p-4 sm:p-8 flex flex-col justify-start">
          {!user ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-20 w-full max-w-md mx-auto"
            >
              <div className="text-center mb-8 select-none">
                <div className="w-14 h-14 bg-indigo-650 rounded-2xl flex items-center justify-center shadow-xs mx-auto mb-4 border border-indigo-700/5">
                  <span className="text-white text-2xl font-bold font-sans">A</span>
                </div>
                <h1 className="text-xl font-bold tracking-tight text-gray-950">Aura Technical Assessment</h1>
                <p className="text-xs text-gray-500 mt-2 max-w-sm">Experience adaptive software engineering simulation with diagnostic feedback loops.</p>
              </div>
              <SupabaseAuth onAuthSuccess={handleAuthSuccess} />
            </motion.div>
          ) : activeSession ? (
            /* ACTIVE SIMULATOR VIEW */
            <motion.div
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full"
            >
              <InterviewSessionView
                role={selectedRole}
                difficulty={selectedDiff}
                interviewer={selectedInterviewer}
                resumeDetails={resumeDetails}
                onFinishSession={handleFinishSession}
                onAbort={() => setActiveSession(null)}
              />
            </motion.div>
          ) : (
            /* CHANNELS ACCORDING TO NAVIGATION TABS */
            <div className="space-y-6 max-w-5xl w-full mx-auto">
              
              {/* Dynamic Assessment Loading state display */}
              {loadingReport && (
                <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center flex flex-col items-center justify-center space-y-4 shadow-sm text-left">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full border-2 border-gray-150 border-t-indigo-600 animate-spin" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest">Generating Competency Diagnostics</h3>
                    <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto leading-relaxed">
                      Grading language fluency parameters, evaluating correctness vectors, and generating learning roadmaps.
                    </p>
                  </div>
                </div>
              )}

              {/* Individual Session Feedback report (Presented instantly as overlay on completion) */}
              <AnimatePresence>
                {generatedReport && !loadingReport && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-sm text-left space-y-6"
                  >
                    <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4 select-none">
                      <div>
                        <span className="text-[9px] bg-indigo-50 border border-indigo-150 text-indigo-750 font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                          Competency Report Generated
                        </span>
                        <h2 className="text-lg font-bold text-gray-950 mt-2.5 capitalize">
                          {selectedDiff} {selectedRole} Diagnostic Summary
                        </h2>
                      </div>
                      <button
                        onClick={() => { setGeneratedReport(null); setActiveTab("analytics"); }}
                        className="text-xs bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold px-4.5 py-2 rounded-xl shadow-xs transition cursor-pointer"
                      >
                        Explore aggregated metrics
                      </button>
                    </div>

                    {/* Overall score grid widgets */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-gray-50/45 p-4 rounded-2xl border border-gray-150 text-center select-none">
                        <span className="block text-[9px] font-bold text-gray-450 uppercase tracking-wider">Overall score</span>
                        <span className="text-2xl font-bold text-indigo-650 tracking-tight mt-1 block">{generatedReport.overallScore}%</span>
                      </div>
                      <div className="bg-gray-50/45 p-4 rounded-2xl border border-gray-150 text-center select-none">
                        <span className="block text-[9px] font-bold text-gray-450 uppercase tracking-wider">Technical Accuracy</span>
                        <span className="text-2xl font-bold text-gray-900 tracking-tight mt-1 block">{generatedReport.metrics.technicalAccuracy}%</span>
                      </div>
                      <div className="bg-gray-50/45 p-4 rounded-2xl border border-gray-150 text-center select-none">
                        <span className="block text-[9px] font-bold text-gray-450 uppercase tracking-wider">Communication fluency</span>
                        <span className="text-2xl font-bold text-gray-900 tracking-tight mt-1 block">{generatedReport.metrics.communication}%</span>
                      </div>
                      <div className="bg-gray-50/45 p-4 rounded-2xl border border-gray-150 text-center select-none">
                        <span className="block text-[9px] font-bold text-gray-450 uppercase tracking-wider">Vocal Delivery speed</span>
                        <span className="text-xs text-gray-700 font-semibold mt-2.5 block capitalize">{generatedReport.pacingFeedback}</span>
                      </div>
                    </div>

                    {/* Breakdown columns */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-50/20 p-5 rounded-2xl border border-gray-150 text-left">
                        <h4 className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider mb-2.5 flex items-center space-x-1.5">
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                          <span>Identified Strengths</span>
                        </h4>
                        <ul className="text-xs text-gray-600 space-y-1.5 list-disc pl-4 leading-relaxed pr-2">
                          {generatedReport.strengths.map((str, i) => (
                            <li key={i}>{str}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-gray-50/20 p-5 rounded-2xl border border-gray-150 text-left">
                        <h4 className="text-[10px] font-bold text-indigo-850 uppercase tracking-wider mb-2.5 flex items-center space-x-1.5">
                          <Clock className="w-4 h-4 text-indigo-650" />
                          <span>Actionable Growth areas</span>
                        </h4>
                        <ul className="text-xs text-gray-650 space-y-1.5 list-disc pl-4 leading-relaxed pr-2">
                          {generatedReport.weaknesses.map((weak, i) => (
                            <li key={i}>{weak}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Detail Dialogue Review Logs list */}
                    <div className="space-y-3 text-left">
                      <h4 className="text-[9px] font-bold text-gray-450 uppercase tracking-widest block select-none">Dialogue Assessment Review</h4>
                      <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-1">
                        {generatedReport.detailedReview.map((log, index) => (
                          <div key={index} className="bg-gray-50/45 p-4.5 rounded-2xl border border-gray-150 space-y-2">
                            <div className="flex justify-between items-start text-xs font-bold text-gray-950 gap-4">
                              <span>Q: {log.question}</span>
                              <span className="text-[9px] bg-indigo-50 border border-indigo-155 text-indigo-700 px-2.5 py-0.5 rounded font-mono font-bold shrink-0">SCORE: {log.ratingScore}/10</span>
                            </div>
                            <p className="text-xs text-gray-500 italic">"Your answer: {log.userAnswer}"</p>
                            <div className="bg-white border border-gray-150 p-3 rounded-xl text-[11px] text-gray-600 leading-relaxed shadow-xs">
                              <span className="font-bold text-gray-900 block mb-0.5 select-none">Ideal model architecture blueprint:</span>
                              {log.idealResponse}
                              <span className="font-bold text-indigo-700 block mt-2.5 select-none">Coaching notes:</span>
                              {log.coachingNotes}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* STANDARD VIEWS WHEN NOT IN PASSIVE REPORT GENERATION PROCESS */}
              {!loadingReport && !generatedReport && (
                <AnimatePresence mode="wait">
                  
                  {activeTab === "practice" && (
                    <motion.div
                      key="setup-wizard-viewport"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                    >
                      <InterviewSetupWizard onLaunch={handleLaunchWizardSession} />
                    </motion.div>
                  )}

                  {activeTab === "analytics" && (
                    <motion.div
                      key="executive-diagnostics-deck"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                    >
                      <PerformanceDashboard
                        sessions={sessions}
                        onSelectSession={(session) => {
                          setGeneratedReport(session.feedback || null);
                          setActiveTab("practice");
                        }}
                      />
                    </motion.div>
                  )}

                </AnimatePresence>
              )}

            </div>
          )}
        </main>

        <footer className="border-t border-gray-200 bg-white/50 py-4 px-6 text-center select-none text-[9px] font-bold text-gray-400 tracking-widest uppercase mt-auto">
          Aura Assessment Engine &bull; Secure Local Sandbox persistent architecture
        </footer>
      </div>
    </div>
  );
}
