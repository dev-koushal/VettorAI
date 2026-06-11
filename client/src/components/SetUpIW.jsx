import React, { useEffect, useState } from "react";
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
import { setUserData, setResumeData, clearResumeData } from "../redux/userSlice";

function SetUpIW({ onStart }) {
  const { userData, resumeData } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const [role, setRole] = useState(resumeData.role || "");
  const [experience, setExperience] = useState(resumeData.experience || "");
  const [mode, setMode] = useState("Technical");
  const [resumeFile, setResumeFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState(resumeData.projects || []);
  const [skills, setSkills] = useState(resumeData.skills || []);
  const [resumeText, setResumeText] = useState(resumeData.text || "");
  const [analysisDone, setAnalysisDone] = useState(Boolean(resumeData.text));
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    setRole(resumeData.role || "");
    setExperience(resumeData.experience || "");
    setProjects(resumeData.projects || []);
    setSkills(resumeData.skills || []);
    setResumeText(resumeData.text || "");
    setAnalysisDone(Boolean(resumeData.text));
  }, [resumeData]);

  const icons = [
    {
      icon: <FaUserTie />,
      text: "Upload or reuse your resume",
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
        `${ServerURL}/api/interview/analyze-resume`,
        formData,
        { withCredentials: true }
      );

      const payload = {
        name: resumeFile.name,
        text: result.data.resumeText || "",
        role: result.data.role || "",
        experience: result.data.experience || "",
        projects: Array.isArray(result.data.projects) ? result.data.projects : [],
        skills: Array.isArray(result.data.skills) ? result.data.skills : [],
      };

      dispatch(setResumeData(payload));
      setRole(payload.role);
      setExperience(payload.experience);
      setProjects(payload.projects);
      setSkills(payload.skills);
      setResumeText(payload.text);
      setAnalysisDone(Boolean(payload.text));
      toast.success("Resume synced for interview setup.");
    } catch (err) {
      toast.error("Resume analysis failed. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleStart = async () => {
    if (userData?.credits < 50) {
      toast.error("Buy credits to use this feature.");
      return;
    }

    setLoading(true);

    try {
      const result = await axios.post(
        `${ServerURL}/api/interview/generate-questions`,
        { role, experience, mode, resumeText, projects, skills },
        { withCredentials: true }
      );

      if (userData) {
        dispatch(setUserData({ ...userData, credits: result.data.creditLeft }));
      }

      onStart(result.data);
    } catch (err) {
      console.error(err);
      toast.error("Unable to start interview. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020502] relative overflow-hidden px-4 py-12">
      <div className="absolute w-[520px] h-[420px] bg-lime-500/12 blur-[140px] -top-40 -left-40 rounded-full" />
      <div className="absolute w-[420px] h-[360px] bg-lime-400/10 blur-[120px] -bottom-40 -right-40 rounded-full" />

      <div className="w-full max-w-6xl grid lg:grid-cols-2 backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl shadow-xl overflow-hidden">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="p-8 md:p-10 space-y-6"
        >
          <h2 className="text-3xl font-semibold text-white">Start Your AI Interview</h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            Simulate real interviews and get a job-ready plan using your uploaded resume and target questions.
          </p>

          <div className="space-y-4">
            {icons.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.15 }}
                className="flex items-center gap-3 bg-white/5 border border-white/10 p-3 rounded-3xl"
              >
                <span className="text-lime-400 text-xl">{item.icon}</span>
                <p className="text-gray-300 text-sm">{item.text}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-br from-lime-50/20 to-lime-100/10 p-8 md:p-10"
        >
          <h3 className="text-2xl font-semibold text-white mb-6">Interview Setup</h3>

          {resumeData?.name && (
            <div className="mb-6 rounded-3xl border border-lime-500/20 bg-black/20 p-4 text-sm text-gray-200">
              <p className="font-semibold text-white">Using saved resume:</p>
              <p>{resumeData.name}</p>
              <p className="text-gray-400">Role: {resumeData.role || "Not extracted yet"}</p>
              <p className="text-gray-400">Experience summary loaded.</p>
            </div>
          )}

          <div className="space-y-5">
            <div className="relative">
              <FaUserTie className="absolute left-4 top-4 text-lime-400" />
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Role"
                className="w-full pl-12 pr-4 py-3 border rounded-2xl outline-none bg-black/30 border-white/10 text-white focus:ring-2 focus:ring-lime-400"
              />
            </div>

            <div className="relative">
              <FaBriefcase className="absolute left-4 top-4 text-lime-400" />
              <input
                type="text"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                placeholder="Experience"
                className="w-full pl-12 pr-4 py-3 border rounded-2xl outline-none bg-black/30 border-white/10 text-white focus:ring-2 focus:ring-lime-400"
              />
            </div>

            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="w-full py-3 px-4 border rounded-2xl outline-none bg-black/30 border-white/10 text-white focus:ring-2 focus:ring-lime-400"
            >
              <option value="Technical">Technical Interview</option>
              <option value="HR">HR Interview</option>
            </select>

            {!analysisDone && (
              <div className="border-2 border-dashed border-gray-500 rounded-3xl p-8 text-center cursor-pointer hover:border-lime-400 hover:bg-lime-100/10 transition">
                <FaFileUpload className="text-3xl text-lime-400 mx-auto mb-3" />
                <input
                  id="resumeUpload"
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => setResumeFile(e.target.files[0])}
                />
                <p className="text-gray-300 text-sm">
                  {resumeFile ? resumeFile.name : "Upload your resume to auto-fill skills & experience"}
                </p>

                {resumeFile && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUploadResume();
                    }}
                    disabled={analyzing}
                    className="mt-4 rounded-2xl bg-lime-500 px-5 py-3 text-black font-semibold hover:bg-lime-600 transition disabled:opacity-60"
                  >
                    {analyzing ? "Syncing resume..." : "Analyze Resume"}
                  </button>
                )}
              </div>
            )}

            {analysisDone && (
              <div className="bg-white/5 border border-white/10 rounded-3xl p-5 space-y-4">
                <div>
                  <p className="font-medium text-white text-sm">Detected skills</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {skills.length > 0 ? (
                      skills.map((skill, index) => (
                        <span key={index} className="rounded-full bg-lime-500/10 px-3 py-1 text-xs text-lime-300">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-400 text-sm">No skills extracted yet.</span>
                    )}
                  </div>
                </div>

                {projects.length > 0 && (
                  <div>
                    <p className="font-medium text-white text-sm">Detected projects</p>
                    <ul className="list-disc list-inside text-gray-300 text-sm mt-2">
                      {projects.map((project, index) => (
                        <li key={index}>{project}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <motion.button
              whileTap={{ scale: 0.96 }}
              whileHover={{ scale: 1.02 }}
              onClick={handleStart}
              disabled={!role || !experience || loading}
              className="w-full py-3 rounded-full bg-lime-400 text-black font-semibold hover:bg-lime-500 transition"
            >
              {loading ? "Starting..." : "Start Interview"}
            </motion.button>

            {(resumeData?.name || analysisDone) && (
              <button
                onClick={() => dispatch(clearResumeData())}
                className="w-full py-3 rounded-full border border-white/10 text-white hover:bg-white/5 transition"
              >
                Clear Saved Resume
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default SetUpIW;
