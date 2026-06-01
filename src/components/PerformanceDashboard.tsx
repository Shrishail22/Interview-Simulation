import React, { useState, useEffect } from "react";
import { InterviewSession, SkillGapItem, RoadmapTask } from "../types";
import { 
  Award, 
  Calendar, 
  Activity, 
  TrendingUp, 
  BookOpen, 
  ChevronRight, 
  MessageSquare, 
  Check, 
  Sparkles, 
  ArrowUpRight, 
  Briefcase, 
  ShieldAlert, 
  HelpCircle,
  Play,
  RotateCcw,
  CheckCircle2,
  Bookmark
} from "lucide-react";
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
  Legend
} from "recharts";
import { motion, AnimatePresence } from "motion/react";

interface PerformanceProps {
  sessions: InterviewSession[];
  onSelectSession: (session: InterviewSession) => void;
}

export default function PerformanceDashboard({ sessions, onSelectSession }: PerformanceProps) {
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);

  // Filter completed assessments
  const completedSessions = sessions.filter(s => s.status === "completed" && s.feedback);
  const totalCompleted = completedSessions.length;

  // Sync selected node with the first history element on load
  useEffect(() => {
    if (sessions.length > 0 && !selectedLogId) {
      setSelectedLogId(sessions[0].id);
    }
  }, [sessions, selectedLogId]);

  // Aggregate averages
  const avgOverall = totalCompleted > 0
    ? Math.round(completedSessions.reduce((acc, s) => acc + (s.feedback?.overallScore || 0), 0) / totalCompleted)
    : 76; // Premium standard fallback if clean state

  const avgTechnical = totalCompleted > 0
    ? Math.round(completedSessions.reduce((acc, s) => acc + (s.feedback?.metrics.technicalAccuracy || 0), 0) / totalCompleted)
    : 72;

  const avgComm = totalCompleted > 0
    ? Math.round(completedSessions.reduce((acc, s) => acc + (s.feedback?.metrics.communication || 0), 0) / totalCompleted)
    : 79;

  const avgStructure = totalCompleted > 0
    ? Math.round(completedSessions.reduce((acc, s) => acc + (s.feedback?.metrics.structuredAnswering || 0), 0) / totalCompleted)
    : 75;

  // Generate charts trend data
  const trendData = completedSessions.length > 0
    ? completedSessions.slice().reverse().map((s, idx) => ({
        index: `Session ${idx + 1}`,
        score: s.feedback?.overallScore || 0,
        technical: s.feedback?.metrics.technicalAccuracy || 0,
        communication: s.feedback?.metrics.communication || 0,
        date: new Date(s.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      }))
    : [
        { index: "Session 1", score: 68, technical: 65, communication: 70, date: "Prep Day 1" },
        { index: "Session 2", score: 74, technical: 72, communication: 76, date: "Prep Day 3" },
        { index: "Session 3", score: 85, technical: 88, communication: 82, date: "Prep Day 5" },
      ];

  // Dynamic Skill Profile comparing averages
  const skillProfile = [
    { subject: "Accuracy", user: avgTechnical, target: 90 },
    { subject: "Speech Fluidity", user: avgComm, target: 85 },
    { subject: "Structure", user: avgStructure, target: 88 },
    { subject: "Pacing", user: Math.min(avgComm + 5, 100), target: 90 },
    { subject: "Idempotence Insights", user: Math.round((avgTechnical + avgStructure) / 2), target: 85 }
  ];

  // Skill Gap assessment analysis objects
  const skillGaps: SkillGapItem[] = [
    {
      subject: "Distributed Transact Lock-State",
      category: "architectural",
      status: avgTechnical < 80 ? "critical" : "moderate",
      score: avgTechnical - 4,
      lessonRecommendation: "Analyze database isolation SERIALIZABLE level versus distributed mutex algorithms like Redlock."
    },
    {
      subject: "Web Core Rendering performance",
      category: "functional",
      status: avgStructure < 82 ? "moderate" : "optimal",
      score: avgStructure + 2,
      lessonRecommendation: "Tune framework client-side hydration lifecycles, and audit bundler chunk tree splits."
    },
    {
      subject: "API Idempotence Patterns",
      category: "conceptual",
      status: avgTechnical < 75 ? "critical" : "moderate",
      score: Math.min(avgTechnical + 6, 100),
      lessonRecommendation: "Integrate unique client request UUID hashes using pre-check distributed cache validation filters."
    },
    {
      subject: "Technical Pacing and Pauses",
      category: "functional",
      status: "optimal",
      score: avgComm,
      lessonRecommendation: "Maintain active pause sequences during structural transition markers to project authority."
    }
  ];

  // Personalized Roadmap Tasks list
  const [roadmapTasks, setRoadmapTasks] = useState<RoadmapTask[]>([
    {
      id: "road_1",
      title: "Review CAP Theorem balancing and consistency patterns",
      topic: "System Design Core",
      durationString: "15 mins reading",
      conceptGuide: "Focus on linearizable consistency and raft consensus quorum protocols in multi-region environments.",
      completed: true
    },
    {
      id: "road_2",
      title: "Optimize API write boundaries with request idempotency keys",
      topic: "Platform Architecture",
      durationString: "25 mins lab",
      conceptGuide: "Design custom request pipelines using Express middleware matching unique UUID hashes saved on Redis memory stores.",
      completed: false
    },
    {
      id: "road_3",
      title: "Refine technical state structured answering (STAR framework)",
      topic: "Vocal Delivery Mastery",
      durationString: "10 mins video",
      conceptGuide: "Express architectural complexity by defining Situation, Task, Action, and the exact physical result.",
      completed: false
    }
  ]);

  const toggleRoadmapTask = (id: string) => {
    setRoadmapTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const selectedLogSession = sessions.find(s => s.id === selectedLogId);

  return (
    <div className="space-y-6 text-left max-w-6xl mx-auto">
      
      {/* 1. Aggregate Stats Panel row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center text-indigo-600 mb-2 select-none">
            <Calendar className="w-4.5 h-4.5 opacity-85" />
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Total Done</span>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900 tracking-tight">{totalCompleted}</div>
            <p className="text-[11px] text-gray-500 mt-0.5">Assessed scenarios</p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center text-indigo-600 mb-2 select-none">
            <Award className="w-4.5 h-4.5 opacity-85" />
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Average Grade</span>
          </div>
          <div>
            <div className="text-2xl font-bold text-indigo-600 tracking-tight">{avgOverall}%</div>
            <p className="text-[11px] text-gray-500 mt-0.5">Aggregate performance rating</p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center text-indigo-600 mb-2 select-none">
            <Activity className="w-4.5 h-4.5 opacity-85" />
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Technical Skill</span>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900 tracking-tight">{avgTechnical}%</div>
            <p className="text-[11px] text-gray-500 mt-0.5">Distributed scaling accuracy</p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center text-indigo-600 mb-2 select-none">
            <MessageSquare className="w-4.5 h-4.5 opacity-85" />
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Communication</span>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900 tracking-tight">{avgComm}%</div>
            <p className="text-[11px] text-gray-500 mt-0.5">Articulation & narrative grade</p>
          </div>
        </div>
      </div>

      {/* 2. Analytical visual graph details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Trend Graph */}
        <div className="lg:col-span-2 bg-white border border-gray-200 p-5 rounded-3xl shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-950 flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-indigo-600" />
                  <span>Iterative Progress Analytics</span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">Comparative scoring trajectories across consecutive assessments</p>
              </div>
              <span className="text-[9px] font-mono bg-indigo-50 border border-indigo-100 text-indigo-600 font-semibold px-2.5 py-1 rounded-full uppercase">
                Temporal trends
              </span>
            </div>

            <div className="h-[210px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="primaryArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.12} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#f3f4f6" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="index" stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} className="font-mono" />
                  <YAxis stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} className="font-mono" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e5e7eb", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
                    labelStyle={{ color: "#111827", fontSize: "11px", fontWeight: "bold" }}
                    itemStyle={{ fontSize: "11px" }}
                  />
                  <Area type="monotone" dataKey="score" stroke="#4f46e5" strokeWidth={2.5} fillOpacity={1} fill="url(#primaryArea)" name="Overall Trajectory" />
                  <Area type="monotone" dataKey="technical" stroke="#9ca3af" strokeWidth={1} strokeDasharray="4 4" fill="none" name="Technical Vector" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <p className="text-[10px] text-gray-400 mt-4 italic border-t border-gray-100 pt-3">
            Note: Interactive data streams are generated autonomously. Take multiple assessments to populate long-horizon trends.
          </p>
        </div>

        {/* Radar standard representation */}
        <div className="bg-white border border-gray-200 p-5 rounded-3xl shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-950 mb-1">Standard Skill Matrix</h3>
            <p className="text-xs text-gray-500 mb-4">Competency profile against world-class staff targets</p>
            
            <div className="h-[170px] w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={skillProfile}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis dataKey="subject" stroke="#6b7280" fontSize={9} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} stroke="#e5e7eb" />
                  <Radar name="Your Score" dataKey="user" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.12} />
                  <Radar name="Vercel/Stripe Benchmark" dataKey="target" stroke="#d1d5db" fill="#d1d5db" fillOpacity={0.02} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-gray-150 pt-3 text-[10px] font-semibold text-gray-500 select-none">
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-650" />
              <span>Current Ability</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded bg-gray-300" />
              <span>Job target</span>
            </span>
          </div>
        </div>

      </div>

      {/* 3. Skill Gap Analysis Bento-Grid Section */}
      <section className="space-y-3">
        <div>
          <h3 className="text-sm font-bold text-gray-950">Aura Skill Gap Diagnostic Radar</h3>
          <p className="text-xs text-gray-500">Continuous identification of architectural and algorithmic blind spots.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {skillGaps.map((gap, index) => (
            <div key={index} className="bg-white border border-gray-200 p-4 rounded-2xl flex flex-col justify-between shadow-sm text-left">
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <span className="text-[9px] bg-gray-50 border border-gray-200 text-gray-500 px-2.5 py-0.5 rounded font-mono font-semibold uppercase tracking-wider">
                    {gap.category}
                  </span>
                  
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    gap.status === "critical" 
                      ? "bg-rose-50 text-rose-600 border border-rose-100 animate-pulse" 
                      : gap.status === "moderate" 
                      ? "bg-amber-50 text-amber-600 border border-amber-100" 
                      : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                  }`}>
                    {gap.status}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-gray-900 leading-snug">{gap.subject}</h4>
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  {gap.lessonRecommendation}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center text-[10px] font-bold">
                <span className="text-gray-400 uppercase tracking-widest">Calculated Skill</span>
                <span className="font-mono text-gray-800">{gap.score}%</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Personalized Learning Roadmap Tracker Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Learner Roadmap path list */}
        <div className="lg:col-span-5 bg-white border border-gray-200 p-5 rounded-3xl shadow-sm text-left flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-indigo-600 mb-2 select-none">
              <Sparkles className="w-5 h-5 opacity-85" />
              <h3 className="text-sm font-bold text-gray-950 uppercase tracking-wider">Personalized Study Roadmap</h3>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed mb-5">
              Structured step-by-step milestones curated dynamically based on diagnostic weak spots found during dialogue drills.
            </p>

            <div className="space-y-4">
              {roadmapTasks.map((task) => (
                <div 
                  key={task.id}
                  onClick={() => toggleRoadmapTask(task.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer select-none flex items-start space-x-3 text-xs ${
                    task.completed 
                      ? "bg-emerald-50/10 border-emerald-200 text-gray-500" 
                      : "bg-white border-gray-200 hover:bg-gray-50/50"
                  }`}
                >
                  <button className={`p-1.5 rounded-lg border shrink-0 mt-0.5 transition-colors ${
                    task.completed 
                      ? "bg-emerald-600 border-emerald-600 text-white" 
                      : "bg-white border-gray-200 text-transparent hover:border-indigo-400"
                  }`}>
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </button>

                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-gray-900 leading-snug">{task.title}</span>
                      <span className="text-[8px] bg-indigo-50 text-indigo-650 px-2 py-0.5 rounded font-bold uppercase tracking-wider shrink-0">{task.topic}</span>
                    </div>
                    <p className="text-[11px] text-gray-500 leading-relaxed">
                      {task.conceptGuide}
                    </p>
                    <span className="text-[9px] text-indigo-650 font-mono font-semibold block pt-1">{task.durationString}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-[11px] font-semibold text-gray-400">
            <span>Roadmap progress: {roadmapTasks.filter(t => t.completed).length}/{roadmapTasks.length} Done</span>
            <span className="text-indigo-600">Recompute targets &rarr;</span>
          </div>
        </div>

        {/* Previous Assessment dialogue log replay streams */}
        <div className="lg:col-span-7 bg-white border border-gray-200 p-5 rounded-3xl shadow-sm flex flex-col justify-between text-left">
          
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-1">
              <div>
                <h3 className="text-sm font-semibold text-gray-950">Dialogue Assessment Logs</h3>
                <p className="text-xs text-gray-550">Timeline metrics of completed performance history checkpoints</p>
              </div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{sessions.length} sessions logged</span>
            </div>

            {sessions.length === 0 ? (
              <div className="text-center py-20 text-gray-400 text-xs">
                No past interview session data found. Complete an interview activity.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[290px] overflow-y-auto pr-1">
                {sessions.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedLogId(item.id)}
                    className={`w-full text-left flex items-center justify-between p-3.5 rounded-2xl border transition-all select-none ${
                      selectedLogId === item.id
                        ? "bg-indigo-50/30 border-indigo-200 text-indigo-900 shadow-xs"
                        : "bg-white border-gray-200 hover:bg-gray-50/50 text-gray-700"
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <p className="text-xs font-bold capitalize text-gray-905 truncate">{item.role} simulation track</p>
                      <p className="text-[10px] text-gray-500 mt-1 capitalize font-medium">
                        {new Date(item.createdAt).toLocaleDateString()} &bull; {item.difficulty} bracket &bull; {item.durationSeconds || 190}s
                      </p>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <span className="text-xs font-mono font-bold bg-gray-50 border border-gray-250/50 px-2.5 py-1 rounded-md text-gray-700">
                        {item.feedback?.overallScore || 0}%
                      </span>
                      <ChevronRight className="w-4.5 h-4.5 text-gray-400" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-end">
            {selectedLogSession && (
              <button
                onClick={() => onSelectSession(selectedLogSession)}
                className="text-white bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer border-none flex items-center space-x-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Replay Selected Session Blueprint</span>
              </button>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
