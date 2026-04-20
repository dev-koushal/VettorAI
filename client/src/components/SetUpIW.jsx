import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FaUserTie,
  FaMicrophoneAlt,
  FaChartLine,
  FaBriefcase,
  FaFileUpload,
} from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";
import { ServerURL } from "../App";
import { useDispatch, useSelector } from "react-redux";
import { setUserData } from "../redux/userSlice";

function SetUpIW({ onStart }) {
  const { userData } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const [role, setRole] = useState("Full stack developer");
  const [experience, setExperience] = useState(
    "Backend Engineer with 2 year experience",
  );
  const [mode, setMode] = useState("HR");
  const [resumeFile, setResumeFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [resumeText, setResumeText] = useState("");
  const [analysisDone, setAnalysisDone] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const icons = [
    {
      icon: <FaUserTie />,
      text: "Upload your resume",
    },
    {
      icon: <FaMicrophoneAlt />,
      text: "Practice realistic interview questions",
    },
    {
      icon: <FaChartLine />,
      text: "Get AI feedback and improvement tips",
    },
  ];

  const handleUploadResume = async () => {
    if (!resumeFile || analyzing) return;

    setAnalyzing(true);

    const formData = new FormData();
    formData.append("resume", resumeFile);

    try {
      const result = await axios.post(
        ServerURL + "/api/interview/analyze-resume",
        formData,
        { withCredentials: true },
      );

      setRole(result.data.role || "");
      setExperience(result.data.experience || "");
      setProjects(
        Array.isArray(result.data.projects) ? result.data.projects : [],
      );
      setSkills(Array.isArray(result.data.skills) ? result.data.skills : []);
      setResumeText(result.data.resumeText || "");

      setAnalysisDone(true);
    } catch (err) {
      toast.error("Resume analysis failed");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleStart = async () => {
    setLoading(true);

    try {
      const result = await axios.post(
        ServerURL + "/api/interview/generate-questions",
        { role, experience, mode, resumeText, projects, skills },
        { withCredentials: true },
      );

      if (userData) {
        dispatch(setUserData({ ...userData, credits: result.data.creditLeft }));
      }

      onStart(result.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b0f0b] relative overflow-hidden px-4 py-12">
      {/* background glow */}

      <div className="absolute w-[500px] h-[350px] bg-lime-500/20 blur-[140px] -top-40 -left-40 rounded-full" />
      <div className="absolute w-[450px] h-[320px] bg-lime-400/10 blur-[120px] -bottom-40 -right-40 rounded-full" />

      <div className="w-full max-w-6xl grid lg:grid-cols-2 backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl shadow-xl overflow-hidden">
        {/* LEFT INFO */}

        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="p-8 md:p-10 space-y-6"
        >
          <h2 className="text-3xl font-semibold text-white">
            Start Your AI Interview
          </h2>

          <p className="text-gray-400 text-sm leading-relaxed">
            Simulate real interviews and receive instant AI-powered feedback to
            improve your answers and confidence.
          </p>

          <div className="space-y-4">
            {icons.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.15 }}
                className="flex items-center gap-3 bg-white/5 border border-white/10 p-3 rounded-lg"
              >
                <span className="text-lime-400 text-lg">{item.icon}</span>
                <p className="text-gray-300 text-sm">{item.text}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* RIGHT SETUP */}

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-br from-lime-50 to-lime-100 p-8 md:p-10"
        >
          <h3 className="text-2xl font-semibold text-gray-700 mb-6">
            Interview Setup
          </h3>

          <div className="space-y-5">
            <div className="relative">
              <FaUserTie className="absolute left-4 top-4 text-lime-700" />
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Role"
                className="w-full pl-12 pr-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-lime-400"
              />
            </div>

            <div className="relative">
              <FaBriefcase className="absolute left-4 top-4 text-lime-700" />
              <input
                type="text"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                placeholder="Experience"
                className="w-full pl-12 pr-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-lime-400"
              />
            </div>

            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="w-full py-3 px-4 border rounded-xl outline-none focus:ring-2 focus:ring-lime-400"
            >
              <option value="Technical">Technical Interview</option>
              <option value="HR">HR Interview</option>
            </select>

            {/* resume upload */}

            {!analysisDone && (
              <div
                onClick={() => document.getElementById("resumeUpload").click()}
                className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-lime-500 hover:bg-lime-100 transition"
              >
                <FaFileUpload className="text-3xl text-lime-500 mx-auto mb-2" />

                <input
                  id="resumeUpload"
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => setResumeFile(e.target.files[0])}
                />

                <p className="text-gray-600 text-sm">
                  {resumeFile ? resumeFile.name : "Upload your resume"}
                </p>

                {resumeFile && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUploadResume();
                    }}
                    disabled={analyzing}
                    className="mt-3 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm"
                  >
                    {analyzing ? "Analyzing..." : "Analyze Resume"}
                  </button>
                )}
              </div>
            )}

            {/* analysis */}

            {analysisDone && (
              <div className="bg-white border rounded-xl p-4 space-y-3">
                {projects.length > 0 && (
                  <div>
                    <p className="font-medium text-gray-700 mb-1 text-sm">
                      Projects
                    </p>
                    <ul className="list-disc list-inside text-gray-600 text-sm">
                      {projects.map((p, i) => (
                        <li key={i}>{p}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {skills.length > 0 && (
                  <div>
                    <p className="font-medium text-gray-700 mb-1 text-sm">
                      Skills
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {skills.map((s, i) => (
                        <span
                          key={i}
                          className="bg-lime-100 text-lime-700 px-3 py-1 rounded-full text-xs"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <motion.button
              whileTap={{ scale: 0.96 }}
              whileHover={{ scale: 1.02 }}
              onClick={handleStart}
              disabled={!role || !experience || loading}
              className="w-full py-3 rounded-full bg-lime-400 hover:bg-lime-500 text-gray-900 font-semibold"
            >
              {loading ? "Starting..." : "Start Interview"}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default SetUpIW;
