import { easeInOut, motion } from "motion/react";
import { FiMenu } from "react-icons/fi";
import { FaCoins, FaMoneyBill, FaRobot } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
    const navigate = useNavigate();
  return (
    <motion.nav initial={{ y: -100 }} animate={{ y: 0 }} transition={{duration:1, ease: easeInOut}}   className="w-full fixed top-0 left-0 z-50 flex justify-center">
      <div className="w-300 px-6 py-3 flex items-center justify-between backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl mt-4">

        {/* Logo */}
        <div className="flex items-center gap-2  cursor-pointer" onClick={()=>navigate('/')}>
          <motion.div
            whileHover={{ rotate: 8, scale: 1.1 }}
            className="w-9 h-9 rounded-lg bg-lime-500 flex items-center justify-center text-black font-bold text-lg"
            
          >
           <a href="#home">V</a>
          </motion.div>

          <span className="text-white font-semibold text-lg">
            <a href="#home">Vettor AI </a>
          </span>
        </div>

        {/* Links */}
        <div className="hidden md:flex items-center gap-8 text-gray-300 text-sm">
          <motion.a href="#products" whileHover={{ y: -2 }} className="hover:text-lime-400 cursor-pointer">
            Product
          </motion.a>

          <motion.a whileHover={{ y: -2 }} className="hover:text-lime-400 cursor-pointer">
            Features
          </motion.a>

          <motion.a whileHover={{ y: -2 }} className="hover:text-lime-400 cursor-pointer">
            Pricing
          </motion.a>

          <motion.a whileHover={{ y: -2 }} className="hover:text-lime-400 cursor-pointer">
            Contact
          </motion.a>
        </div>

        {/* CTA */}
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ y: -2, scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="hidden md:block cursor-pointer px-4 py-2 text-sm border border-white/15 text-gray-300 rounded-lg hover:bg-white/10 transition"
         onClick={()=>navigate('/auth')} >
            Login
          </motion.button>

          <motion.button
            whileHover={{ y: -2, scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 cursor-pointer py-2 text-sm bg-lime-500 text-black rounded-lg font-medium shadow-[0_0_12px_rgba(132,204,22,0.6)] flex items-center gap-2"
          >
             <FaCoins size={20} /> 100 Credits
          </motion.button>

          <div className="md:hidden text-white">
            <FiMenu size={22} />
          </div>
        </div>

      </div>
    </motion.nav>
  );
}