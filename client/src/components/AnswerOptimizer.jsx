import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import axios from "axios";
import { ServerURL } from "../App";
import { toast } from "react-toastify";
import { FaBolt, FaCopy, FaCheck } from "react-icons/fa";

// ── Animated score delta ──────────────────────────────────────────────────────
function ScoreDelta({ label, original, optimized }) {
  const delta = optimized - original;
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-zinc-500 w-20">{label}</span>
      <span className="text-zinc-400">{original}</span>
      <span className="text-zinc-600">→</span>
      <span className={optimized >= 7 ? "text-lime-400 font-bold" : "text-amber-400 font-bold"}>
        {optimized}
      </span>
      {delta !== 0 && (
        <span className={delta > 0 ? "text-lime-400" : "text-red-400"}>
          ({delta > 0 ? "+" : ""}{delta})
        </span>
      )}
    </div>
  );
}

// ── Diff view ─────────────────────────────────────────────────────────────────
function DiffView({ original, optimized }) {
  return (
    <div className="grid md:grid-cols-2 gap-3">
      <div>
        <p className="text-xs text-zinc-500 uppercase tracking-widest mb-2">Original</p>
        <p className="text-xs text-zinc-400 leading-relaxed bg-zinc-900/50 border border-zinc-700 rounded-xl p-3">
          {original}
        </p>
      </div>
      <div>
        <p className="text-xs text-lime-400 uppercase tracking-widest mb-2">Optimized ✓</p>
        <p className="text-xs text-white leading-relaxed bg-lime-500/8 border border-lime-500/20 rounded-xl p-3">
          {optimized}
        </p>
      </div>
    </div>
  );
}

// ── Main optimizer card (embedded in InterviewReport per question) ────────────
function AnswerOptimizer({ question, answer, scores, interviewId, questionIndex }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [view, setView] = useState("diff"); // 'diff' | 'why'

  const needsOptimization = (scores?.finalScore || 0) < 8;

  const handleOptimize = async () => {
    if (loading) return;
    setLoading(true);
    setOpen(true);
    try {
      const res = await axios.post(
        `${ServerURL}/api/ai/optimizer/optimize`,
        { interviewId, questionIndex },
        { withCredentials: true }
      );
      setResult(res.data);
    } catch (err) {
      toast.error("Optimization failed. Please try again.");
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result?.optimizedAnswer) return;
    navigator.clipboard.writeText(result.optimizedAnswer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!needsOptimization && !result) {
    return (
      <div className="mt-3 flex items-center gap-2 text-xs text-zinc-600">
        <span className="text-lime-400">✓</span> Score {scores?.finalScore}/10 — already strong!
      </div>
    );
  }

  return (
    <div className="mt-3">
      {!open && (
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleOptimize}
          className="flex items-center gap-2 text-xs border border-lime-500/30 text-lime-400 px-3 py-1.5 rounded-lg hover:bg-lime-500/10 transition"
        >
          <FaBolt size={10} />
          Optimize This Answer →
        </motion.button>
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 border border-lime-500/20 bg-black/40 rounded-2xl overflow-hidden"
          >
            {loading ? (
              <div className="p-6 space-y-3">
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="w-4 h-4 border-2 border-lime-400 border-t-transparent rounded-full"
                  />
                  <p className="text-sm text-zinc-400">AI is rewriting to 9+/10...</p>
                </div>
                {["Diagnosing weaknesses...", "Rewriting with your experience...", "Validating scores..."].map(
                  (s, i) => (
                    <motion.p
                      key={i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.8 }}
                      className="text-xs text-zinc-600 pl-6"
                    >
                      {s}
                    </motion.p>
                  )
                )}
              </div>
            ) : result ? (
              <div className="p-5 space-y-4">
                {/* Header: score delta summary */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-zinc-500">Score:</span>
                    <span className="text-zinc-400 text-sm">{result.originalScores.finalScore}/10</span>
                    <span className="text-zinc-600">→</span>
                    <span className="text-lime-400 font-bold">{result.optimizedScores.finalScore}/10</span>
                    <span className="text-xs bg-lime-500/20 text-lime-400 px-2 py-0.5 rounded-full">
                      +{result.scoreDelta} improvement
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setView(view === "diff" ? "why" : "diff")}
                      className="text-xs text-zinc-500 border border-zinc-700 px-2 py-1 rounded-lg hover:border-lime-400 hover:text-lime-400 transition"
                    >
                      {view === "diff" ? "Why It Works" : "Show Diff"}
                    </button>
                    <button
                      onClick={handleCopy}
                      className="text-xs text-zinc-500 border border-zinc-700 px-2 py-1 rounded-lg hover:border-lime-400 hover:text-lime-400 transition flex items-center gap-1"
                    >
                      {copied ? <FaCheck size={10} /> : <FaCopy size={10} />}
                      {copied ? "Copied!" : "Copy"}
                    </button>
                    <button
                      onClick={() => setOpen(false)}
                      className="text-xs text-zinc-600 hover:text-white transition"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* Score axis deltas */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 bg-black/30 rounded-xl p-3">
                  {["confidence", "communication", "correctness", "structure", "depth"].map((ax) => (
                    <ScoreDelta
                      key={ax}
                      label={ax.charAt(0).toUpperCase() + ax.slice(1)}
                      original={result.originalScores[ax] || 0}
                      optimized={result.optimizedScores[ax] || 0}
                    />
                  ))}
                </div>

                {/* Main content: diff or why */}
                <AnimatePresence mode="wait">
                  {view === "diff" ? (
                    <motion.div key="diff" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <DiffView original={answer} optimized={result.optimizedAnswer} />
                    </motion.div>
                  ) : (
                    <motion.div key="why" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs text-zinc-400 uppercase tracking-widest">Why This Works</span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
                            {result.frameworkName}
                          </span>
                        </div>
                        {result.whyItWorks.map((bullet, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.08 }}
                            className="flex items-start gap-2 text-xs text-zinc-300"
                          >
                            <span className="text-lime-400 mt-0.5 flex-shrink-0">→</span>
                            <span>{bullet}</span>
                          </motion.div>
                        ))}
                        {result.diagnosis?.weakAxes?.length > 0 && (
                          <div className="mt-3 p-3 bg-amber-500/8 border border-amber-500/15 rounded-xl">
                            <p className="text-xs text-amber-400 mb-1">Fixed Weaknesses:</p>
                            <div className="flex flex-wrap gap-1">
                              {result.diagnosis.weakAxes.map((ax, i) => (
                                <span key={i} className="text-xs bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded-full">
                                  {ax}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Iterations badge */}
                {result.iterations > 1 && (
                  <p className="text-xs text-zinc-600 text-right">
                    AI iterated {result.iterations}x to reach this score
                  </p>
                )}
              </div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AnswerOptimizer;
