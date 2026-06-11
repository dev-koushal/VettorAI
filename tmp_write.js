const fs = require('fs');
const path = require('path');
const files = {
  'client/src/components/FitScore.jsx': `import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { FiUpload } from "react-icons/fi";
import { FaChartLine } from "react-icons/fa";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { ServerURL } from "../App";
import { setResumeData, clearResumeData } from "../redux/userSlice";

function FitScore() {
  const dispatch = useDispatch();
  const { resumeData } = useSelector((state) => state.user);

  const [resumeFile, setResumeFile] = useState(null);
  const [jd, setJd] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [score, setScore] = useState(null);
  const [summary, setSummary] = useState("");

  useEffect(() => {
    if (resumeData?.name && !resumeFile) {
      setResumeFile(null);
    }
  }, [resumeData, resumeFile]);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF resume.");
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      toast.error("Resume must be smaller than 3MB.");
      return;
    }

    setResumeFile(file);
  };

  const handleAnalyze = async () => {
    if (!jd) {
      toast.error("Please paste a job description.");
      return;
    }

    setAnalyzing(true);

    try {
      let resumeText = resumeData?.text || "";

      if (!resumeText) {
        if (!resumeFile) {
          toast.error("Please upload a resume or use the uploaded resume.");
          return;
        }

        const formData = new FormData();
        formData.append("resume", resumeFile);

        const resumeRes = await axios.post(
          `${ServerURL}/api/interview/analyze-resume`,
          formData,
          { withCredentials: true }
        );

        resumeText = resumeRes.data.resumeText;
        dispatch(
          setResumeData({
            name: resumeFile.name,
            text: resumeText,
            role: resumeRes.data.role || "",
            experience: resumeRes.data.experience || "",
            projects: Array.isArray(resumeRes.data.projects) ? resumeRes.data.projects : [],
            skills: Array.isArray(resumeRes.data.skills) ? resumeRes.data.skills : [],
          })
        );
      }

      const fitRes = await axios.post(
        `${ServerURL}/api/feature/fit-score`,
        { resumeText, jobDescription: jd },
        { withCredentials: true }
      );

      setScore(fitRes.data.score);
      setSummary(fitRes.data.summary);
    } catch (err) {
      console.error(err);
      toast.error("Unable to compute fit score. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden px-6 py-16">
      <div className="absolute w-[600px] h-[400px] bg-lime-500/20 blur-[120px] -top-40 -left-40 rounded-full" />
      <div className="absolute w-[600px] h-[400px] bg-lime-500/10 blur-[100px] -bottom-40 -right-40 rounded-full" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-2 md:p-8 shadow-2xl"
      >
        <div className="text-center mb-8">
          <h1 className="text-white text-3xl font-semibold">Fit Score Analysis</h1>
          <p className="text-gray-400 text-sm mt-2">
            Compare your uploaded resume with a job description and get a targeted fit score.
          </p>
        </div>

        {resumeData?.name && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-lime-500/25 bg-lime-500/5 p-5 mb-6"
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-lime-300">Using uploaded resume</p>
                <p className="text-white font-semibold text-lg mt-2">{resumeData.name}</p>
              </div>
              <button
                onClick={() => dispatch(clearResumeData())}
                className="rounded-full border border-lime-400/40 px-5 py-2 text-sm text-white hover:bg-lime-500/10 transition"
              >
                Clear Global Resume
              </button>
            </div>
            <p className="text-gray-300 text-sm mt-3">
              This resume is now available across Fit Score and Interview Setup.
            </p>
          </motion.div>
        )}

        <div className="space-y-5">
          <motion.label
            whileHover={{ scale: 1.02 }}
            className="w-full border-2 border-dashed border-lime-500 rounded-3xl p-6 flex flex-col items-center justify-center cursor-pointer bg-white/5"
          >
            <FiUpload className="text-lime-400 text-2xl mb-2" />
            <span className="text-gray-300 text-sm">
              {resumeFile?.name || (resumeData?.name ? "Using uploaded resume or upload a new one" : "Upload Resume (PDF, max 3MB)")}
            </span>
            <input type="file" accept="application/pdf" className="hidden" onChange={handleFile} />
          </motion.label>

          <motion.textarea
            whileFocus={{ scale: 1.01 }}
            placeholder="Paste Job Description here..."
            value={jd}
            onChange={(e) => setJd(e.target.value)}
            className="w-full h-32 bg-white/5 border border-white/10 rounded-3xl p-4 text-sm text-white outline-none focus:border-lime-500"
          />

          <motion.button
            whileHover={{ scale: 1.01 }}
            onClick={handleAnalyze}
            disabled={analyzing}
            className={`w-full ${analyzing ? "bg-gray-400" : "bg-lime-500"} hover:bg-lime-600 transition ease-in-out text-black py-3 rounded-3xl font-semibold shadow-[0_0_16px_rgba(163,230,53,0.35)]`}
          >
            {analyzing ? "Analyzing..." : "Analyze Fit Score"}
          </motion.button>

          {score !== null && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 rounded-3xl border border-white/10 bg-black/40 p-6"
            >
              <div className="flex items-center justify-center gap-3 mb-4">
                <FaChartLine className="text-lime-400" />
                <span className="text-white text-lg font-semibold">Fit Score</span>
              </div>
              <p className="text-5xl font-bold text-lime-400 text-center">{score}%</p>
              <p className="text-gray-400 text-center mt-4">{summary}</p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default FitScore;
`,
  'client/src/components/SkillRoadmap.jsx': `import React from "react";
import { motion } from "motion/react";
import { FaSearch, FaBolt, FaRocket } from "react-icons/fa";

function SkillRoadmap() {
  const steps = [
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

        <div className="relative">
          <div className="absolute left-1/2 top-8 h-[calc(100%-2rem)] w-1 -translate-x-1/2 bg-lime-500/20" />

          {steps.map((step, index) => (
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
`,
  'client/src/components/Leaderboard.jsx': `import React from "react";
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
`,
  'client/src/index.css': `@import "tailwindcss";

:root {
  color-scheme: dark;
  --bg: #020402;
  --surface: rgba(15, 23, 17, 0.75);
  --surface-strong: rgba(255, 255, 255, 0.08);
  --text: #effaf6;
  --text-muted: #9ca3af;
  --accent: #a3e635;
  --accent-strong: #84cc16;
  --border: rgba(255, 255, 255, 0.08);
}

html {
  scroll-behavior: smooth;
}

body {
  min-height: 100vh;
  margin: 0;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  background: radial-gradient(circle at top left, rgba(163, 230, 53, 0.14), transparent 33%),
    radial-gradient(circle at bottom right, rgba(132, 204, 22, 0.08), transparent 30%),
    var(--bg);
  color: var(--text);
}

* {
  box-sizing: border-box;
}

button,
input,
textarea,
select {
  font: inherit;
}

img {
  max-width: 100%;
  display: block;
}
`
};
for (const [relPath, content] of Object.entries(files)) {
  const targetPath = path.join('/d/VettorAI', relPath);
  fs.writeFileSync(targetPath, content, 'utf8');
}
console.log('files written');
