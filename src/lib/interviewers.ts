import { InterviewerProfile } from "../types";

export const INTERVIEWERS: InterviewerProfile[] = [
  {
    id: "sarah_vercel",
    name: "Sarah Jenkins",
    title: "Principal Engineer",
    company: "Vercel",
    avatarColor: "#000000",
    focusBias: "Performance, Web Vitals, Framework Architecture, React Server Components",
    personality: "supportive",
    bio: "Sarah leads frameworks architecture at Vercel. She focuses on rendering performance, efficient bundle sizing, and smooth user experiences. In interviews, she looks for deep mastery over reactivity and resource rendering lifecycles.",
    accentQuote: "Web performance isn't just about speed; it's about treating client CPU cycles with respect."
  },
  {
    id: "marcus_stripe",
    name: "Marcus Aurelius",
    title: "Lead Platform Architect",
    company: "Stripe",
    avatarColor: "#635BFF",
    focusBias: "Distributed Transaction Idempotency, API Design, Scalable Database Schemas",
    personality: "direct",
    bio: "Marcus oversees global ledger systems and internal developer ergonomics at Stripe. He looks for pristine technical naming, robust edge-case exception flows, and beautiful structural design patterns that reduce architectural drag.",
    accentQuote: "Pristine code feels invisible. APIs should be so intuitive that they write themselves."
  },
  {
    id: "elena_openai",
    name: "Dr. Elena Rostova",
    title: "Research Director",
    company: "OpenAI",
    avatarColor: "#10A37F",
    focusBias: "Computational Efficiency, Transformer Weights, Vector Embeddings Scaling",
    personality: "philosophical",
    bio: "Elena specializes in hyper-scalable training pipelines and latency-aware token routing logic. She approaches code from an algorithmic and memory-bound perspective, exploring the trade-offs of modern compute environments.",
    accentQuote: "Code is simply our way of forcing chaotic computation into ordered, beautiful abstractions."
  },
  {
    id: "devon_linear",
    name: "Devon Sinclair",
    title: "Senior Product Craftsman",
    company: "Linear",
    avatarColor: "#5E6AD2",
    focusBias: "Pristine UI Hierarchy, Native Keyboard Navigation, Offline Sync States",
    personality: "rigorous",
    bio: "Devon designs high-velocity workflows and client-side offline engines at Linear. He is extremely rigorous about micro-animations, atomic component state management, and making professional tools feel lightweight and snappy.",
    accentQuote: "The difference between good software and grand software is the thickness of its borders and the speed of its shortcuts."
  }
];
