import React, { useState } from "react";
import { easeIn, easeInOut, motion } from "motion/react";
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
  const [experience, setExperience] = useState("Backend Engineer with 2 year experience");
  const [mode, setMode] = useState("Technical");
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
      description: "Upload your resume to get started.",
    },
    {
      icon: <FaMicrophoneAlt />,
      description: "Engage in a simulated interview based on your resume.",
    },
    {
      icon: <FaChartLine />,
      description: "Receive a detailed report with feedback and suggestions.",
    },
  ];

  /**
   * function for handleUploadResume
   */
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
      console.log(result.data);

      setRole(result.data.role || "");
      setExperience(result.data.experience || "");
      setProjects(
        Array.isArray(result.data.projects) ? result.data.projects : [],
      );
      setSkills(Array.isArray(result.data.skills) ? result.data.skills : []);
      setResumeText(result.data.resumeText || "");
      setAnalysisDone(true);
    } catch (error) {
      console.log(error);
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

      console.log(result.data);

      if (userData) {
        dispatch(setUserData({ ...userData, credits: result.data.creditLeft }));
      }
      onStart(result.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-auto flex justify-center items-center bg-linear-to-br from-black to-lime-950 relative overflow-hidden py-4"
    >
      <div className="absolute w-[600px] h-[400px] bg-lime-500/20 blur-[120px] -top-40 -left-40 rounded-full" />
      <div className="absolute w-[600px] h-[400px] bg-lime-500/10 blur-[100px] -bottom-40 -right-40 rounded-full" />

      <div className="w-full max-w-6xl mt-12 md:mt-24 backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl shadow-2xl grid md:grid-cols-2 overflow-hidden">
        <motion.div
          initial={{ x: -80, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="p-10"
        >
          <h2 className="text-3xl font-bold text-white mb-3">
            Start Your AI Interview
          </h2>

          <p className="text-gray-400 mb-6 leading-relaxed">
            Practice real interview scenarios powered by AI and receive
            personalized feedback to improve performance.
          </p>

          {icons.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.2, duration: 0.6 }}
              whileHover={{ y: -1, scale: 1.02 }}
              className="flex items-center mb-4 bg-white/10 p-3 rounded-lg"
            >
              <div className="text-xl text-lime-400 mr-4">{item.icon}</div>
              <p className="text-gray-300 text-sm">{item.description}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ x: 80, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ ease: easeIn, duration: 0.6 }}
          className="bg-gradient-to-tr from-lime-50 to-lime-100 p-10 flex flex-col "
        >
          <h2 className="text-2xl font-bold text-gray-700 mb-6">
            Interview Setup
          </h2>
          <div className="space-y-6">
            <div className=" relative ">
              <FaUserTie className=" absolute top-4 left-4 text-lime-800" />
              <input
                type="text"
                placeholder="Enter role"
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition"
                onChange={(e) => setRole(e.target.value)}
                value={role}
              />
            </div>
            <div className=" relative ">
              <FaBriefcase className=" absolute top-4 left-4 text-lime-800" />
              <input
                type="text"
                placeholder="Experience"
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition"
                onChange={(e) => setExperience(e.target.value)}
                value={experience}
              />
            </div>
            <div>
              <select
                onChange={(e) => setMode(e.target.value)}
                name=""
                id=""
                value={mode}
                className="w-full py-3 px-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition"
              >
                <option value="Technical" className="bg-black text-white">
                  Technical Interview
                </option>
                <option value="HR Interview" className="bg-black text-white">
                  HR Interview
                </option>
              </select>
            </div>

            {!analysisDone && (
              <motion.div
                onClick={() => document.getElementById("resumeUpload").click()}
                className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-lime-500 hover:bg-lime-100 transition"
              >
                <FaFileUpload className="text-4xl mx-auto text-lime-500 mb-3" />
                <input
                  type="file"
                  accept="application/pdf"
                  id="resumeUpload"
                  className="hidden"
                  onChange={(e) => setResumeFile(e.target.files[0])}
                />
                <p className="text-gray-600 font-medium">
                  {resumeFile ? resumeFile.name : "Click to upload resume"}
                </p>
                {resumeFile && (
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUploadResume();
                    }}
                    disabled={analyzing}
                    className={`mt-4 bg-gray-900 text-white px-5 py-2 rounded-lg hover:bg-gray-800 disabled:pointer-events-none transition cursor-pointer`}
                  >
                    {analyzing ? "Analyzing..." : "Analyze Resume"}
                  </motion.button>
                )}
              </motion.div>
            )}

            {analysisDone && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-4 "
              >
                <h3 className="text-lg font-semibold text-gray-800">
                  Resume Analysis Result
                </h3>
                {projects.length > 0 && (
                  <div>
                    <p className="font-medium text-gray-700 mb-1">Projects:</p>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                      {projects.map((p, i) => (
                        <li key={i}>{p}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {skills.length > 0 && (
                  <div>
                    <p className="font-medium text-gray-700 mb-1">Skills:</p>
                    <ul className="flex flex-wrap gap-2">
                      {skills.map((s, i) => (
                        <li
                          key={i}
                          className="bg-lime-100 text-lime-700 px-3 py-1 rounded-full text-sm"
                        >
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            )}

            <motion.button
              onClick={handleStart}
              disabled={!role || !experience || loading}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
              className="w-full disabled:bg-gray-600 hover:bg-lime-500 py-3 rounded-full text-lg font-semibold transition duration-300 shadow-md cursor-pointer bg-lime-300 border border-gray-200"
            >
              {loading ? "Starting..." : "Start Interview"}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default SetUpIW;
