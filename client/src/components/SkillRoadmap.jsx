import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { motion } from "motion/react";
import { FaSearch, FaBolt, FaRocket, FaSpinner } from "react-icons/fa";
import axios from "axios";

function SkillRoadmap({ jd }) {
  const ServerURL = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";
  const resumeData = useSelector((state) => state.user.resumeData);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [jdInput, setJdInput] = useState(jd || "");

  const fallbackSteps = [
    {
      title: "Global Resume Sync",
      desc: "Upload once and reuse your resume across Fit Score, Interview Setup, and career planning.",
      type: "info",
    },
    {
      title: "JD Gap Analysis",
      desc: "Highlight the exact skills missing from your resume for the target role.",
      type: "info",
    },
    {
      title: "Bridge the Gap",
      desc: "Choose project-backed skills that match the job description.",
      type: "skill",
    },
    {
      title: "Build Product Evidence",
      desc: "Convert learning into a real work sample that proves your ability.",
      type: "action",
    },
    {
      title: "Mock Interview Practice",
      desc: "Use your resume details consistently while practicing real questions.",
      type: "action",
    },
    {
      title: "Polish Your Resume",
      desc: "Refine your messaging with the exact language hiring managers want.",
      type: "skill",
    },
  ];

  useEffect(() => {
    if (resumeData?.text && jdInput) {
      fetchRecommendations();
    }
  }, [resumeData?.text, jdInput]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(`${ServerURL}/api/feature/skill-roadmap`, {
        resumeText: resumeData?.text || "",
        jobDescription: jdInput,
      });

      const recs = response.data.recommendations || [];
      setRecommendations(recs.length > 0 ? recs : fallbackSteps);
    } catch (err) {
      console.error("Error fetching skill roadmap:", err);
      setError(err.response?.data?.message || "Failed to fetch recommendations");
      setRecommendations(fallbackSteps);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateRoadmap = () => {
    if (!jdInput.trim()) {
      setError("Please enter a job description");
      return;
    }
    fetchRecommendations();
  };

  const displaySteps = recommendations.length > 0 ? recommendations : fallbackSteps;

  return (
    <div className="min-h-screen bg-black relative overflow-hidden px-6 py-24 text-white">
      <div className="absolute w-[520px] h-[520px] bg-lime-500/12 blur-[150px] -top-28 -left-20 rounded-full" />
      <div className="absolute w-[480px] h-[480px] bg-lime-400/10 blur-[120px] -bottom-24 -right-20 rounded-full" />

      <div className="max-w-6xl mx-auto relative">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <p className="text-sm uppercase tracking-[0.35em] text-lime-300 mb-3">Skill Roadmap</p>
          <h1 className="text-4xl md:text-5xl font-semibold">
            Bridge your resume and JD with a practical product-ready plan.
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto mt-4 leading-relaxed">
            See the concrete steps from uploaded resume strengths to missing job-specific skills, then turn them into real outcomes.
          </p>
        </motion.div>

        {/* Job Description Input */}
        {!jd && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12 bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
            <label className="block mb-4">
              <p className="text-lime-300 uppercase tracking-[0.3em] text-xs mb-3">Enter Target Job Description</p>
              <textarea
                value={jdInput}
                onChange={(e) => setJdInput(e.target.value)}
                placeholder="Paste the job description or role requirements..."
                className="w-full bg-black/50 border border-lime-400/20 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-lime-400 resize-none"
                rows="5"
              />
            </label>
            <button
              onClick={handleGenerateRoadmap}
              disabled={loading}
              className="w-full bg-lime-500 text-black font-semibold py-3 rounded-xl hover:bg-lime-400 disabled:bg-gray-600 transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" /> Generating Roadmap...
                </>
              ) : (
                "Generate Skill Roadmap"
              )}
            </button>
          </motion.div>
        )}

        {/* Error Message */}
        {error && !jdInput && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300">
            {error}
          </motion.div>
        )}

        {/* Resume Status */}
        {resumeData?.text && jdInput && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-green-300 text-sm">
            ✓ Resume loaded • ✓ Job description ready
          </motion.div>
        )}

        {/* Loading State */}
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative mb-16">
            <div className="absolute left-1/2 top-8 h-[calc(100%-2rem)] w-1 -translate-x-1/2 bg-lime-500/20" />
            {[...Array(3)].map((_, i) => (
              <div key={i} className="relative mb-16 flex flex-col md:flex-row items-start gap-6">
                <div className="md:w-1/2">
                  <div className="w-[90px] h-[90px] rounded-3xl bg-lime-500/10 border border-lime-400/20 animate-pulse" />
                </div>
                <div className="md:w-1/2 bg-white/5 border border-white/10 rounded-3xl p-8 animate-pulse">
                  <div className="h-4 bg-gray-700 rounded w-20 mb-3" />
                  <div className="h-6 bg-gray-700 rounded w-40 mb-3" />
                  <div className="h-4 bg-gray-700 rounded w-full mb-2" />
                  <div className="h-4 bg-gray-700 rounded w-5/6" />
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Recommendations Steps */}
        {!loading && (
          <div className="relative">
            <div className="absolute left-1/2 top-8 h-[calc(100%-2rem)] w-1 -translate-x-1/2 bg-lime-500/20" />

            {displaySteps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.12 }}
                className={`relative mb-16 flex flex-col md:flex-row items-start gap-6 ${
                  index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                <div className="md:w-1/2">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="w-[90px] h-[90px] rounded-3xl bg-lime-500/10 border border-lime-400/20 flex items-center justify-center text-lime-300 shadow-[0_0_20px_rgba(163,230,53,0.12)]"
                  >
                    {step.type === "info" && <FaSearch size={28} />}
                    {step.type === "skill" && <FaBolt size={28} />}
                    {step.type === "action" && <FaRocket size={28} />}
                  </motion.div>
                </div>

                <motion.div whileHover={{ y: -4 }} className="md:w-1/2 bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
                  <p className="text-lime-400 uppercase tracking-[0.3em] text-xs mb-3">
                    {step.type === "info" ? "Insight" : step.type === "skill" ? "Skill" : "Action"}
                  </p>
                  <h2 className="text-2xl font-semibold mb-3">{step.title}</h2>
                  <p className="text-gray-400 leading-relaxed">{step.desc}</p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        )}

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.8 }} className="mt-10 rounded-3xl border border-white/10 bg-black/50 p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-lime-300 uppercase tracking-[0.3em] text-sm">Product-minded path</p>
              <h2 className="text-3xl font-semibold mt-3">Turn JD gaps into concrete resume outcomes.</h2>
            </div>
            <div className="rounded-3xl border border-lime-500/20 bg-lime-500/5 p-4 text-sm text-white">
              <p className="font-semibold">A smarter way to prepare</p>
              <p className="mt-2 text-gray-300">Use your uploaded resume and target job details to build a real improvement roadmap.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default SkillRoadmap;
