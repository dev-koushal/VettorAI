import React from "react";
import { motion } from "motion/react";
import { FaCheckCircle, FaBolt, FaBook } from "react-icons/fa";

function SkillRoadmap() {
  const steps = [
    { title: "Resume Analysis", desc: "AI scans and extracts your skills.", type: "info" },
    { title: "Missing Skills Identified", desc: "Gaps are detected based on job role.", type: "info" },
    { title: "Learn Docker", desc: "5–7 days • High Priority", type: "skill" },
    { title: "Build Project", desc: "Apply Docker in real project.", type: "action" },
    { title: "Learn System Design", desc: "10–14 days • Medium Priority", type: "skill" },
    { title: "Mock Interview", desc: "Test your improvements.", type: "action" },
  ];

  return (
    <div className="min-h-screen bg-black relative overflow-hidden px-6 py-20">

      {/* glow */}
      <div className="absolute w-[600px] h-[400px] bg-lime-500/20 blur-[120px] -top-40 -left-40 rounded-full" />
      <div className="absolute w-[600px] h-[400px] bg-lime-500/10 blur-[100px] -bottom-40 -right-40 rounded-full" />

      <div className="max-w-5xl mx-auto mt-10 relative">

        {/* heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-white text-3xl md:text-4xl font-semibold text-center mb-16"
        >
          Skill Roadmap
        </motion.h1>

        {/* center line */}
        <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-[2px] bg-lime-500/30" />

        {/* steps */}
        {steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.15 }}
            className={`relative flex items-start md:items-center mb-16 ${
              i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
            }`}
          >

            {/* circle */}
            <motion.div
              whileHover={{ scale: 1.15 }}
              className="absolute left-6 md:left-1/2 -translate-x-1/2 w-14 h-14 flex items-center justify-center rounded-full bg-lime-500/10 border border-lime-400 text-lime-400 shadow-[0_0_12px_rgba(132,204,22,0.3)]"
            >
              {step.type === "info" && <FaBook />}
              {step.type === "skill" && <FaBolt />}
              {step.type === "action" && <FaCheckCircle />}
            </motion.div>

            {/* content */}
            <motion.div
              whileHover={{ y: -4 }}
              className="ml-20 md:ml-0 md:w-1/2 px-6 group"
            >
              <div className="backdrop-blur-xl md:mx-4 -mx-6  bg-white/5 border border-white/10 rounded-xl p-5">

                <h3 className="text-white text-lg font-semibold mb-2 group-hover:text-lime-400 transition">
                  {step.title}
                </h3>

                <p className="text-gray-400 text-sm">
                  {step.desc}
                </p>

              </div>
            </motion.div>

          </motion.div>
        ))}

      </div>

      {/* bottom gradient */}
      <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-gray-800 to-transparent" />

      {/* coming soon */}
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.08 }}
        transition={{ duration: 1 }}
        className="absolute bottom-10 text-white text-6xl font-bold tracking-widest text-center w-full"
      >
        COMING SOON
      </motion.h2>

    </div>
  );
}

export default SkillRoadmap;