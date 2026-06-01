import React, { useState, useEffect } from "react";
import { getSupabaseClient, getLocalMockUser } from "../lib/supabaseClient";
import { SupabaseConfig } from "../types";
import { Key, Shield, LogIn, UserPlus, Database, Check, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AuthProps {
  onAuthSuccess: (userId: string, email: string) => void;
}

export default function SupabaseAuth({ onAuthSuccess }: AuthProps) {
  const [activeTab, setActiveTab] = useState<"login" | "signup" | "credentials">("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Supabase Custom Settings states
  const [dbUrl, setDbUrl] = useState("");
  const [anonKey, setAnonKey] = useState("");
  const [credentialsSaved, setCredentialsSaved] = useState(false);

  // Check if credentials exist on load
  useEffect(() => {
    const saved = localStorage.getItem("supabase_custom_config");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setDbUrl(parsed.url || "");
        setAnonKey(parsed.anonKey || "");
        setCredentialsSaved(true);
      } catch (_) {}
    }
  }, []);

  const handleSaveCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dbUrl || !anonKey) {
      setMessage({ type: "error", text: "Please enter both your Supabase URL and Anon Key." });
      return;
    }
    const config: SupabaseConfig = { url: dbUrl.trim(), anonKey: anonKey.trim() };
    localStorage.setItem("supabase_custom_config", JSON.stringify(config));
    setCredentialsSaved(true);
    setMessage({ type: "success", text: "Database credentials configured. Ready to run." });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleClearCredentials = () => {
    localStorage.removeItem("supabase_custom_config");
    setDbUrl("");
    setAnonKey("");
    setCredentialsSaved(false);
    setMessage({ type: "success", text: "Database reset to local storage container." });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleAuthentication = async (type: "login" | "signup") => {
    if (!email || !password) {
      setMessage({ type: "error", text: "Please supply an email and password." });
      return;
    }

    setLoading(true);
    setMessage(null);

    const supabase = getSupabaseClient();

    if (!supabase) {
      // Local premium Sandbox fallback
      setTimeout(() => {
        setLoading(false);
        const mockUserId = getLocalMockUser();
        localStorage.setItem("authenticated_user_email", email);
        localStorage.setItem("authenticated_user_id", mockUserId);
        onAuthSuccess(mockUserId, email);
      }, 1000);
      return;
    }

    try {
      if (type === "signup") {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage({
          type: "success",
          text: data.user?.identities?.length === 0
            ? "Account already exists. Launching session..."
            : "Registration complete. Please sign in."
        });
        if (data.user?.identities?.length === 0) {
          const { data: logData, error: logErr } = await supabase.auth.signInWithPassword({ email, password });
          if (logErr) throw logErr;
          onAuthSuccess(logData.user.id, logData.user.email || email);
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onAuthSuccess(data.user.id, data.user.email || email);
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "An authentication error occurred." });
    } finally {
      setLoading(false);
    }
  };

  const handleSandboxBypass = () => {
    const mockId = getLocalMockUser();
    const guestEmail = "candidate@aura-interview.work";
    localStorage.setItem("authenticated_user_email", guestEmail);
    localStorage.setItem("authenticated_user_id", mockId);
    onAuthSuccess(mockId, guestEmail);
  };

  return (
    <div className="w-full max-w-sm mx-auto bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-11 h-11 bg-indigo-50 border border-indigo-100 rounded-xl mb-3 text-indigo-600">
          <Shield className="w-5 h-5" />
        </div>
        <h2 className="text-lg font-bold text-gray-950 tracking-tight">Access Technical Suite</h2>
        <p className="text-xs text-gray-500 mt-1">Configure database connectivity or sign in to save results</p>
      </div>

      {/* Modern tab selectors */}
      <div className="flex bg-gray-50 p-1 rounded-lg mb-6 border border-gray-100">
        <button
          onClick={() => setActiveTab("credentials")}
          className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all relative ${
            activeTab === "credentials" ? "bg-white text-gray-950 shadow-sm" : "text-gray-500 hover:text-gray-800"
          }`}
        >
          <span>Database</span>
        </button>
        <button
          onClick={() => setActiveTab("login")}
          className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all relative ${
            activeTab === "login" ? "bg-white text-gray-950 shadow-sm" : "text-gray-500 hover:text-gray-800"
          }`}
        >
          <span>Sign In</span>
        </button>
        <button
          onClick={() => setActiveTab("signup")}
          className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all relative ${
            activeTab === "signup" ? "bg-white text-gray-950 shadow-sm" : "text-gray-500 hover:text-gray-800"
          }`}
        >
          <span>Create Account</span>
        </button>
      </div>

      <AnimatePresence mode="wait">
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`flex items-start space-x-2 border rounded-lg p-3 text-xs mb-4 ${
              message.type === "success"
                ? "bg-emerald-50/50 border-emerald-200 text-emerald-800"
                : "bg-rose-50/50 border-rose-200 text-rose-800"
            }`}
          >
            {message.type === "success" ? <Check className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" /> : <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />}
            <span>{message.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {activeTab === "credentials" && (
          <motion.form
            key="cred-tab"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSaveCredentials}
            className="space-y-4 text-left"
          >
            <div>
              <label className="block text-[11px] font-semibold text-gray-700 uppercase tracking-wider mb-1">Supabase Endpoint URL</label>
              <div className="relative">
                <Database className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={dbUrl}
                  onChange={(e) => setDbUrl(e.target.value)}
                  placeholder="https://your-project.supabase.co"
                  className="w-full bg-white border border-gray-200 focus:border-indigo-500 rounded-lg py-2 pl-9 pr-3 text-xs text-gray-900 placeholder-gray-400 outline-none transition-colors shadow-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-700 uppercase tracking-wider mb-1">Anon Public Key</label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  value={anonKey}
                  onChange={(e) => setAnonKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                  className="w-full bg-white border border-gray-200 focus:border-indigo-500 rounded-lg py-2 pl-9 pr-3 text-xs text-gray-900 placeholder-gray-400 outline-none transition-colors shadow-none"
                />
              </div>
            </div>

            <div className="pt-2 flex space-x-2">
              <button
                type="submit"
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs py-2 px-4 rounded-lg shadow-sm hover:shadow transition-all cursor-pointer text-center"
              >
                Apply Connection
              </button>
              {credentialsSaved && (
                <button
                  type="button"
                  onClick={handleClearCredentials}
                  className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 text-xs py-2 px-3 rounded-lg transition-colors cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>

            <div className="bg-gray-50 border border-gray-100 p-3 rounded-lg text-xs text-gray-500 leading-relaxed font-sans">
              <span className="font-semibold text-gray-700">Storage note:</span> Credentials are saved locally on your device. Leave them blank to run in sandbox memory mode.
            </div>
          </motion.form>
        )}

        {(activeTab === "login" || activeTab === "signup") && (
          <motion.div
            key="auth-tab"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4 text-left"
          >
            <div>
              <label className="block text-[11px] font-semibold text-gray-700 uppercase tracking-wider mb-1">Work Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="developer@aura.interview"
                className="w-full bg-white border border-gray-200 focus:border-indigo-500 rounded-lg py-2 px-3 text-xs text-gray-900 placeholder-gray-400 outline-none transition-colors shadow-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-700 uppercase tracking-wider mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Account password"
                className="w-full bg-white border border-gray-200 focus:border-indigo-500 rounded-lg py-2 px-3 text-xs text-gray-900 placeholder-gray-400 outline-none transition-colors shadow-none"
              />
            </div>

            <div className="pt-2">
              <button
                onClick={() => handleAuthentication(activeTab)}
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 text-white font-medium text-xs py-2 px-4 rounded-lg shadow-sm hover:shadow transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{activeTab === "login" ? "Sign In" : "Register Account"}</span>
                    <LogIn className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative flex py-3 items-center">
        <div className="flex-grow border-t border-gray-200"></div>
        <span className="flex-shrink mx-3 text-[10px] font-medium text-gray-400 uppercase tracking-wider">or</span>
        <div className="flex-grow border-t border-gray-200"></div>
      </div>

      <button
        onClick={handleSandboxBypass}
        className="w-full bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 font-medium text-xs py-2.5 px-4 rounded-lg transition-colors cursor-pointer text-center"
      >
        Enterprise Cloud Demo (Sandbox)
      </button>
    </div>
  );
}
