import {FaGithub } from "react-icons/fa";
import { motion } from "motion/react";
import { FcGoogle } from "react-icons/fc";
export default function Auth() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">

      {/* Lime decorative glow */}
      <div className="absolute w-96 md:w-175 h-125 bg-lime-500/20 blur-[120px] rounded-full -top-38 -left-40"/>
      <div className="absolute w-96 md:w-175 h-125 bg-lime-500/10 blur-[100px] rounded-full -bottom-40 -right-40" />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-10 w-105 shadow-2xl m-2 md:m-0"
      >

        {/* Logo + Heading */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex gap-2 mb-6 items-center">
            <motion.div
            whileHover={{ rotate: 8, scale: 1.1 }}
            className="w-10 h-10 rounded-xl bg-lime-500 flex items-center justify-center text-black font-bold text-xl"
          >
            V 
          </motion.div>
          <h1 className="text-white text-2xl font-semibold items-center">
            Vettor AI
          </h1>
          </div>

          

          <p className=" bg-lime-50 rounded-full px-2 py-1 text-sm mt-2">
            Continue with Vettor AI
          </p>
          <p className="text-gray-400 text-sm mt-2 items-center text-center">
            Sign in to start AI powered Interview, track progress, get insights and more.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-4">

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="flex items-center justify-center gap-3 w-full bg-white text-black py-3 rounded-lg font-medium cursor-pointer"
          >
            <FcGoogle size={18} />
            Continue with Google
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="flex items-center justify-center gap-3 w-full border border-white/20 text-white py-3 rounded-lg hover:bg-white/10 transition cursor-not-allowed"
          >
            <FaGithub size={18} />
            Continue with Github
          </motion.button>

        </div>

        {/* Footer */}
        <p className="text-gray-500 text-xs text-center mt-8">
          Secure authentication powered by Vettor AI
        </p>

      </motion.div>
    </div>
  );
}