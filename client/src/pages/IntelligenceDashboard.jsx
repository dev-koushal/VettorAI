import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import axios from "axios";
import { ServerURL } from "../App";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FaBolt,
  FaArrowRight,
  FaTrendingUp,
  FaTrendingDown,
  FaEquals,
  FaBrain,
  FaExclamationTriangle,
  FaCalendar,
} from "react-icons/fa";

// ── Readiness Ring ────────────────────────────────────────────────────────────
function ReadinessRing({ percent, targetRole }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (circumference * Math.min(100, percent)) / 100;
  const color = percent >= 75 ? "#a3e635" : percent >= 45 ? "#f59e0b" : "#f87171";

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-32">
        <svg className="w-32 h-32 -rotate-90" viewBox="0 0 130 130">
          <circle cx="65" cy="65" r={radius} stroke="#27272a" strokeWidth="10" fill="transparent" />
          <motion.circle
            cx="65"
            cy="65"
            r={radius}
            stroke={color}
            strokeWidth="10"
            fill="transparent"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            style={{ filter: `drop-shadow(0 0 6px ${color}66)` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold" style={{ color }}>
            {percent}%
          </span>
          <span className="text-xs text-zinc-500">ready</span>
        </div>
      </div>
      <p className="text-xs text-zinc-400 mt-2 text-center">Interview Readiness</p>
    </div>
  );
}

// ── Mastery Bar ───────────────────────────────────────────────────────────────
function MasteryBar({ topic, avgScore, masteryLevel, masteryColor, velocity, daysSincePractice, index }) {
  const colorMap = {
    red: { bar: "bg-red-400", text: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
    amber: { bar: "bg-amber-400", text: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
    lime: { bar: "bg-lime-400", text: "text-lime-400", bg: "bg-lime-500/10 border-lime-500/20" },
    emerald: { bar: "bg-emerald-400", text: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  };
  const c = colorMap[masteryColor] || colorMap.red;
  const pct = (avgScore / 10) * 100;
  const VelocityIcon =
    velocity === "improving" ? FaTrendingUp : velocity === "declining" ? FaTrendingDown : FaEquals;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06 }}
      className="flex items-center gap-3"
    >
      <div className="w-28 text-xs text-zinc-400 flex-shrink-0 truncate">{topic}</div>
      <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${c.bar}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, delay: index * 0.06 + 0.2, ease: "easeOut" }}
        />
      </div>
      <span className={`text-xs font-semibold w-8 text-right ${c.text}`}>{avgScore}</span>
      <span className={`text-xs px-1.5 py-0.5 rounded-md border w-20 text-center flex-shrink-0 ${c.bg} ${c.text}`}>
        {masteryLevel}
      </span>
      <VelocityIcon
        size={10}
        className={velocity === "improving" ? "text-lime-400" : velocity === "declining" ? "text-red-400" : "text-zinc-600"}
      />
    </motion.div>
  );
}

// ── Session sparkline ─────────────────────────────────────────────────────────
function Sparkline({ scores }) {
  if (!scores || scores.length < 2) return null;
  const max = Math.max(...scores, 10);
  const min = Math.min(...scores, 0);
  const w = 120;
  const h = 36;
  const pts = scores.map(
    (s, i) => `${(i / (scores.length - 1)) * w},${h - ((s - min) / (max - min || 1)) * h}`
  );
  const polyline = pts.join(" ");

  return (
    <svg width={w} height={h} className="overflow-visible">
      <polyline
        points={polyline}
        fill="none"
        stroke="#a3e635"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {scores.map((s, i) => (
        <circle
          key={i}
          cx={(i / (scores.length - 1)) * w}
          cy={h - ((s - min) / (max - min || 1)) * h}
          r="2.5"
          fill="#a3e635"
        />
      ))}
    </svg>
  );
}

// ── Main IntelligenceDashboard ────────────────────────────────────────────────
function IntelligenceDashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${ServerURL}/api/ai/intelligence/profile`, {
          withCredentials: true,
        });
        setProfile(res.data);
      } catch {
        toast.error("Failed to load intelligence profile.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="space-y-4 w-full max-w-2xl px-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-12 bg-zinc-900 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const { sessionCount, insufficientData, topicMastery, readiness, trend, regression, todayPrescription, weeklyBriefing } = profile;

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden px-4 py-24">
      {/* Background glows */}
      <div className="absolute w-[600px] h-[400px] bg-lime-500/12 blur-[150px] -top-40 -left-40 rounded-full" />
      <div className="absolute w-[500px] h-[400px] bg-lime-400/8 blur-[120px] -bottom-40 -right-40 rounded-full" />

      <div className="max-w-5xl mx-auto relative space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs uppercase tracking-[0.35em] text-lime-300 mb-2">Adaptive Intelligence Core</p>
          <h1 className="text-3xl md:text-4xl font-bold">Your Intelligence Profile</h1>
          <p className="text-gray-400 text-sm mt-2">
            {sessionCount} session{sessionCount !== 1 ? "s" : ""} analyzed ·{" "}
            {insufficientData ? "Complete 3+ sessions to unlock full profile" : "Profile active"}
          </p>
        </motion.div>

        {/* Regression Alert */}
        <AnimatePresence>
          {regression?.isActive && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="border border-red-500/30 bg-red-500/8 rounded-2xl p-4 flex items-start gap-3"
            >
              <FaExclamationTriangle className="text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-red-300 font-semibold text-sm">Performance Regression Detected</p>
                <p className="text-zinc-400 text-xs mt-1">{regression.likelyCause}</p>
                <button
                  onClick={() => navigate("/interview")}
                  className="mt-2 text-xs text-red-400 underline"
                >
                  Start a recovery session →
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main grid: readiness + mastery */}
        <div className="grid md:grid-cols-[auto_1fr] gap-6">
          {/* Readiness panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="border border-zinc-800 bg-black/40 rounded-3xl p-6 flex flex-col items-center gap-4 min-w-[200px]"
          >
            <ReadinessRing percent={readiness.percent} />

            <div className="text-center">
              <p className="text-sm text-zinc-400">
                Overall avg:{" "}
                <span className="text-white font-semibold">{readiness.overallAvgScore}/10</span>
              </p>
              {readiness.daysToReady > 0 ? (
                <p className="text-xs text-zinc-600 mt-1">
                  ~{readiness.daysToReady} sessions to interview-ready
                </p>
              ) : (
                <p className="text-xs text-lime-400 mt-1">✓ Interview ready!</p>
              )}
            </div>

            {/* Trend sparkline */}
            {trend?.sessionScores?.length >= 2 && (
              <div className="flex flex-col items-center gap-1">
                <Sparkline scores={trend.sessionScores} />
                <p className="text-xs text-zinc-600">
                  {trend.direction === "improving" ? "↗" : trend.direction === "declining" ? "↘" : "→"}{" "}
                  {trend.direction}{" "}
                  <span className={trend.delta > 0 ? "text-lime-400" : trend.delta < 0 ? "text-red-400" : "text-zinc-500"}>
                    ({trend.delta > 0 ? "+" : ""}{trend.delta} pts)
                  </span>
                </p>
              </div>
            )}
          </motion.div>

          {/* Mastery map */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="border border-zinc-800 bg-black/40 rounded-3xl p-6"
          >
            <p className="text-xs text-zinc-500 uppercase tracking-widest mb-4">Mastery Map</p>
            {insufficientData ? (
              <div className="flex flex-col items-center justify-center h-32">
                <div className="w-full space-y-3 opacity-30 pointer-events-none select-none">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-28 h-2 bg-zinc-700 rounded" />
                      <div className="flex-1 h-2 bg-zinc-800 rounded" />
                      <div className="w-8 h-2 bg-zinc-700 rounded" />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-zinc-500 mt-4">
                  Complete {Math.max(0, 3 - sessionCount)} more session{3 - sessionCount !== 1 ? "s" : ""} to unlock
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {topicMastery.map((t, i) => (
                  <MasteryBar key={t.topic} {...t} index={i} />
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Today's Prescription */}
        {todayPrescription && !insufficientData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="border border-lime-500/20 bg-lime-500/5 rounded-3xl p-6"
          >
            <p className="text-xs text-lime-400 uppercase tracking-widest mb-3">
              Today's Prescription
            </p>
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex items-start gap-3 flex-1">
                <div className="w-10 h-10 rounded-2xl bg-lime-500/15 flex items-center justify-center flex-shrink-0">
                  <FaBolt className="text-lime-400" size={16} />
                </div>
                <div>
                  <p className="text-white font-semibold">{todayPrescription.topic}</p>
                  <p className="text-zinc-400 text-sm mt-0.5">{todayPrescription.reason}</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/interview")}
                className="flex items-center gap-2 bg-lime-500 hover:bg-lime-400 text-black font-bold px-6 py-3 rounded-2xl transition shadow-[0_0_16px_rgba(163,230,53,0.3)] whitespace-nowrap"
              >
                Start Recommended Session <FaArrowRight size={12} />
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Weekly Briefing */}
        {weeklyBriefing && !insufficientData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="border border-zinc-800 bg-black/30 rounded-3xl p-6 space-y-4"
          >
            <div className="flex items-center gap-2">
              <FaBrain className="text-lime-400" size={14} />
              <p className="text-xs text-zinc-400 uppercase tracking-widest">Intelligence Briefing</p>
              {weeklyBriefing.sessionsThisWeek > 0 && (
                <span className="ml-auto text-xs bg-lime-500/15 text-lime-400 px-2 py-0.5 rounded-full">
                  {weeklyBriefing.sessionsThisWeek} session{weeklyBriefing.sessionsThisWeek !== 1 ? "s" : ""} this week
                </span>
              )}
            </div>

            <p className="text-sm text-zinc-300 leading-relaxed">{weeklyBriefing.progressSummary}</p>

            <div className="grid grid-cols-2 gap-3">
              {weeklyBriefing.topGap && (
                <div className="bg-red-500/8 border border-red-500/15 rounded-xl p-3">
                  <p className="text-xs text-red-400 mb-1">Top Gap</p>
                  <p className="text-sm text-white font-semibold">{weeklyBriefing.topGap}</p>
                </div>
              )}
              {weeklyBriefing.strongestArea && (
                <div className="bg-lime-500/8 border border-lime-500/15 rounded-xl p-3">
                  <p className="text-xs text-lime-400 mb-1">Strongest Area</p>
                  <p className="text-sm text-white font-semibold">{weeklyBriefing.strongestArea}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Empty state */}
        {insufficientData && sessionCount === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 border border-zinc-800 rounded-3xl bg-white/2"
          >
            <div className="w-16 h-16 bg-lime-500/10 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <FaBrain size={28} className="text-lime-500/40" />
            </div>
            <p className="text-white font-semibold mb-2">No interview history yet</p>
            <p className="text-zinc-500 text-sm mb-6">Complete 3 sessions to unlock your Intelligence Profile</p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/interview")}
              className="bg-lime-500 text-black font-bold px-8 py-3 rounded-2xl shadow-[0_0_16px_rgba(163,230,53,0.3)]"
            >
              Start First Interview
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default IntelligenceDashboard;
