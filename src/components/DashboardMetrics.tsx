import React, { useState, useEffect } from "react";
import { InterviewSession } from "../types";
import { Award, Calendar, Activity, BookOpen, ChevronRight, MessageSquare, Mic, TrendingUp, AlertTriangle, ArrowUpRight } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
} from "recharts";
import { motion, AnimatePresence } from "motion/react";

interface MetricsProps {
  sessions: InterviewSession[];
  onSelectSession: (session: InterviewSession) => void;
}

export default function DashboardMetrics({ sessions, onSelectSession }: MetricsProps) {
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);

  // Fallback defaults if no sessions exist
  const completeSessions = sessions.filter(s => s.status === "completed" || s.feedback);
  const totalCompleted = completeSessions.length;

  const averageScore = totalCompleted > 0
    ? Math.round(completeSessions.reduce((acc, s) => acc + (s.feedback?.overallScore || 0), 0) / totalCompleted)
    : 0;

  const avgTechnical = totalCompleted > 0
    ? Math.round(completeSessions.reduce((acc, s) => acc + (s.feedback?.metrics.technicalAccuracy || 0), 0) / totalCompleted)
    : 0;

  const avgComm = totalCompleted > 0
    ? Math.round(completeSessions.reduce((acc, s) => acc + (s.feedback?.metrics.communication || 0), 0) / totalCompleted)
    : 0;

  const avgStructure = totalCompleted > 0
    ? Math.round(completeSessions.reduce((acc, s) => acc + (s.feedback?.metrics.structuredAnswering || 0), 0) / totalCompleted)
    : 0;

  // Sync state: auto select the first available log
  useEffect(() => {
    if (sessions.length > 0 && !selectedLogId) {
      setSelectedLogId(sessions[0].id);
    }
  }, [sessions, selectedLogId]);

  // Prepare trend data for Recharts Area
  const trendData = completeSessions.length > 0
    ? completeSessions.map((s, index) => ({
        name: `Inv ${index + 1}`,
        score: s.feedback?.overallScore,
        technical: s.feedback?.metrics.technicalAccuracy,
        communication: s.feedback?.metrics.communication,
        date: new Date(s.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      }))
    : [
        { name: "Inv 1", score: 68, technical: 65, communication: 70, date: "Assmt 1" },
        { name: "Inv 2", score: 74, technical: 72, communication: 76, date: "Assmt 2" },
        { name: "Inv 3", score: 85, technical: 84, communication: 86, date: "Assmt 3" },
      ];

  // Radar chart alignment comparing averages to Lead benchmarks
  const skillProfile = [
    { subject: "Accuracy", user: avgTechnical || 72, benchmark: 90 },
    { subject: "Communication", user: avgComm || 76, benchmark: 85 },
    { subject: "Structure", user: avgStructure || 70, benchmark: 88 },
    { subject: "Fluidity", user: avgComm ? Math.min(avgComm + 5, 100) : 78, benchmark: 90 },
    { subject: "Pacing", user: Math.round((avgTechnical + avgComm) / 2) || 74, benchmark: 85 },
  ];

  const selectedLogSession = sessions.find(s => s.id === selectedLogId);

  return (
    <div className="space-y-6">
      {/* Stat Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center text-indigo-600 mb-2">
            <Calendar className="w-5 h-5 opacity-85" />
            <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Completed</span>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900 tracking-tight">{totalCompleted}</div>
            <div className="text-xs text-gray-500 mt-1">Practice sessions</div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center text-indigo-600 mb-2">
            <Award className="w-5 h-5 opacity-85" />
            <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Rating Avg</span>
          </div>
          <div>
            <div className="text-2xl font-bold text-indigo-600 tracking-tight">{averageScore}%</div>
            <div className="text-xs text-gray-500 mt-1">Aggregate score</div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center text-indigo-600 mb-2">
            <Activity className="w-5 h-5 opacity-85" />
            <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Tech Skill</span>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900 tracking-tight">{avgTechnical}%</div>
            <div className="text-xs text-gray-500 mt-1">Accuracy & structure</div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center text-indigo-600 mb-2">
            <MessageSquare className="w-5 h-5 opacity-85" />
            <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Coherence</span>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900 tracking-tight">{avgComm}%</div>
            <div className="text-xs text-gray-500 mt-1">Delivery articulate score</div>
          </div>
        </div>
      </div>

      {/* Recharts Analytical Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Modern Trend Area Chart */}
        <div className="lg:col-span-2 bg-white border border-gray-200 p-5 rounded-2xl shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                <span>Historical Performance Progress</span>
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">Iterative score tracking across completed assessments</p>
            </div>
            <span className="text-[10px] bg-indigo-50 border border-indigo-100 text-indigo-600 font-medium px-2.5 py-1 rounded-full">
              Realtime Trends
            </span>
          </div>
          <div className="h-[210px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorOverall" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} className="font-mono" />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} className="font-mono" />
                <Tooltip
                  contentStyle={{ backgroundColor: "rgba(255,255,255,0.95)", border: "1px solid #e2e8f0", borderRadius: "10px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
                  labelStyle={{ color: "#111827", fontSize: "11px", fontWeight: "bold" }}
                  itemStyle={{ fontSize: "12px", color: "#4f46e5" }}
                />
                <Area type="monotone" dataKey="score" stroke="#4f46e5" strokeWidth={2.5} fillOpacity={1} fill="url(#colorOverall)" name="Overall Grade" />
                <Area type="monotone" dataKey="technical" stroke="#94a3b8" strokeWidth={1} strokeDasharray="4 4" fill="none" name="Technical Accuracy" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Competency Balance Radar Chart */}
        <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1">Competency Balance Matrix</h3>
            <p className="text-xs text-gray-500 mb-4">Evaluation vector against master industry standards</p>
            <div className="h-[170px] w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={skillProfile}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" stroke="#6b7280" fontSize={10} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} stroke="#e2e8f0" />
                  <Radar name="Candidate Standard" dataKey="user" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.15} />
                  <Radar name="Staff Benchmark" dataKey="benchmark" stroke="#d1d5db" fill="#d1d5db" fillOpacity={0.03} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 text-[10px] text-gray-500 font-medium">
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-600 inline-block" />
              <span>Current Capability</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-gray-300 inline-block" />
              <span>Industry Target</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Past sessions container */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 lg:col-span-1 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center space-x-2">
            <BookOpen className="w-4 h-4 text-indigo-600" />
            <span>Past Assessment History</span>
          </h3>

          {sessions.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-xs">
              No sessions generated yet. Complete an interview to generate diagnostic history.
            </div>
          ) : (
            <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
              {sessions.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedLogId(item.id)}
                  className={`w-full text-left flex items-center justify-between p-3.5 rounded-xl border transition-all select-none ${
                    selectedLogId === item.id
                      ? "bg-indigo-50/50 border-indigo-200 text-indigo-900 shadow-sm"
                      : "bg-white border-gray-200 hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-semibold capitalize text-gray-900 truncate">{item.role}</p>
                    <p className="text-[10px] text-gray-500 mt-1 capitalize font-medium">
                      {new Date(item.createdAt).toLocaleDateString()} &bull; {item.difficulty}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 shrink-0">
                    <span className="text-xs font-bold font-mono bg-gray-50 border border-gray-200/60 px-2 py-1 rounded text-gray-700">
                      {item.feedback?.overallScore || 0}%
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Coaching Feedbacks insights details */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 lg:col-span-2 shadow-sm text-left">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
            <h3 className="text-sm font-semibold text-gray-900">
              Technical Diagnostic coaching report
            </h3>
            {selectedLogSession && (
              <button 
                onClick={() => onSelectSession(selectedLogSession)}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center space-x-1 hover:underline cursor-pointer"
              >
                <span>Replay session</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <AnimatePresence mode="wait">
            {selectedLogSession ? (
              <motion.div
                key={selectedLogSession.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-5"
              >
                {/* Metrics detail grids */}
                <div className="grid grid-cols-3 gap-3 bg-gray-50/70 border border-gray-100 p-4 rounded-xl text-center">
                  <div>
                    <span className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Accuracy Vector</span>
                    <span className="text-sm font-bold text-indigo-600 font-mono mt-0.5 block">
                      {selectedLogSession.feedback?.metrics.technicalAccuracy}%
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Structure Vector</span>
                    <span className="text-sm font-bold text-gray-900 font-mono mt-0.5 block">
                      {selectedLogSession.feedback?.metrics.structuredAnswering}%
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Speech Rhythm</span>
                    <span className="text-sm font-bold text-gray-900 font-mono mt-0.5 block">
                      ~{selectedLogSession.feedback?.speechRate} WPM
                    </span>
                  </div>
                </div>

                {/* Pros and cons list */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-emerald-800 flex items-center space-x-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>Coaching Strengths</span>
                    </h4>
                    <ul className="text-xs text-gray-600 space-y-1.5 pl-3 border-l border-emerald-100">
                      {selectedLogSession.feedback?.strengths.map((str, i) => (
                        <li key={i} className="leading-snug">{str}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-amber-800 flex items-center space-x-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      <span>Growth Areas</span>
                    </h4>
                    <ul className="text-xs text-gray-600 space-y-1.5 pl-3 border-l border-amber-100">
                      {selectedLogSession.feedback?.weaknesses.map((weak, i) => (
                        <li key={i} className="leading-snug">{weak}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Specific items logs */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-semibold text-gray-900 tracking-wide uppercase text-[10px]">Step-by-step Review</h4>
                  <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-1">
                    {selectedLogSession.feedback?.detailedReview.map((rev, idx) => (
                      <div key={idx} className="bg-gray-50/50 p-3.5 rounded-xl border border-gray-100 text-xs">
                        <div className="flex justify-between items-start gap-4">
                          <p className="font-semibold text-gray-900">Q: {rev.question}</p>
                          <span className="text-[10px] px-2 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-600 font-medium rounded-md shrink-0">
                            Score: {rev.ratingScore}/10
                          </span>
                        </div>
                        <p className="text-gray-500 mt-1.5 italic">Your Answer: "{rev.userAnswer}"</p>
                        <div className="mt-2.5 bg-white p-3 rounded-lg border border-gray-200 text-gray-600 text-[11px] leading-relaxed shadow-sm">
                          <span className="font-semibold text-gray-850 block mb-0.5">Assessor Review:</span>
                          {rev.coachingNotes}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="text-center py-16 text-gray-400 text-xs flex flex-col items-center justify-center space-y-2">
                <AlertTriangle className="w-5 h-5 text-gray-300" />
                <span>Select a training assessment history node from the panel to analyze feedback details.</span>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
