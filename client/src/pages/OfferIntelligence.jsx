import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import axios from "axios";
import { ServerURL } from "../App";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  FaBriefcase,
  FaBuilding,
  FaChartLine,
  FaRocket,
  FaCheckCircle,
  FaTimesCircle,
  FaMinusCircle,
  FaBolt,
} from "react-icons/fa";

// ── Animated probability arc ─────────────────────────────────────────────────
function ProbabilityGauge({ probability, confidence }) {
  const radius = 70;
  const circumference = Math.PI * radius; // semicircle
  const offset = circumference - (circumference * Math.min(100, probability)) / 100;
  const color =
    probability >= 65 ? "#a3e635" : probability >= 40 ? "#f59e0b" : "#f87171";

  return (
    <div className="flex flex-col items-center">
      <svg width="180" height="100" viewBox="0 0 180 100">
        {/* Track */}
        <path
          d="M 10 90 A 80 80 0 0 1 170 90"
          fill="none"
          stroke="#27272a"
          strokeWidth="14"
          strokeLinecap="round"
        />
        {/* Progress */}
        <motion.path
          d="M 10 90 A 80 80 0 0 1 170 90"
          fill="none"
          stroke={color}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.4, ease: "easeOut" }}
          style={{ filter: `drop-shadow(0 0 8px ${color}88)` }}
        />
        {/* Percentage text */}
        <text
          x="90"
          y="82"
          textAnchor="middle"
          fontSize="26"
          fontWeight="700"
          fill={color}
        >
          {probability}%
        </text>
      </svg>
      <p className="text-xs text-zinc-500 mt-1">±{confidence}% confidence</p>
      <p className="text-xs text-zinc-600 mt-0.5">Offer Probability</p>
    </div>
  );
}

// ── Factor card ───────────────────────────────────────────────────────────────
function FactorCard({ factor, index }) {
  const [expanded, setExpanded] = useState(false);
  const statusConfig = {
    positive: { icon: FaCheckCircle, color: "text-lime-400", bg: "bg-lime-500/10 border-lime-500/20" },
    neutral: { icon: FaMinusCircle, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
    negative: { icon: FaTimesCircle, color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
  };
  const config = statusConfig[factor.status] || statusConfig.neutral;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -2, boxShadow: "0 0 24px rgba(163,230,53,0.08)" }}
      onClick={() => setExpanded(!expanded)}
      className={`border rounded-2xl p-4 cursor-pointer transition ${config.bg}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Icon className={config.color} size={18} />
          <div>
            <p className="text-white font-semibold text-sm">{factor.name}</p>
            <p className="text-2xl font-bold mt-1" style={{ color: factor.status === "positive" ? "#a3e635" : factor.status === "neutral" ? "#f59e0b" : "#f87171" }}>
              {factor.value}%
            </p>
          </div>
        </div>
        <div className="text-zinc-600 text-xs mt-1">{expanded ? "▲" : "▼"}</div>
      </div>
      <AnimatePresence>
        {expanded && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="text-xs text-zinc-400 mt-3 leading-relaxed"
          >
            {factor.detail}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
function OfferIntelligence() {
  const navigate = useNavigate();
  const { resumeData } = useSelector((state) => state.user);

  const [jdText, setJdText] = useState("");
  const [company, setCompany] = useState("");
  const [round, setRound] = useState("technical");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  const exampleCompanies = ["Google", "Meta", "Amazon", "Stripe", "Vercel", "Atlassian", "Microsoft", "Flipkart"];

  const handleAnalyze = async () => {
    if (!jdText.trim()) {
      toast.error("Please paste a job description.");
      return;
    }
    setAnalyzing(true);
    setResult(null);
    try {
      const res = await axios.post(
        `${ServerURL}/api/ai/offer-intelligence/analyze`,
        {
          jdText,
          company,
          round,
          resumeText: resumeData?.text || "",
        },
        { withCredentials: true }
      );
      setResult(res.data);
    } catch (err) {
      toast.error("Failed to compute offer probability. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleLaunchInterview = () => {
    if (!result?.autoInterviewConfig) return;
    // Store config and navigate to interview
    navigate("/interview");
    toast.info("Interview pre-configured for your target role gaps!");
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden px-4 py-24">
      {/* Background glows */}
      <div className="absolute w-[600px] h-[400px] bg-lime-500/15 blur-[140px] -top-40 -left-40 rounded-full" />
      <div className="absolute w-[500px] h-[400px] bg-lime-400/8 blur-[120px] -bottom-40 -right-40 rounded-full" />

      <div className="max-w-6xl mx-auto relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <p className="text-xs uppercase tracking-[0.35em] text-lime-300 mb-3">
            Offer Intelligence Engine
          </p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Know Your Hiring Odds{" "}
            <span className="text-lime-400">Before You Apply</span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-sm leading-relaxed">
            AI computes your exact offer probability for any role — factoring your resume, interview performance history, and the specific job description.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-[1fr_1fr] gap-8">
          {/* ── INPUT PANEL ── */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-5"
          >
            {/* Resume status */}
            {resumeData?.name ? (
              <div className="rounded-2xl border border-lime-500/20 bg-lime-500/5 p-4">
                <p className="text-xs text-lime-400 uppercase tracking-[0.2em] mb-1">Resume Loaded</p>
                <p className="text-white font-semibold">{resumeData.name}</p>
                <p className="text-gray-400 text-xs mt-1">Automatically included in analysis</p>
              </div>
            ) : (
              <div className="rounded-2xl border border-zinc-700 bg-zinc-900/40 p-4">
                <p className="text-xs text-zinc-500 mb-1">No resume uploaded</p>
                <button
                  onClick={() => navigate("/upload-resume")}
                  className="text-lime-400 text-sm underline"
                >
                  Upload resume for better accuracy →
                </button>
              </div>
            )}

            {/* Company quick-select */}
            <div>
              <p className="text-xs text-zinc-400 mb-2 uppercase tracking-widest">Target Company</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {exampleCompanies.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCompany(company === c ? "" : c)}
                    className={`px-3 py-1 rounded-full text-xs border transition ${
                      company === c
                        ? "border-lime-400 bg-lime-500/15 text-lime-300"
                        : "border-zinc-700 text-zinc-400 hover:border-zinc-500"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <input
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Or type company name..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-lime-400 transition"
              />
            </div>

            {/* Round */}
            <div>
              <p className="text-xs text-zinc-400 mb-2 uppercase tracking-widest">Interview Round</p>
              <div className="grid grid-cols-3 gap-2">
                {["screening", "technical", "final"].map((r) => (
                  <button
                    key={r}
                    onClick={() => setRound(r)}
                    className={`py-2 rounded-xl text-xs border capitalize transition ${
                      round === r
                        ? "border-lime-400 bg-lime-500/15 text-lime-300"
                        : "border-zinc-700 text-zinc-400 hover:border-zinc-500"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* JD Text */}
            <div>
              <p className="text-xs text-zinc-400 mb-2 uppercase tracking-widest">Job Description</p>
              <textarea
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                placeholder="Paste the full job description here..."
                rows={8}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white outline-none focus:border-lime-400 resize-none transition"
              />
              <p className="text-xs text-zinc-600 mt-1">{jdText.length} characters</p>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAnalyze}
              disabled={analyzing || !jdText.trim()}
              className="w-full bg-lime-500 hover:bg-lime-400 disabled:bg-zinc-700 disabled:text-zinc-500 text-black font-bold py-4 rounded-2xl transition shadow-[0_0_20px_rgba(163,230,53,0.3)] flex items-center justify-center gap-2"
            >
              {analyzing ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="w-4 h-4 border-2 border-black border-t-transparent rounded-full"
                  />
                  Analyzing your profile...
                </>
              ) : (
                <>
                  <FaChartLine size={16} />
                  Compute Offer Probability
                </>
              )}
            </motion.button>
          </motion.div>

          {/* ── RESULTS PANEL ── */}
          <div className="relative">
            <AnimatePresence mode="wait">
              {!result && !analyzing && (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center h-full min-h-[400px] border border-zinc-800 rounded-3xl bg-white/2"
                >
                  <div className="w-20 h-20 rounded-3xl bg-lime-500/10 flex items-center justify-center mb-4">
                    <FaChartLine size={32} className="text-lime-500/40" />
                  </div>
                  <p className="text-zinc-500 text-sm text-center max-w-xs">
                    Paste a job description and click analyze to see your offer probability and action plan.
                  </p>
                </motion.div>
              )}

              {analyzing && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center h-full min-h-[400px]"
                >
                  <div className="space-y-4 w-full">
                    {["Analyzing skill match...", "Correlating interview history...", "Computing probability..."].map(
                      (label, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.4 }}
                          className="flex items-center gap-3 bg-white/5 border border-white/5 rounded-xl p-4"
                        >
                          <motion.div
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.3 }}
                            className="w-2 h-2 bg-lime-400 rounded-full"
                          />
                          <p className="text-sm text-zinc-400">{label}</p>
                        </motion.div>
                      )
                    )}
                  </div>
                </motion.div>
              )}

              {result && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-5"
                >
                  {/* Probability gauge */}
                  <div className="border border-zinc-800 bg-black/40 rounded-3xl p-6 flex flex-col items-center">
                    <ProbabilityGauge
                      probability={result.probability}
                      confidence={result.confidenceInterval}
                    />
                    {result.probability >= 65 ? (
                      <span className="mt-3 px-3 py-1 rounded-full text-xs bg-lime-500/15 text-lime-300 border border-lime-500/20">
                        ✓ Strong Candidate
                      </span>
                    ) : result.probability < 35 ? (
                      <span className="mt-3 px-3 py-1 rounded-full text-xs bg-red-500/15 text-red-300 border border-red-500/20">
                        ⚠ Prepare more before applying
                      </span>
                    ) : (
                      <span className="mt-3 px-3 py-1 rounded-full text-xs bg-amber-500/15 text-amber-300 border border-amber-500/20">
                        ~ Moderate fit — close the gaps
                      </span>
                    )}
                  </div>

                  {/* Factor cards */}
                  {result.factors?.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs text-zinc-500 uppercase tracking-widest">Key Factors</p>
                      {result.factors.map((f, i) => (
                        <FactorCard key={i} factor={f} index={i} />
                      ))}
                    </div>
                  )}

                  {/* Recruiter perspective */}
                  {result.recruiterPerspective && (
                    <div className="border border-zinc-800 bg-white/3 rounded-2xl p-4">
                      <p className="text-xs text-zinc-500 uppercase tracking-widest mb-2">Recruiter Perspective</p>
                      <p className="text-sm text-zinc-300 italic leading-relaxed">"{result.recruiterPerspective}"</p>
                    </div>
                  )}

                  {/* Action plan */}
                  {result.actionPlan?.length > 0 && (
                    <div className="border border-lime-500/15 bg-lime-500/5 rounded-2xl p-4 space-y-3">
                      <p className="text-xs text-lime-400 uppercase tracking-widest">Action Plan</p>
                      {result.actionPlan.map((item, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <span className="w-5 h-5 bg-lime-500/20 text-lime-400 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          <div className="flex-1">
                            <p className="text-sm text-white">{item.action}</p>
                          </div>
                          <span className="text-xs text-lime-400 font-semibold whitespace-nowrap">
                            +{item.probabilityBoost}%
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Launch interview CTA */}
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleLaunchInterview}
                    className="w-full bg-black border border-lime-500/40 text-lime-400 py-3 rounded-2xl font-semibold hover:bg-lime-500/10 transition flex items-center justify-center gap-2"
                  >
                    <FaRocket size={14} />
                    Practice for This Role →
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OfferIntelligence;
