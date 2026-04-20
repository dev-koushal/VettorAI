// Timer.jsx
import React from "react";
import { motion } from "framer-motion";

export const Timer = ({ timeLeft, totalTime}) => {
  const progress = (timeLeft / totalTime) * 100;

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex justify-between text-sm text-lime-400/60 mb-1 font-medium">
        <span>Time</span>
        <span>{timeLeft}s</span>
      </div>

      <div className="w-full h-3 bg-black/70 rounded-full overflow-hidden border border-lime-500/40">
        <motion.div
          className="h-full bg-lime-500"
          initial={{ width: "100%" }}
          animate={{ width: `${progress}%` }}
          transition={{ ease: "linear", duration: 0.4 }}
        />
      </div>
    </div>
  );
};