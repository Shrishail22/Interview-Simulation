import React, { useState, useRef, DragEvent } from "react";
import { RoleType, InterviewerProfile } from "../types";
import { INTERVIEWERS } from "../lib/interviewers";
import { 
  ChevronRight, 
  ChevronLeft, 
  Upload, 
  FileText, 
  Check, 
  Cpu, 
  Layers, 
  Terminal, 
  Award, 
  BookOpen, 
  Target, 
  Briefcase, 
  Sparkles, 
  Trash2,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface SetupWizardProps {
  onLaunch: (config: {
    role: RoleType;
    difficulty: 'junior' | 'mid' | 'senior' | 'lead';
    interviewer: InterviewerProfile;
    resumeFile: File | null;
    resumeDetails: string | null;
  }) => void;
}

const ROLES_DATA = [
  {
    value: "frontend" as RoleType,
    label: "Frontend Engineer",
    description: "Specialized in pristine visual user interfaces, advanced state-machines, micro-frontends, and core rendering performance optimizations.",
    skills: ["React 19", "Next.js RSC", "TailwindCSS", "TypeScript", "Web Vitals", "State Engines"],
    salaryEstimate: "$140k - $210k"
  },
  {
    value: "backend" as RoleType,
    label: "Backend Engineer",
    description: "Focuses on transaction isolation boundaries, high-throughput streaming pipelines, low-latency APIs, and optimized query plans.",
    skills: ["Node.js", "Go", "PostgreSQL", "Kafka", "Docker", "Database Query Tuning"],
    salaryEstimate: "$150k - $230k"
  },
  {
    value: "fullstack" as RoleType,
    label: "Fullstack Architect",
    description: "Bridges client-side interactivity and highly scalable system stores. Deals with unified schemas, server-side caching, and build workflows.",
    skills: ["React", "Express", "Supabase / PG", "Redis", "GraphQL", "CI/CD Pipelines"],
    salaryEstimate: "$155k - $240k"
  },
  {
    value: "architect" as RoleType,
    label: "System Architect",
    description: "Designs global cloud infrastructures, disaster-recovery patterns, active-active multi-region synchronizations, and system decoupling models.",
    skills: ["AWS/GCP/Azure", "Kubernetes", "CAP Trade-offs", "ScyllaDB", "Event Streams", "gRPC"],
    salaryEstimate: "$180k - $280k"
  },
  {
    value: "pm" as RoleType,
    label: "Technical Product Manager",
    description: "Analyzes systemic platform capabilities, translates high-level business logic into requirements, coordinates engineering lifecycles.",
    skills: ["Product Roadmap", "SQL Analytics", "UX Strategy", "Agile Cycles", "API Scope", "Data-driven Planning"],
    salaryEstimate: "$135k - $195k"
  },
  {
    value: "data_science" as RoleType,
    label: "Data Scientist / AI Engineer",
    description: "Builds model fine-tuning frameworks, runs feature engineering workflows, handles large multi-terabyte analytics, and designs training pipelines.",
    skills: ["Python", "PyTorch", "SQL", "Pandas", "LLM Fine-Tuning", "Vector DBs", "RAG Systems"],
    salaryEstimate: "$160k - $250k"
  }
];

export default function InterviewSetupWizard({ onLaunch }: SetupWizardProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Selected parameters
  const [selectedRole, setSelectedRole] = useState<RoleType>("frontend");
  const [selectedDiff, setSelectedDiff] = useState<'junior' | 'mid' | 'senior' | 'lead'>("senior");
  const [selectedInterviewer, setSelectedInterviewer] = useState<InterviewerProfile>(INTERVIEWERS[0]);
  
  // Resume states
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeDetails, setResumeDetails] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [parsingProgress, setParsingProgress] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Steps handling
  const handleNext = () => {
    if (step < 4) {
      setStep((step + 1) as any);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((step - 1) as any);
    }
  };

  // Drag and drop events
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const processFile = (file: File) => {
    if (file.type !== "application/pdf" && file.type !== "application/vnd.openxmlformats-officedocument.wordprocessingml.document" && !file.name.endsWith(".txt")) {
      alert("Invalid format. Please supply a valid PDF, Word Document, or plain text Resume file.");
      return;
    }
    setResumeFile(file);
    setParsingProgress(true);

    // Mock an elegant AI semantic analyzer pass to parse out skill set
    setTimeout(() => {
      setParsingProgress(false);
      // Construct realistic parsing intelligence feedback
      const fileNameLower = file.name.toLowerCase();
      let detectedTech = ["TypeScript", "React", "Node.js", "Docker", "RESTful Core"];
      let levelRecommendation = "Senior";

      if (fileNameLower.includes("junior")) {
        detectedTech = ["HTML5", "CSS3", "JavaScript", "React", "Git"];
        levelRecommendation = "junior";
      } else if (fileNameLower.includes("lead") || fileNameLower.includes("principal") || fileNameLower.includes("architect")) {
        detectedTech = ["Kubernetes", "AWS CloudFormation", "PostgreSQL", "Distributed Systems", "Idempotency Patches", "Go Language"];
        levelRecommendation = "lead";
      }

      setResumeDetails(`Aura Intelligence extracted: ${detectedTech.join(", ")}. Matches difficulty target: ${levelRecommendation.toUpperCase()}.`);
      
      // Auto-update seniority if matched
      if (["junior", "mid", "senior", "lead"].includes(levelRecommendation)) {
        setSelectedDiff(levelRecommendation as any);
      }
    }, 1500);
  };

  const handleRemoveResume = () => {
    setResumeFile(null);
    setResumeDetails(null);
  };

  const handleFinalLaunch = () => {
    onLaunch({
      role: selectedRole,
      difficulty: selectedDiff,
      interviewer: selectedInterviewer,
      resumeFile,
      resumeDetails
    });
  };

  return (
    <div className="w-full bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm text-left max-w-4xl mx-auto">
      
      {/* Step Wizard Header Tracker */}
      <div className="mb-8 select-none">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
          <div>
            <span className="text-[9px] text-indigo-600 font-bold uppercase tracking-wider block">Gateway Wizard</span>
            <h1 className="text-lg font-bold text-gray-950 tracking-tight">Configure Assessment Environment</h1>
          </div>
          <span className="text-xs bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl font-semibold text-gray-650">
            Step {step} of 4
          </span>
        </div>

        {/* Minimal Progress Horizontal Bar */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { tag: "1", title: "Role Focus" },
            { tag: "2", title: "Seniority" },
            { tag: "3", title: "AI Assessor" },
            { tag: "4", title: "Credentials" }
          ].map((s) => {
            const stepNum = parseInt(s.tag);
            const isFinished = step > stepNum;
            const isActive = step === stepNum;
            return (
              <div key={s.tag} className="space-y-1.5">
                <div className={`h-1.5 rounded-full transition-all duration-300 ${
                  isFinished ? "bg-indigo-600" : isActive ? "bg-indigo-500" : "bg-gray-100"
                }`} />
                <span className={`text-[10px] font-bold block ${
                  isActive ? "text-indigo-600" : isFinished ? "text-gray-900" : "text-gray-400"
                }`}>
                  {s.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Multi-Step Forms Deck */}
      <div className="min-h-[340px] flex flex-col justify-between">
        <AnimatePresence mode="wait">
          
          {/* STEP 1: Premium Role Selection Cards */}
          {step === 1 && (
            <motion.div
              key="step-roles"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div>
                <h3 className="text-sm font-semibold text-gray-950">Select Job Discipline Target</h3>
                <p className="text-xs text-gray-505 leading-relaxed mt-0.5">Choose your assessment track. Each role triggers unique AI questions, evaluation criteria, and salary alignments.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ROLES_DATA.map((roleObj) => {
                  const isSelected = selectedRole === roleObj.value;
                  return (
                    <div
                      key={roleObj.value}
                      onClick={() => setSelectedRole(roleObj.value)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between group ${
                        isSelected 
                          ? "bg-indigo-50/20 border-indigo-500 shadow-sm" 
                          : "bg-white border-gray-200 hover:bg-gray-50/50 hover:border-gray-300"
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-center mb-1.5">
                          <h4 className="text-xs font-bold text-gray-950 group-hover:text-indigo-600 transition-colors">
                            {roleObj.label}
                          </h4>
                          {isSelected && (
                            <span className="w-5 h-5 bg-indigo-100 border border-indigo-200 text-indigo-600 rounded-full flex items-center justify-center">
                              <Check className="w-3 h-3 stroke-[2.5]" />
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-gray-500 leading-relaxed pr-3">
                          {roleObj.description}
                        </p>
                      </div>

                      {/* Display custom skill tags */}
                      <div className="mt-3.5 pt-3 border-t border-gray-100 flex flex-wrap gap-1.5">
                        {roleObj.skills.slice(0, 4).map((skill, index) => (
                          <span key={index} className="text-[9px] bg-gray-150/50 font-medium px-2 py-0.5 rounded text-gray-600 border border-gray-200/45">
                            {skill}
                          </span>
                        ))}
                        <span className="text-[9px] text-indigo-600 ml-auto font-mono font-semibold self-center">
                          {roleObj.salaryEstimate}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* STEP 2: Seniority Levels expectations */}
          {step === 2 && (
            <motion.div
              key="step-seniority"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div>
                <h3 className="text-sm font-semibold text-gray-950">Choose Seniority Target</h3>
                <p className="text-xs text-gray-550 leading-relaxed mt-0.5">Select the expected role seniority level. Lower tiers emphasize coding correctness; high tiers focus heavily on architecture scale & trade-offs.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { 
                    value: "junior" as const, 
                    label: "Junior", 
                    brief: "Syntactic Correctness",
                    criteria: ["General algorithm structures", "Basic framework knowledge", "Syntax execution", "Curiosity profile"]
                  },
                  { 
                    value: "mid" as const, 
                    label: "Midweight", 
                    brief: "Functional Systems", 
                    criteria: ["State handling", "Performance benchmarking", "Clear APIs", "Exception scenarios"] 
                  },
                  { 
                    value: "senior" as const, 
                    label: "Senior", 
                    brief: "Architectural Tradeoffs", 
                    criteria: ["CAP theorem balances", "System decoupling models", "Idempotence design", "Team velocity leadership"] 
                  },
                  { 
                    value: "lead" as const, 
                    label: "Principal / Lead", 
                    brief: "Enterprise Landscapes", 
                    criteria: ["SLA disaster recovery", "Multi-datacenter strategies", "Multi-million dollar scales", "Global platform decisions"] 
                  }
                ].map((diffObj) => {
                  const isSelected = selectedDiff === diffObj.value;
                  return (
                    <div
                      key={diffObj.value}
                      onClick={() => setSelectedDiff(diffObj.value)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? "bg-indigo-50/20 border-indigo-500 shadow-sm"
                          : "bg-white border-gray-200 hover:bg-gray-50/50 hover:border-gray-300"
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-bold text-gray-950">{diffObj.label}</span>
                          {isSelected && (
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                          )}
                        </div>
                        <span className="text-[10px] text-indigo-600 font-mono font-semibold block mb-3 uppercase tracking-wider">
                          Focus: {diffObj.brief}
                        </span>

                        <div className="space-y-1.5 border-t border-gray-100 pt-3">
                          <span className="text-[9px] font-bold text-gray-400 block uppercase tracking-wider">Criteria:</span>
                          <ul className="text-[10px] text-gray-500 space-y-1 pl-2.5 list-disc leading-snug">
                            {diffObj.criteria.map((crt, idx) => (
                              <li key={idx}>{crt}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* STEP 3: Select AI Assessor Personality */}
          {step === 3 && (
            <motion.div
              key="step-assessors"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div>
                <h3 className="text-sm font-semibold text-gray-950">Select Interviewer Specialist</h3>
                <p className="text-xs text-gray-500 leading-relaxed mt-0.5">Each assessor is modeled on standard patterns from elite organizations. Select one to customize question biases and delivery feedback style.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {INTERVIEWERS.map((intv) => {
                  const isSelected = selectedInterviewer.id === intv.id;
                  return (
                    <div
                      key={intv.id}
                      onClick={() => setSelectedInterviewer(intv)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? "bg-indigo-50/20 border-indigo-500 shadow-sm"
                          : "bg-white border-rose-50/20 border-gray-200 hover:bg-gray-50/50 hover:border-gray-300"
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-xs font-bold text-gray-950">{intv.name}</h4>
                            <p className="text-[10px] text-gray-500 font-medium">
                              {intv.title} &bull; <span className="font-semibold text-gray-800">{intv.company}</span>
                            </p>
                          </div>
                          <span className={`text-[9px] px-2 py-0.5 rounded-full font-mono font-semibold uppercase tracking-wider ${
                            intv.personality === "rigorous" 
                              ? "bg-rose-50 text-rose-600 border border-rose-100" 
                              : intv.personality === "direct" 
                              ? "bg-slate-100 text-slate-800"
                              : intv.personality === "philosophical"
                              ? "bg-purple-50 text-purple-600 border border-purple-100"
                              : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                          }`}>
                            {intv.personality}
                          </span>
                        </div>

                        <p className="text-[11px] text-gray-500 leading-relaxed italic pr-4">
                          "{intv.bio.slice(0, 160)}..."
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-gray-100">
                        <span className="text-[9px] font-bold text-gray-400 block uppercase tracking-wider mb-1">Focus specialty:</span>
                        <p className="text-[10px] font-medium text-indigo-700">{intv.focusBias}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* STEP 4: Resume Parsing Space & Launch Summary */}
          {step === 4 && (
            <motion.div
              key="step-resume"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                
                {/* File droppable space element */}
                <div className="md:col-span-6 space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-950">Semantic Resume Analyzer</h3>
                    <p className="text-xs text-gray-500 leading-relaxed mt-0.5">
                      Upload your standard CV/Resume. Aura will evaluate extracted core skills to refine and personalize adaptive interview dialogue.
                    </p>
                  </div>

                  {/* Drag and drop panel interface */}
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer flex flex-col items-center justify-center space-y-3 ${
                      isDragging 
                        ? "bg-indigo-50/50 border-indigo-500" 
                        : resumeFile 
                        ? "bg-emerald-50/10 border-emerald-300"
                        : "bg-gray-50/40 border-gray-200 hover:bg-gray-50/80 hover:border-gray-300"
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.docx,.txt"
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    <div className="w-10 h-10 bg-white border border-gray-200 shadow-sm rounded-xl flex items-center justify-center text-gray-500">
                      {resumeFile ? <FileText className="w-5 h-5 text-indigo-600" /> : <Upload className="w-5 h-5" />}
                    </div>

                    <div className="text-xs">
                      {resumeFile ? (
                        <p className="font-semibold text-gray-900 truncate max-w-[240px] mx-auto">{resumeFile.name}</p>
                      ) : (
                        <p className="text-gray-500">
                          <span className="font-semibold text-indigo-600 hover:underline">Click to browse</span> or drag resume PDF here
                        </p>
                      )}
                      <p className="text-[10px] text-gray-400 mt-1">Accepts PDF, Word, or TXT up to 4MB</p>
                    </div>
                  </div>

                  {/* Handle Processing state visual */}
                  {parsingProgress && (
                    <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-3 flex items-center space-x-3 text-xs text-indigo-800 animate-pulse">
                      <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                      <span>Conducting semantic parser extraction...</span>
                    </div>
                  )}

                  {/* Extract success states */}
                  {resumeDetails && !parsingProgress && (
                    <div className="bg-emerald-50/30 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-800 flex items-start space-x-2">
                      <Check className="w-4 h-4 mt-0.5 text-emerald-600 shrink-0" />
                      <div>
                        <p className="font-bold">Resume ingested successfully</p>
                        <p className="text-gray-500 text-[11px] leading-relaxed mt-0.5">{resumeDetails}</p>
                      </div>
                      <button 
                        onClick={handleRemoveResume}
                        className="ml-auto text-gray-400 hover:text-rose-600 p-1 rounded-md transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Environment Summary Board */}
                <div className="md:col-span-6 bg-gray-50/55 border border-gray-200 p-5 rounded-2xl space-y-4">
                  <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Assessment Sandbox Summary</h4>
                  <div className="space-y-3 pt-2">
                    <div className="flex justify-between text-xs border-b border-gray-150 pb-2">
                      <span className="text-gray-500">Target Role</span>
                      <span className="font-semibold text-gray-850 capitalize">{selectedRole} Track</span>
                    </div>
                    <div className="flex justify-between text-xs border-b border-gray-150 pb-2">
                      <span className="text-gray-500">Seniority Bracket</span>
                      <span className="font-semibold text-gray-850 capitalize">{selectedDiff} (Expectation tier)</span>
                    </div>
                    <div className="flex justify-between text-xs border-b border-gray-150 pb-2">
                      <span className="text-gray-500">Assessor Mode</span>
                      <span className="font-semibold text-gray-850 capitalize">{selectedInterviewer.name} &bull; {selectedInterviewer.company}</span>
                    </div>
                    <div className="flex justify-between text-xs pb-1">
                      <span className="text-gray-500">Resume Context</span>
                      <span className="font-semibold text-gray-850">
                        {resumeFile ? "Configured" : "Not Provided (Adaptive Model)"}
                      </span>
                    </div>
                  </div>

                  {/* Accented Quote element */}
                  <div className="bg-white border border-gray-150 p-4 rounded-xl text-left shadow-none text-xs">
                    <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-1.5 flex items-center space-x-1">
                      <Sparkles className="w-3 h-3 text-indigo-500" />
                      <span>{selectedInterviewer.name} quote</span>
                    </p>
                    <p className="text-gray-600 italic leading-relaxed">
                      "{selectedInterviewer.accentQuote}"
                    </p>
                  </div>
                </div>

              </div>
            </motion.div>
          )}

        </AnimatePresence>

        {/* Action Button Navigation Controls footer */}
        <div className="flex items-center justify-between border-t border-gray-100 pt-6 mt-6">
          {step > 1 ? (
            <button
              onClick={handleBack}
              className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-all flex items-center space-x-1 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 shrink-0" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              onClick={handleNext}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-sm hover:shadow transition-all flex items-center space-x-1 cursor-pointer border-none"
            >
              <span>Continue</span>
              <ChevronRight className="w-4 h-4 shrink-0" />
            </button>
          ) : (
            <button
              onClick={handleFinalLaunch}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-6 py-2.5 rounded-xl shadow-sm hover:shadow transition-all flex items-center space-x-2 cursor-pointer border-none"
            >
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>Initiate Simulation Session</span>
            </button>
          )}
        </div>

      </div>

    </div>
  );
}
