import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

function TargetedInterview() {
  const [form, setForm] = useState({
    role: "",
    company: "",
    type: "",
  });

  const [showPopup, setShowPopup] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowPopup(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black to-red-950 relative overflow-hidden px-4">

      {/* background glow */}
      <div className="absolute w-[600px] h-[400px] bg-red-500/20 blur-[120px] -top-40 -left-40 rounded-full" />
      <div className="absolute w-[600px] h-[400px] bg-red-500/10 blur-[120px] -bottom-40 -right-40 rounded-full" />

      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-red-500/20 rounded-2xl p-8 shadow-xl z-10 flex flex-col gap-5"
      >
        <h1 className="text-2xl font-semibold text-red-400">
          Targeted Interview
        </h1>

        {/* Role */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-zinc-400">Role</label>
          <input
            name="role"
            value={form.role}
            onChange={handleChange}
            placeholder="Frontend Developer"
            className="bg-black/60 border  border-red-500/20 rounded-lg p-3 text-zinc-200 outline-none focus:border-red-400"
          />
        </div>

        {/* Company */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-zinc-400">Company</label>
          <input
            name="company"
            value={form.company}
            onChange={handleChange}
            placeholder="Google"
            className="bg-black/60 border border-red-500/20 rounded-lg p-3 text-zinc-200 outline-none focus:border-red-400"
          />
        </div>

        {/* Type */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-zinc-400">Interview Type</label>
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className="bg-black/60 border border-red-500/20 rounded-lg p-3 text-zinc-200 outline-none focus:border-red-400"
          >
            <option value="">Select Type</option>
            <option value="dsa">DSA</option>
            <option value="systemdesign">System Design</option>
            <option value="core">Core Subjects</option>
            <option value="development">Development</option>
            <option value="technical">Technical</option>
          </select>
        </div>

        <button
          type="submit"
          className="mt-2 bg-red-500 hover:bg-red-400 transition text-black font-semibold py-3 rounded-lg"
        >
          Start Targeted Interview
        </button>
      </motion.form>

      {/* Popup */}
      <AnimatePresence>
        {showPopup && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white/10 backdrop-blur-xl border border-red-500/30 rounded-2xl p-8 shadow-2xl text-center max-w-sm"
            >
              <h2 className="text-xl text-red-400 font-semibold mb-3">
                Feature Coming Soon
              </h2>

              <p className="text-zinc-300 text-sm mb-6">
                Targeted company interview preparation will be available soon.
              </p>

              <button
                onClick={() => setShowPopup(false)}
                className="bg-red-500 hover:bg-red-400 transition text-black font-semibold px-6 py-2 rounded-lg"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default TargetedInterview;