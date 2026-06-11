import React from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { FaBullseye, FaLightbulb, FaProjectDiagram } from "react-icons/fa";

function CareerPlanner() {
  const navigate = useNavigate();
  const { resumeData } = useSelector((state) => state.user);

  const cards = [
    {
      title: "Resume-to-JD Gap Map",
      desc: "Identify exactly where your resume falls short for a target role.",
      icon: <FaBullseye size={22} />,
    },
    {
      title: "Skill Bridge Plan",
      desc: "Turn missing skills into a practical, product-ready path.",
      icon: <FaLightbulb size={22} />,
    },
    {
      title: "Practice Workflow",
      desc: "Use your uploaded resume in Fit Score and interview prep for consistent results.",
      icon: <FaProjectDiagram size={22} />,
    },
  ];

  return (
    <div className="min-h-screen bg-black relative overflow-hidden px-6 py-24 text-white">
      <div className="absolute w-[520px] h-[520px] bg-lime-500/12 blur-[140px] -top-28 -left-20 rounded-full" />
      <div className="absolute w-[420px] h-[420px] bg-lime-400/10 blur-[120px] -bottom-24 -right-20 rounded-full" />

      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <p className="text-sm uppercase tracking-[0.35em] text-lime-300 mb-3">Career Planner</p>
          <h1 className="text-4xl md:text-5xl font-semibold">Real career prep, not just scores.</h1>
          <p className="text-gray-400 max-w-2xl mx-auto mt-4 leading-relaxed">
            Upload your resume once and activate a practical product-style workflow for resume improvement and interview readiness.
          </p>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-3 mb-12">
          {cards.map((card, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15 }}
              whileHover={{ y: -6, scale: 1.02 }}
              className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_0_30px_rgba(0,0,0,0.2)]"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-lime-500/10 text-lime-300 mb-5">
                {card.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3">{card.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{card.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-white/10 bg-black/30 p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-white text-2xl font-semibold">{resumeData?.name ? "Resume synced and ready" : "Upload a resume to begin"}</p>
              <p className="text-gray-400 mt-2">
                {resumeData?.name
                  ? "Your uploaded resume is now available across Fit Score and interview setup."
                  : "The best career workflow starts with your resume."}
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                onClick={() => navigate("/upload-resume")}
                className="rounded-2xl bg-lime-500 px-6 py-3 text-black font-semibold hover:bg-lime-600 transition"
              >
                Upload Resume
              </button>
              <button
                onClick={() => navigate("/fit-score")}
                className="rounded-2xl border border-white/10 px-6 py-3 text-white hover:bg-white/10 transition"
              >
                Run Fit Score
              </button>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <p className="text-sm text-lime-300 uppercase tracking-[0.3em] mb-3">How it works</p>
              <p className="text-gray-400 text-sm leading-relaxed">
                The app stores your resume details so every evaluation remains consistent and real-world focused.
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <p className="text-sm text-lime-300 uppercase tracking-[0.3em] mb-3">What you gain</p>
              <ul className="list-disc list-inside text-gray-400 text-sm space-y-2">
                <li>Shared resume data across features</li>
                <li>Targeted job description gap planning</li>
                <li>Interview-ready skill actions</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default CareerPlanner;
