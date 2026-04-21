import React from "react";
import { motion } from "framer-motion";
import { FaGithub, FaTwitter, FaLinkedin } from "react-icons/fa";

function Footer() {
  return (
    <div id="footer" className="bg-black w-full overflow-x-hidden overflow-y-hidden">
        <motion.footer

      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7 }}
      className="w-full bg-zinc-900/80 backdrop-blur-md border-t border-white/10  "
    >
      <div className="max-w-6xl mx-auto px-6 py-12">

        <div className="flex flex-col md:flex-row items-center justify-between gap-8">

          {/* logo / brand */}
          <div className="text-center md:text-left">
            <h3 className="text-white text-xl font-semibold">
              Vettor <span className="text-lime-400">AI</span>
            </h3>

            <p className="text-gray-400 text-sm mt-2 max-w-sm">
              AI powered platform to practice technical interviews and improve faster.
            </p>
          </div>

          {/* links */}
          <div className="flex gap-8 text-sm text-gray-400">
            <a href="#features" className="hover:text-white transition">
              Features
            </a>

            <a href="#products" className="hover:text-white transition">
              Product
            </a>

            <a href="#pricing" className="hover:text-white transition">
              Pricing
            </a>
          </div>

          {/* socials */}
          <div className="flex gap-5 text-gray-400 text-lg">
            <a href="#" className="hover:text-lime-400 transition">
              <FaGithub />
            </a>

            <a href="#" className="hover:text-lime-400 transition">
              <FaTwitter />
            </a>

            <a href="#" className="hover:text-lime-400 transition">
              <FaLinkedin />
            </a>
          </div>

        </div>

        {/* bottom */}
        <div className="mt-10 pt-6 border-t border-white/10 text-center text-gray-500 text-xs">
          © {new Date().getFullYear()} Vettor AI. All rights reserved.
        </div>

      </div>
    </motion.footer>
    </div>
  );
}

export default Footer;