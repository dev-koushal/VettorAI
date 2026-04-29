import React, { useState } from "react";
import { motion } from "motion/react";
import { FiUpload } from "react-icons/fi";
import { FaChartLine } from "react-icons/fa";
import axios from "axios";
import { ServerURL} from "../App";

function FitScore() {
  const [resume, setResume] = useState(null);
  const [jd, setJd] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [score, setScore] = useState(null);
  const [summary, setSummary] = useState("");

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // only PDF check
    if (file.type !== "application/pdf") {
      alert("Only PDF resumes allowed");
      return;
    }

    // 2 page rough check (size-based fallback)
    if (file.size > 2 * 1024 * 1024) {
      alert("Resume should be max 2 pages");
      return;
    }

    setResume(file);
  };

  const handleAnalyze = async () => {
    if (!resume || !jd) return;

    setAnalyzing(true);

    try {
      // STEP 1 → extract resume text
      const formData = new FormData();
      formData.append("resume", resume);

      const resumeRes = await axios.post(
        ServerURL + "/api/interview/analyze-resume",
        formData,
        { withCredentials: true }
      );

      const resumeText = resumeRes.data.resumeText;

      // STEP 2 → get fit score
      const fitRes = await axios.post(
        ServerURL + "/api/feature/fit-score",
        {
          resumeText,
          jobDescription: jd,
        },
        { withCredentials: true }
      );

      setScore(fitRes.data.score);
      setSummary(fitRes.data.summary);

    } catch (err) {
      console.log(err);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden px-6">

      {/* glow */}
      <div className="absolute w-[600px] h-[400px] bg-lime-500/20 blur-[120px] -top-40 -left-40 rounded-full" />
      <div className="absolute w-[600px] h-[400px] bg-lime-500/10 blur-[100px] -bottom-40 -right-40 rounded-full" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl backdrop-blur-xl bg-white/5 border mt-20 border-white/10 rounded-2xl p-2 md:p-8 shadow-2xl"
      >

        {/* heading */}
        <div className="text-center mb-8">
          <h1 className="text-white text-2xl font-semibold">
            Fit Score Analysis
          </h1>
          <p className="text-gray-400 text-sm mt-2">
            Upload resume and compare with job description
          </p>
        </div>

        <div className="space-y-5">

          {/* Resume Upload */}
          <motion.label
            whileHover={{ scale: 1.02 }}
            className="w-full border-2 border-dashed border-lime-500 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer bg-white/5"
          >
            <FiUpload className="text-lime-400 text-2xl mb-2" />

            <span className="text-gray-300 text-sm">
              {resume ? resume.name : "Upload Resume (PDF, max 2 pages)"}
            </span>

            <input
              type="file"
              accept="application/pdf"
              onChange={handleFile}
              className="hidden"
            />
          </motion.label>

          {/* JD Input */}
          <motion.textarea
            whileFocus={{ scale: 1.01 }}
            placeholder="Paste Job Description here..."
            value={jd}
            onChange={(e) => setJd(e.target.value)}
            className="w-full h-32 bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white outline-none focus:border-lime-500"
          />

          {/* Analyze Button */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            onClick={handleAnalyze}
            disabled={analyzing}
            className={`w-full ${analyzing?"bg-gray-400":"bg-lime-500"} hover:bg-lime-600 transition ease-in-out text-black py-2 rounded-lg font-semibold shadow-[0_0_12px_rgba(132,204,22,0.6)]`}
          >
            {analyzing ? "Analyzing..." : "Analyze Fit Score"}
          </motion.button>

          {/* Result */}
          {score && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 text-center"
            >
              <div className="flex items-center justify-center gap-3 mb-2">
                <FaChartLine className="text-lime-400" />
                <span className="text-white text-lg font-semibold">
                  Fit Score
                </span>
              </div>

              <p className="text-4xl font-bold text-lime-400">
                {score}%
              </p>

              <p className="text-gray-400 text-sm mt-2">
                {summary}
              </p>
            </motion.div>
          )}

        </div>
      </motion.div>
    </div>
  );
}

export default FitScore;