import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

function ReportIW({ report }) {
  const navigate = useNavigate();

  if (!report) return null;

  const {
    finalScore,
    confidence,
    communication,
    correctness,
    structure,
    depth,
    questionWiseScore,
  } = report;

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-black to-lime-950 relative overflow-hidden px-4">

      {/* background glow */}
      <div className="absolute w-[600px] h-[400px] bg-lime-500/20 blur-[120px] -top-40 -left-40 rounded-full" />
      <div className="absolute w-[600px] h-[400px] bg-lime-500/10 blur-[120px] -bottom-40 -right-40 rounded-full" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl bg-white/10 backdrop-blur-xl border border-lime-500/20 rounded-2xl my-30 p-8 shadow-xl z-10"
      >

        {/* Title */}
        <h1 className="text-3xl font-semibold text-lime-400 mb-6">
          Interview Report
        </h1>

        {/* Final Score */}
        <div className="bg-black/60 border border-lime-500/20 rounded-xl p-6 mb-6">
          <p className="text-zinc-400 text-sm mb-2">Final Score</p>
          <h2 className="text-5xl font-bold text-lime-400">
            {finalScore}
          </h2>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-4 mb-6">

          <div className="bg-black/60 border border-lime-500/20 rounded-lg p-4 text-center">
            <p className="text-xs text-zinc-400 mb-1">Confidence</p>
            <p className="text-2xl text-lime-400 font-semibold">{confidence}</p>
          </div>

          <div className="bg-black/60 border border-lime-500/20 rounded-lg p-4 text-center">
            <p className="text-xs text-zinc-400 mb-1">Communication</p>
            <p className="text-2xl text-lime-400 font-semibold">{communication}</p>
          </div>

          <div className="bg-black/60 border border-lime-500/20 rounded-lg p-4 text-center">
            <p className="text-xs text-zinc-400 mb-1">Correctness</p>
            <p className="text-2xl text-lime-400 font-semibold">{correctness}</p>
          </div>
          <div className="bg-black/60 border border-lime-500/20 rounded-lg p-4 text-center">
            <p className="text-xs text-zinc-400 mb-1">Structure</p>
            <p className="text-2xl text-lime-400 font-semibold">{structure}</p>
          </div>
          <div className="bg-black/60 border border-lime-500/20 rounded-lg p-4 text-center">
            <p className="text-xs text-zinc-400 mb-1">Depth</p>
            <p className="text-2xl text-lime-400 font-semibold">{depth}</p>
          </div>
          <div className="bg-black/60 border border-lime-500/20 rounded-lg p-4 text-center">
            <p className="text-xs text-zinc-400 mb-1">Average</p>
            <p className="text-2xl text-lime-400 font-semibold">{(depth+confidence+communication+correctness+structure)/5}</p>
          </div>

        </div>

        {/* Question wise score */}
        <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2">
          {questionWiseScore?.map((q, i) => (
            <div
              key={i}
              className="bg-black/60 border border-lime-500/20 rounded-lg p-4 flex justify-between text-sm text-zinc-300"
            >
              <span>Question {i + 1}</span>
              <span className="text-lime-400 font-medium">
                Score: {q.score ?? "-"}
              </span>
            </div>
          ))}
        </div>

        {/* Action */}
        <button
          onClick={() => navigate("/history")}
          className="mt-6 w-full bg-lime-500 hover:bg-lime-400 text-black font-semibold py-3 rounded-lg transition"
        >
          View Detailed Report
        </button>

      </motion.div>
    </div>
  );
}

export default ReportIW;