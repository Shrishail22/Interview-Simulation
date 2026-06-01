import React, { useState, useEffect, useRef } from "react";
import { RoleType, ChatMessage, InterviewerProfile } from "../types";
import InterviewerAvatar from "./InterviewerAvatar";
import { Mic, MicOff, Send, LogOut, Loader, Sparkles, Volume2, VolumeX, Briefcase, Info, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface InterviewRoomProps {
  role: RoleType;
  difficulty: 'junior' | 'mid' | 'senior' | 'lead';
  interviewer: InterviewerProfile;
  resumeDetails: string | null;
  onFinishSession: (chatHistory: ChatMessage[]) => void;
  onAbort: () => void;
}

export default function InterviewSessionView({ 
  role, 
  difficulty, 
  interviewer, 
  resumeDetails, 
  onFinishSession, 
  onAbort 
}: InterviewRoomProps) {
  const [status, setStatus] = useState<"idle" | "listening" | "speaking" | "thinking">("idle");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0);

  const [transcribingText, setTranscribingText] = useState("");
  const [isRecording, setIsRecording] = useState(false);

  // Audio refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const recognitionRef = useRef<any>(null);

  // Scroll Chat Ref
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Speech Synthesis reading
  const speakText = (text: string) => {
    if (isMuted) return;
    try {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onstart = () => setStatus("speaking");
      utterance.onend = () => setStatus("idle");
      utterance.onerror = () => setStatus("idle");

      const voices = window.speechSynthesis.getVoices();
      // Try to find matching voice tone or fallback
      const idealVoice = voices.find(v => 
        v.name.toLowerCase().includes("google") || 
        v.name.toLowerCase().includes("apple") || 
        v.lang.startsWith("en-US")
      );
      if (idealVoice) utterance.voice = idealVoice;

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Speech synthesis error inside this viewport:", e);
    }
  };

  // Run start API
  useEffect(() => {
    const triggerStart = async () => {
      setStatus("thinking");
      try {
        const response = await fetch("/api/interview/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            role, 
            difficulty,
            interviewerName: interviewer.name,
            interviewerCompany: interviewer.company,
            resumeDetails
          }),
        });
        const data = await response.json();
        if (data.error) throw new Error(data.error);

        const welcomeItem: ChatMessage = {
          id: `msg_${Math.random().toString(36).substr(2, 9)}`,
          sender: "ai",
          text: `[${interviewer.name} from ${interviewer.company}]: ${data.question}`,
          timestamp: new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages([welcomeItem]);
        setStatus("idle");
        setTimeout(() => speakText(data.question), 600);
      } catch (error) {
        console.error("Failed to retrieve starting prompt:", error);
        
        // Dynamic contextual greeting based on chosen interviewer profile
        const customGreeting = `Hello, I'm ${interviewer.name}, ${interviewer.title} at ${interviewer.company}. I specialize in ${interviewer.focusBias}. Let's start our ${difficulty}-level session. Could you summarize your background and walk me through a architectural transaction or layout structure you built recently?`;
        
        const fallbackMsg: ChatMessage = {
          id: "fail_start",
          sender: "ai",
          text: customGreeting,
          timestamp: new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages([fallbackMsg]);
        setStatus("idle");
        setTimeout(() => speakText(customGreeting), 600);
      }
    };

    triggerStart();

    return () => {
      window.speechSynthesis.cancel();
    };
  }, [role, difficulty, interviewer]);

  // Voice speech setup
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = "en-US";

      rec.onstart = () => {
        setIsRecording(true);
        setStatus("listening");
        setupAudioMicrophoneTracker();
      };

      rec.onresult = (e: any) => {
        let interimText = "";
        let finalTrans = "";
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const trans = e.results[i][0].transcript;
          if (e.results[i].isFinal) {
            finalTrans += trans;
          } else {
            interimText += trans;
          }
        }
        setTranscribingText(finalTrans || interimText);
      };

      rec.onerror = (err: any) => {
        console.error("Speech Recognition Error:", err);
        setIsRecording(false);
        setStatus("idle");
      };

      rec.onend = () => {
        setIsRecording(false);
        setStatus("idle");
        stopAudioTracker();
      };

      recognitionRef.current = rec;
    }
  }, []);

  // auto scroll
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, transcribingText]);

  const setupAudioMicrophoneTracker = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const actx = new AudioCtx();
      const source = actx.createMediaStreamSource(stream);

      const analyser = actx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      audioContextRef.current = actx;
      analyserRef.current = analyser;
      dataArrayRef.current = dataArray;

      const trackAmplitude = () => {
        if (!analyserRef.current || !dataArrayRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArrayRef.current);

        let total = 0;
        for (let i = 0; i < dataArrayRef.current.length; i++) {
          total += dataArrayRef.current[i];
        }
        const avg = total / dataArrayRef.current.length;
        setVolume(avg / 255.0);

        animationFrameRef.current = requestAnimationFrame(trackAmplitude);
      };

      trackAmplitude();
    } catch (e) {
      console.warn("Could not bind mic analyzer:", e);
    }
  };

  const stopAudioTracker = () => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
    }
    setVolume(0);
  };

  const handleMicToggle = () => {
    if (!recognitionRef.current) {
      alert("Voice speech recognition is not supported in this browser version. Feel free to type your responses.");
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      if (transcribingText) {
        setInputText(transcribingText);
        setTranscribingText("");
      }
    } else {
      window.speechSynthesis.cancel();
      recognitionRef.current.start();
    }
  };

  const handleSubmitAnswer = async () => {
    const finalAnswer = transcribingText ? transcribingText : inputText;
    if (!finalAnswer.trim()) return;

    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
    }

    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      sender: "user",
      text: finalAnswer,
      timestamp: new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputText("");
    setTranscribingText("");
    setStatus("thinking");

    try {
      const response = await fetch("/api/interview/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          difficulty,
          history: updatedMessages,
          latestAnswer: finalAnswer,
          interviewerName: interviewer.name,
          interviewerPersonality: interviewer.personality
        }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      const aiReplyItem: ChatMessage = {
        id: `msg_${Math.random().toString(36).substr(2, 9)}`,
        sender: "ai",
        text: data.reply,
        timestamp: new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, aiReplyItem]);
      setStatus("idle");
      speakText(data.reply);
    } catch (error) {
      console.error("Error replying candidate dialogue:", error);
      const fallbackReply: ChatMessage = {
        id: `msg_err_${Date.now()}`,
        sender: "ai",
        text: `Understood, that makes complete sense. Given our target goals here at ${interviewer.company}, how would you solve subsequent caching lag and data propagation delays?`,
        timestamp: new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, fallbackReply]);
      setStatus("idle");
      speakText(fallbackReply.text);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[500px] text-left">
      
      {/* AI Assessor Display Panel */}
      <div className="lg:col-span-5 bg-white border border-gray-200 rounded-3xl p-5 flex flex-col justify-between shadow-sm">
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                {difficulty} assessment sandbox
              </p>
              <h2 className="text-sm font-bold text-gray-950 uppercase mt-0.5">
                {role} track &bull; {interviewer.company}
              </h2>
            </div>

            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`p-2 rounded-xl transition-all border cursor-pointer ${
                  isMuted 
                    ? "bg-rose-50 text-rose-600 border-rose-200" 
                    : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"
                }`}
                title={isMuted ? "Unmute vocal synthesizer" : "Mute vocal synthesizer"}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>

              <button
                onClick={onAbort}
                className="p-2 text-xs bg-white border border-gray-200 hover:bg-gray-50 text-gray-500 rounded-xl transition-colors cursor-pointer"
                title="Abort session"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Assessor details */}
          <div className="bg-gray-50/50 border border-gray-150 p-4 rounded-2xl flex items-start space-x-3.5">
            <div 
              style={{ backgroundColor: interviewer.avatarColor }}
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-black/10 text-white font-bold font-sans"
            >
              {interviewer.name.split(" ").map(n => n[0]).join("")}
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-bold text-gray-950">{interviewer.name}</h3>
              <p className="text-[10px] text-gray-500 font-medium">{interviewer.title} &bull; {interviewer.company}</p>
              <div className="flex items-center space-x-1.5 mt-2 bg-indigo-50 border border-indigo-100/60 px-2 py-0.5 rounded text-[9px] text-indigo-700 font-semibold w-fit uppercase tracking-wider">
                <Info className="w-3 h-3 text-indigo-500" />
                <span>Focus: {interviewer.focusBias.split(",")[0]}</span>
              </div>
            </div>
          </div>

          {/* High efficiency avatar frequency ripple box */}
          <InterviewerAvatar status={status} volume={volume} />
        </div>

        {/* Live Audio Tracking Activity Card */}
        <div className="mt-4 bg-gray-50 border border-gray-200 p-3.5 rounded-xl flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <span className={`w-2 h-2 rounded-full ${
              status === "thinking" 
                ? "bg-yellow-500 animate-pulse" 
                : status === "listening" 
                ? "bg-emerald-500 animate-pulse" 
                : "bg-indigo-600"
            }`} />
            <span className="text-[11px] font-semibold text-gray-650">
              {status === "thinking"
                ? "Engaging cognitive assessment models..."
                : status === "speaking"
                ? "Synthesizing conversational response..."
                : status === "listening"
                ? "Capturing microphone audio spectrum..."
                : "Awaiting candidate perspective..."}
            </span>
          </div>
          {status === "thinking" && <Loader className="w-4 h-4 text-indigo-600 animate-spin" />}
        </div>
      </div>

      {/* Structured Dialogue Workspace */}
      <div className="lg:col-span-7 flex flex-col h-[520px] bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm justify-between">
        
        {/* Scroll Feed area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2.5 mb-2 text-[9px] text-gray-400 font-bold uppercase tracking-wider">
            <span>Secure stream console</span>
            <span className="text-[10px] text-indigo-600 font-mono tracking-wide font-bold">{interviewer.personality} style active</span>
          </div>

          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex max-w-[85%] flex-col ${msg.sender === "user" ? "ml-auto items-end" : "mr-auto items-start"}`}
              >
                <div className="flex items-center space-x-1.5 text-[9px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                  <span>{msg.sender === "ai" ? interviewer.name : "You"}</span>
                  <span>&bull;</span>
                  <span>{msg.timestamp}</span>
                </div>
                <div
                  className={`p-3.5 rounded-2xl leading-relaxed text-xs ${
                    msg.sender === "user"
                      ? "bg-indigo-600 text-white rounded-tr-none shadow-sm"
                      : "bg-gray-150/80 text-gray-850 rounded-tl-none border border-gray-200/50"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {/* In-flight transcribed speech elements visual block */}
            {isRecording && transcribingText && (
              <div className="flex max-w-[85%] flex-col ml-auto items-end">
                <div className="flex items-center space-x-1.5 text-[9px] font-semibold text-emerald-600 uppercase tracking-wider mb-1 animate-pulse">
                  <span>Transcribing speech waves</span>
                  <span>&bull;</span>
                  <span>Live feedback</span>
                </div>
                <div className="bg-emerald-50 border border-emerald-100 text-emerald-850 p-3.5 rounded-2xl rounded-tr-none text-xs leading-relaxed min-w-[200px]">
                  {transcribingText}
                </div>
              </div>
            )}
          </div>
          <div ref={chatBottomRef} />
        </div>

        {/* Input area dashboard */}
        <div className="border-t border-gray-150 bg-gray-50/50 p-4 space-y-3">
          <div className="flex items-center space-x-2.5">
            <button
              onClick={handleMicToggle}
              className={`p-3.5 rounded-xl border flex items-center justify-center transition-all cursor-pointer relative shrink-0 ${
                isRecording
                  ? "bg-rose-50 border-rose-300 text-rose-600 animate-pulse shadow-sm"
                  : "bg-white hover:bg-gray-50 border-gray-200 text-gray-600 hover:text-gray-800 shadow-sm"
              }`}
              title={isRecording ? "Stop recording speech state" : "Initiate microphone audio input"}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmitAnswer()}
              placeholder={isRecording ? "Listening closely... click mic to finish speaking." : "Write your detailed architectural explanation..."}
              disabled={isRecording}
              className="flex-1 bg-white border border-gray-200 focus:border-indigo-500 rounded-xl py-3 px-4 text-xs text-gray-900 placeholder-gray-400 outline-none transition-colors shadow-sm"
            />

            <button
              onClick={handleSubmitAnswer}
              disabled={status === "thinking" || (!inputText && !transcribingText)}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-100 disabled:text-gray-400 p-3 text-white rounded-xl shadow-sm hover:shadow transition-all shrink-0 cursor-pointer flex items-center justify-center border-none"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          <div className="flex justify-between items-center text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
            <span>Tip: Clearly present design tradeoffs to score extra technical benchmarks.</span>
            <button
              onClick={() => onFinishSession(messages)}
              className="text-indigo-600 hover:text-indigo-700 font-bold uppercase tracking-wider flex items-center space-x-1.5 cursor-pointer bg-white border border-gray-200 px-3.5 py-2 rounded-xl hover:bg-gray-50 shadow-xs transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Conclude and analyze</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
