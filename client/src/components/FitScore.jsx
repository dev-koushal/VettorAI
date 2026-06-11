import React, { useEffect, useState } from "react";
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
