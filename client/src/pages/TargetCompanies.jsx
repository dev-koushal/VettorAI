import React from "react";
import { easeInOut, motion } from "framer-motion";
import { useNavigate } from 'react-router-dom'
import {
  FaBullseye,
  FaBrain,
  FaRocket,
  FaBuilding,
  FaFire,
} from "react-icons/fa";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, ease: "easeOut" },
  },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

function TargetCompanies() {
  const navigate = useNavigate();
  const features = [
    {
      icon: <FaBullseye />,
      title: "Target Companies",
      desc: "Prepare specifically for companies you want to join instead of random interview questions.",
    },
    {
      icon: <FaBrain />,
      title: "AI Interview Patterns",
      desc: "Understand the interview patterns used by specific companies.",
    },
    {
      icon: <FaRocket />,
      title: "Focused Preparation",
      desc: "Train faster by practicing the style of questions companies actually ask.",
    },
  ];

  const companies = [
    "Google",
    "Amazon",
    "Microsoft",
    "Meta",
    "Netflix",
    "Apple",
  ];

  return (
    <div className="min-h-screen bg-[#070707] text-white relative overflow-hidden">
      {/* background gradient */}
      <div className="absolute w-[600px] h-[400px] bg-red-500/20 blur-[120px] -top-40 -left-40 rounded-full" />
      <div className="absolute w-[600px] h-[400px] bg-red-500/10 blur-[120px] -bottom-40 -right-40 rounded-full" />

      {/* floating glow */}
      <motion.div
        animate={{ x: [-30, 30, -30], y: [0, 20, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute w-[600px] h-[500px] bg-red-500/10 blur-[160px] -top-40 -left-40 rounded-full"
      />

      <motion.div
        animate={{ x: [30, -30, 30], y: [20, -10, 20] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        className="absolute w-[500px] h-[450px] bg-orange-500/10 blur-[160px] -bottom-40 -right-40 rounded-full"
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-24 mt-14">

        {/* HERO */}

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-24 relative"
        >
          {/* icon */}

          <motion.div
            className="flex justify-center mb-6"
            whileHover={{ scale: 1.08 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
          </motion.div>

          {/* headline */}

          <h1 className="text-4xl md:text-5xl font-semibold mb-6 leading-tight">
            Vettor AI For
            <span className="text-red-400 block mt-2">
              Specific Companies with Resources
            </span>
          </h1>

          {/* description */}

          <p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed mb-10">
            Train specifically for companies you want to join and simulate real
            interview environments powered by AI.
          </p>

          {/* feature badges */}

          <div className="flex justify-center flex-wrap gap-4 mb-10">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="px-4 py-2 bg-[#0f0f0f] border border-white/10 rounded-full text-sm text-gray-300"
            >
              AI Interview Simulation
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="px-4 py-2 bg-[#0f0f0f] border border-white/10 rounded-full text-sm text-gray-300"
            >
              Company Specific Questions
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="px-4 py-2 bg-[#0f0f0f] border border-white/10 rounded-full text-sm text-gray-300"
            >
              Real Hiring Patterns
            </motion.div>
          </div>

          {/* CTA buttons */}

          <div className="flex justify-center gap-4 flex-wrap mb-14">
            <motion.button
            onClick={()=>navigate("interview")}
              whileHover={{ scale: 1.02, }}
              whileTap={{ scale: 0.95 }}
              transition={{duration:0.1, ease:easeInOut}}
              className="px-7 py-3 bg-red-500 text-white rounded-lg font-medium shadow-[0_0_20px_rgba(255,0,0,0.35)] hover:bg-red-600 transition cursor-pointer"
            >
              Start Practicing
            </motion.button>

            <motion.button
               whileHover={{ scale: 1.02, }}
              whileTap={{ scale: 0.95 }}
              transition={{duration:0.1, ease:easeInOut}}
              className="px-7 py-3 border cursor-pointer border-red-400 text-red-300 rounded-lg hover:bg-red-500/10 transition"
            >
              Explore Companies
            </motion.button>
          </div>

          {/* companies preview */}

        
        </motion.div>

        {/* features */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid md:grid-cols-3 gap-8 mb-24"
        >
          {features.map((f, i) => (
            <motion.div
              key={i}
              variants={item}
              whileHover={{
                y: -6,
                scale: 1.02,
                boxShadow: "0px 10px 30px rgba(255,0,0,0.12)",
              }}
              transition={{ duration: 0.25 }}
              className="bg-[#0f0f0f] border border-white/5 rounded-xl p-7 hover:border-red-500/40 transition-all duration-300"
            >
              <div className="text-red-400 text-xl mb-4">{f.icon}</div>
              <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* companies */}
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center"
        >
          <div className="flex justify-center mb-6">
            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl">
              <FaBuilding className="text-red-400 text-xl" />
            </div>
          </div>

          <h2 className="text-2xl font-semibold mb-6">
            Practice For Top Tech Companies
          </h2>

          <p className="text-gray-400 max-w-xl mx-auto mb-10">
            Simulate interview experiences inspired by top tech companies and
            train for their expectations.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            {companies.map((c, i) => (
              <motion.div
                key={i}
                whileHover={{
                  scale: 1.08,
                  borderColor: "#ef4444",
                  color: "#f87171",
                }}
                transition={{ duration: 0.2 }}
                className="px-5 py-2 bg-[#0f0f0f] border border-white/10 rounded-full text-sm text-gray-300 transition-all duration-300"
              >
                {c}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default TargetCompanies;
