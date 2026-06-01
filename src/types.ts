export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export type RoleType = 'frontend' | 'backend' | 'fullstack' | 'architect' | 'pm' | 'data_science';

export interface InterviewSession {
  id: string;
  role: RoleType;
  difficulty: 'junior' | 'mid' | 'senior' | 'lead';
  status: 'idle' | 'started' | 'feedback_ready' | 'completed';
  createdAt: string;
  durationSeconds: number;
  history: ChatMessage[];
  feedback?: SessionFeedback;
  interviewerId?: string;
  resumeFileName?: string | null;
}

export interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  audioDuration?: number;
}

export interface SessionFeedback {
  overallScore: number;
  metrics: {
    technicalAccuracy: number;
    communication: number;
    structuredAnswering: number;
    speechPatternGrade: string; // "A+", "B", etc.
  };
  speechRate: number; // words per minute
  fillerWordsUsed: { word: string; count: number }[];
  pacingFeedback: string; // e.g. "Optimal speed", "Slightly rushing"
  strengths: string[];
  weaknesses: string[];
  detailedReview: QuestionReview[];
  skillGaps: SkillGapItem[];
  roadmap: RoadmapTask[];
}

export interface QuestionReview {
  question: string;
  userAnswer: string;
  ratingScore: number; // 0-10
  idealResponse: string;
  coachingNotes: string;
}

export interface MetricTrendPoint {
  date: string;
  score: number;
  technical: number;
  communication: number;
}

export interface InterviewerProfile {
  id: string;
  name: string;
  title: string;
  company: 'Stripe' | 'Vercel' | 'OpenAI' | 'Apple' | 'Linear';
  avatarColor: string; // e.g., 'indigo', 'emerald'
  focusBias: string; // e.g., 'System Architecture & CAP Theorem' or 'Coding Elegance & Performance'
  personality: 'rigorous' | 'supportive' | 'direct' | 'philosophical';
  bio: string;
  accentQuote: string;
}

export interface SkillGapItem {
  subject: string;
  category: 'conceptual' | 'architectural' | 'functional';
  status: 'critical' | 'moderate' | 'optimal';
  score: number; // 0-100
  lessonRecommendation: string;
}

export interface RoadmapTask {
  id: string;
  title: string;
  topic: string;
  durationString: string; // e.g. "30 min tutorial"
  conceptGuide: string;
  completed: boolean;
}
