import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { FiUpload, FiCheckCircle, FiTrash2 } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import { ServerURL } from "../App";
import { setResumeData, clearResumeData } from "../redux/userSlice";

function UploadResume() {
  const dispatch = useDispatch();
  const { resumeData } = useSelector((state) => state.user);

  const [selectedFile, setSelectedFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    if (resumeData?.name) {
      setSelectedFile(null);
    }
  }, [resumeData]);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF resume.");
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      toast.error("Please upload a resume smaller than 3MB.");
      return;
    }
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Choose a resume first.");
      return;
    }

    setAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append("resume", selectedFile);

      const response = await axios.post(
        `${ServerURL}/api/interview/analyze-resume`,
        formData,
        { withCredentials: true }
      );

      dispatch(
        setResumeData({
          name: selectedFile.name,
          text: response.data.resumeText || "",
          role: response.data.role || "",
          experience: response.data.experience || "",
          projects: Array.isArray(response.data.projects) ? response.data.projects : [],
          skills: Array.isArray(response.data.skills) ? response.data.skills : [],
          uploadedAt: new Date().toISOString(),
        })
      );

      toast.success("Resume uploaded successfully. It is now available across the app.");
    } catch (error) {
      console.error(error);
      toast.error("Resume analysis failed. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleClear = () => {
    dispatch(clearResumeData());
    toast.info("Global resume cleared. Upload a new one anytime.");
  };

  return (
    <div className="min-h-screen bg-black text-white px-6 py-24 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-[420px] h-[420px] rounded-full bg-lime-500/10 blur-[120px] -z-10" />
      <div className="absolute bottom-0 right-0 w-[380px] h-[380px] rounded-full bg-lime-400/10 blur-[100px] -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl mx-auto"
      >
        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-2xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-lime-300/80">
                Global Resume Sync
              </p>
              <h1 className="text-4xl font-semibold text-white mt-2">
                Upload once, use everywhere.
              </h1>
              <p className="text-gray-400 mt-3 max-w-2xl leading-relaxed">
                Your resume will be stored in the app state and reused automatically wherever resume data is needed,
                like Fit Score and Interview Setup.
              </p>
            </div>
            <div className="rounded-3xl border border-lime-500/30 bg-black/20 p-5 text-center">
              <p className="text-sm uppercase tracking-[0.3em] text-lime-200/80">
                Current status
              </p>
              <p className="mt-3 text-2xl font-semibold text-lime-400">
                {resumeData?.name ? "Resume ready" : "No resume uploaded"}
              </p>
              <p className="mt-2 text-gray-400 text-sm">
                {resumeData?.name || "Upload a PDF resume to enable global reuse."}
              </p>
            </div>
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-6">
              <motion.label
                whileHover={{ scale: 1.02 }}
                className="group cursor-pointer rounded-3xl border border-dashed border-lime-500/40 bg-white/5 p-8 flex flex-col gap-4"
              >
                <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-lime-500/10 text-lime-300">
                  <FiUpload size={24} />
                </div>
                <div>
                  <p className="text-xl font-semibold">Select your resume</p>
                  <p className="text-gray-400 text-sm">
                    Upload a PDF resume and the app will extract skills, projects, role, and experience.
                  </p>
                </div>
                <span className="text-sm text-gray-300">
                  {selectedFile ? selectedFile.name : "Click here to choose a PDF resume"}
                </span>
                <input type="file" accept="application/pdf" className="hidden" onChange={handleFile} />
              </motion.label>

              <div className="flex flex-col gap-3 md:flex-row">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={handleUpload}
                  disabled={analyzing || !selectedFile}
                  className="w-full rounded-2xl bg-lime-500 px-6 py-4 text-black font-semibold shadow-[0_0_20px_rgba(163,230,53,0.25)] transition disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {analyzing ? "Analyzing resume..." : "Upload and Analyze"}
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={handleClear}
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-6 py-4 text-white font-semibold hover:border-lime-400/70 transition"
                >
                  Clear Global Resume
                </motion.button>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-black/30 p-6 space-y-5">
              <div className="flex items-start gap-4">
                <div className="rounded-2xl bg-lime-500/10 p-3 text-lime-300">
                  <FiCheckCircle size={20} />
                </div>
                <div>
                  <p className="text-white font-semibold">Automatically reused</p>
                  <p className="text-gray-400 text-sm">Fit Score and Interview setup will use this resume when available.</p>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm uppercase tracking-[0.3em] text-gray-400 mb-3">Current resume</p>
                <p className="text-white font-semibold">{resumeData?.name || "No resume uploaded yet"}</p>
                {resumeData?.role && (
                  <p className="text-gray-300 text-sm mt-2">Role: {resumeData.role}</p>
                )}
                {resumeData?.experience && (
                  <p className="text-gray-400 text-sm mt-1">Experience summary available</p>
                )}
                {resumeData?.skills?.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {resumeData.skills.slice(0, 5).map((item, index) => (
                      <span key={index} className="rounded-full bg-lime-500/10 px-3 py-1 text-xs text-lime-300">
                        {item}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default UploadResume;
