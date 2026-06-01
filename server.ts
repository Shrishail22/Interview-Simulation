import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Lazy initialization of Gemini to prevent crashes on startup if key is missing
let aiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn("WARNING: GEMINI_API_KEY is not defined. Using mock AI responses.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key || "MOCK_KEY",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// 1. API: Start Interview Session
app.post("/api/interview/start", async (req, res) => {
  try {
    const { role, difficulty } = req.body;
    const isMock = !process.env.GEMINI_API_KEY;

    if (isMock) {
      return res.json({
        question: `Welcome! Let's start the interview for a Senior ${role} position. Can you first introduce yourself and describe a complex, high-scale project you delivered recently?`
      });
    }

    const ai = getGemini();
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `You are an elite, professional Tech Interviewer conducting an interview.
Role: ${role}
Difficulty Level: ${difficulty}

Please write an opening greeting and present the very first introductory or initial technical question suitable for this role.
Keep the tone futuristic, supportive, and extremely professional. Direct, no fluff. Just a welcoming brief sentence and the first core diagnostic question.`,
    });

    res.json({ question: response.text || "Could you summarize your core professional expertise?" });
  } catch (error: any) {
    console.error("Error starting interview:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
});

// 2. API: Multi-turn Dialogue (Reply to Candidate)
app.post("/api/interview/reply", async (req, res) => {
  try {
    const { role, difficulty, history, latestAnswer } = req.body;
    const isMock = !process.env.GEMINI_API_KEY;

    if (isMock) {
      return res.json({
        reply: `That's an interesting approach to that technical problem. Building on top of your architecture explanation, how would you design cache invalidation or maintain distributed state for this scenario?`
      });
    }

    const ai = getGemini();

    // Reconstruct conversation timeline
    const formattedHistory = history.map((h: any) => {
      const actor = h.sender === "ai" ? "Interviewer" : "Candidate";
      return `${actor}: ${h.text}`;
    }).join("\n");

    const prompt = `You are a professional AI Tech Interviewer.
Role: "${role}"
Difficulty Level: "${difficulty}"

Here is the conversation history so far:
${formattedHistory}

The Candidate just replied:
"Candidate: ${latestAnswer}"

Based on their answer:
1. Frame a realistic follow-up question or probe deeper into the specific technologies or choices they mentioned.
2. If they are struggling, give a minor constructive pivot. If they did well, elevate the complexity slightly.
3. Keep the prompt focused, concise (max 3-4 sentences), and stay fully in character as an intellectual AI. Do not provide feedback yet, only respond as the interviewer.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    res.json({ reply: response.text || "Interesting. Can you tell me more about how you'd scale that approach?" });
  } catch (error: any) {
    console.error("Error replying to candidate:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
});

// 3. API: Generate Structured Feedback Report
app.post("/api/interview/feedback", async (req, res) => {
  try {
    const { role, difficulty, history } = req.body;
    const isMock = !process.env.GEMINI_API_KEY;

    if (isMock) {
      // Return high-fidelity fallback feedback report
      return res.json({
        overallScore: 82,
        metrics: {
          technicalAccuracy: 85,
          communication: 80,
          structuredAnswering: 81,
          speechPatternGrade: "B+",
        },
        speechRate: 135,
        fillerWordsUsed: [
          { word: "um", count: 4 },
          { word: "like", count: 7 },
          { word: "ah", count: 2 }
        ],
        pacingFeedback: "Good natural pacing. Great professional articulation style.",
        strengths: [
          "Demonstrated solid command over distributed state concepts",
          "Structured architectural scaling decisions sequentially",
          "Excellent technical articulation and clean code structure layout explanations"
        ],
        weaknesses: [
          "Could go deeper into cache consistency edge cases",
          "Used several filler words during complex technical transitions"
        ],
        detailedReview: [
          {
            question: "How do you achieve consistency in multi-region data stores?",
            userAnswer: "Using read replicas and cache invalidation policies synced on events.",
            ratingScore: 8,
            idealResponse: "Utilize transactional locks, read-after-write configurations, event driven streaming channels like Kafka, and multi-version concurrency controls.",
            coachingNotes: "You described event-driven propagation well, but adding details about quorum consensus (e.g. Raft) would secure a 10/10 Senior level response."
          }
        ]
      });
    }

    const ai = getGemini();

    const formattedHistory = history.map((h: any) => {
      const actor = h.sender === "ai" ? "Interviewer" : "Candidate";
      return `${actor}: ${h.text}`;
    }).join("\n");

    const systemInstruction = `You are an elite developer interview coach. Assess this technical candidate transcript and supply structural grades and exact architectural coaching. All numeric scores should be on a scale of 0 to 100.
Detailed reviews should rate individual answers 0-10.
Identify filler words like "um", "like", "actually", "so", "basically", "ah", "uh" that occurred in the candidate portions. Make a reasonable assessment based on transcript fluidity.`;

    const prompt = `Analyze the following complete tech interview transcript for a candidate seeking a ${difficulty}-level ${role} job:

--- TRANSCRIPT START ---
${formattedHistory}
--- TRANSCRIPT END ---

Evaluate and return a structured feedback profile.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: [
            "overallScore",
            "metrics",
            "speechRate",
            "fillerWordsUsed",
            "pacingFeedback",
            "strengths",
            "weaknesses",
            "detailedReview"
          ],
          properties: {
            overallScore: { type: Type.INTEGER, description: "Overall score out of 100" },
            metrics: {
              type: Type.OBJECT,
              required: ["technicalAccuracy", "communication", "structuredAnswering", "speechPatternGrade"],
              properties: {
                technicalAccuracy: { type: Type.INTEGER, description: "Technical accuracy score out of 100" },
                communication: { type: Type.INTEGER, description: "Communication score out of 100" },
                structuredAnswering: { type: Type.INTEGER, description: "Structured answering score out of 100" },
                speechPatternGrade: { type: Type.STRING, description: "Grade like A+, B, C" },
              }
            },
            speechRate: { type: Type.INTEGER, description: "Simulated words per minute during responses" },
            fillerWordsUsed: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["word", "count"],
                properties: {
                  word: { type: Type.STRING },
                  count: { type: Type.INTEGER }
                }
              }
            },
            pacingFeedback: { type: Type.STRING, description: "Constructive feedback on user speech patterns, rate, and style" },
            strengths: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Bullet points detailing exact things the user excelled at"
            },
            weaknesses: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Bullet points outlining gaps in technical understanding or articulation"
            },
            detailedReview: {
              type: Type.ARRAY,
              description: "Pairing-wise logs of questions asked versus answers given",
              items: {
                type: Type.OBJECT,
                required: ["question", "userAnswer", "ratingScore", "idealResponse", "coachingNotes"],
                properties: {
                  question: { type: Type.STRING },
                  userAnswer: { type: Type.STRING },
                  ratingScore: { type: Type.INTEGER, description: "Score from 0 to 10" },
                  idealResponse: { type: Type.STRING, description: "How a world-class candidate would answer this ideally" },
                  coachingNotes: { type: Type.STRING, description: "Direct suggestions for vocabulary alignment or architectural elements next time" },
                }
              }
            }
          }
        }
      }
    });

    const parsedData = JSON.parse(response.text || "{}");
    res.json(parsedData);
  } catch (error: any) {
    console.error("Error gathering feedback report:", error);
    res.status(500).json({ error: error.message || "Failed parsing feedback report" });
  }
});


// Vite Dev Server Middleware integration or static serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AI Interview Simulator Server active on http://0.0.0.0:${PORT}`);
  });
}

startServer();
