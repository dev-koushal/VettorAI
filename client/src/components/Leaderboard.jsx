import React from "react";
import { motion } from "motion/react";

function Leaderboard() {
  const candidates = [
    { name: "Rahul Sharma", score: 92 },
    { name: "Ananya Verma", score: 88 },
    { name: "Karan Patel", score: 85 },
    { name: "Priya Singh", score: 82 },
  ];

  return (
    <div className="min-h-screen bg-black relative overflow-hidden px-6 flex items-center justify-center">

      {/* glow */}
      <div className="absolute w-[600px] h-[400px] bg-lime-500/20 blur-[120px] -top-40 -left-40 rounded-full" />
      <div className="absolute w-[600px] h-[400px] bg-lime-500/10 blur-[100px] -bottom-40 -right-40 rounded-full" />

      <div className="w-full max-w-3xl relative z-10">

        {/* heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-white text-3xl font-semibold text-center mb-10"
        >
          Leaderboard
        </motion.h1>

        {/* candidates */}
        <div className="space-y-4">
          {candidates.map((user, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15 }}
              whileHover={{ scale: 1.02 }}
              className="flex items-center justify-between backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl px-6 py-4"
            >
              <div className="flex items-center gap-4">
                <span className="text-lime-400 font-semibold">
                  #{i + 1}
                </span>
                <p className="text-white">{user.name}</p>
              </div>

              <p className="text-lime-400 font-semibold">
                {user.score}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* bottom gradient */}
      <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-gray-800 to-transparent" />

      {/* coming soon */}
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.1 }}
        transition={{ duration: 1 }}
        className="absolute bottom-10 text-white text-6xl font-bold tracking-widest"
      >
        COMING SOON
      </motion.h2>

    </div>
  );
}

export default Leaderboard;