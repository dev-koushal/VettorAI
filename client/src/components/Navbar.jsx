import { easeInOut, motion } from "motion/react";
import { FiLogOut, FiMenu } from "react-icons/fi";
import { FaCoins, FaMoneyBill, FaRobot } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { use } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import { useEffect } from "react";
import axios from "axios";
import { getCurrentUser, ServerURL } from "../App";
import { toast } from "react-toastify";
export default function Navbar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);
  const [profilePopUp, setProfilePopUp] = useState(false);
  const [profilePopUp2, setProfilePopUp2] = useState(false);
  const [creditPop, setCreditPop] = useState(false);
  

  const handleLogout = async() => {
    try {
       const res = await axios.get(ServerURL + "/api/auth/logout", { withCredentials: true });
       await getCurrentUser(dispatch);
       toast.success(res.data.message);
       navigate("/");
    } catch (error) {
      console.log("error in logging out: ", error);
    }finally{
      setProfilePopUp(false);
      setProfilePopUp2(false);
    }
  }

  useEffect
  (() => {
    if(profilePopUp2){
      setInterval(() => {
        setProfilePopUp2(false);
      }, 3000);
    }
  }, [profilePopUp2])
  
  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 1, ease: easeInOut }}
      className="w-full fixed top-0 left-0 z-50 flex justify-center"
    >
      <div className="w-300 px-6 py-3 flex items-center justify-between backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl mt-4">
        {/* Logo */}
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate("/")}
        >
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
          <motion.a
            href="#products"
            whileHover={{ y: -2 }}
            className="hover:text-lime-400 cursor-pointer"
          >
            Product
          </motion.a>

          <motion.a
            whileHover={{ y: -2 }}
            className="hover:text-lime-400 cursor-pointer"
          >
            Features
          </motion.a>

          <motion.a
            whileHover={{ y: -2 }}
            className="hover:text-lime-400 cursor-pointer"
          >
            Pricing
          </motion.a>

          <motion.a
            whileHover={{ y: -2 }}
            className="hover:text-lime-400 cursor-pointer"
          >
            Contact
          </motion.a>
        </div>

        {/* CTA */}

        <div className="flex items-center gap-3">
          {!userData ? (
            <motion.button
              whileHover={{ y: -2, scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="hidden md:block cursor-pointer px-4 py-2 text-sm border border-white/15 text-gray-300 rounded-lg hover:bg-white/10 transition"
              onClick={() => navigate("/auth")}
            >
              Login
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ y: -1, scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.01 }}
              className="hidden md:block h-10 w-10 cursor-pointer rounded-full p-1 text-gray-300 border border-white hover:bg-white/10 transition hover:shadow-lime-500/40 hover:shadow-lg"
              onClick={() => setProfilePopUp(!profilePopUp)} 
            >
              {userData.name.charAt(0).toUpperCase()}
            </motion.button>
          )}

          {profilePopUp?<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 } } transition={{duration:0.4} } className="absolute top-16 right-30 p-4 bg-lime-500 text-black rounded-lg shadow-lg hidden md:flex flex-col items-center gap-2">
            <p className="text-lg text-black tracking-widest border-b-2">{userData?.name}</p>
          
            <button className="bg-lime-200 text-black px-2 flex gap-2  transition duration-200 ease-in-out items-center p-1 rounded-lg shadow-2xl  cursor-pointer font-semibold hover:translate-x-1" onClick={handleLogout}>Logout <FiLogOut size={20} /> </button>
          </motion.div>:null}

          <motion.button
            onHoverStart={()=>setCreditPop(true)}
            onHoverEnd={()=>{setCreditPop(false)}}
            
            whileTap={{ scale: 0.95 }}
            className="px-2 md:px-4 cursor-pointer py-2 text-sm bg-lime-500 text-black rounded-lg font-medium shadow-[0_0_12px_rgba(132,204,22,0.6)] flex items-center gap-2"
          >
            <FaCoins size={20} /> {userData?.credits || 0} Credits
          </motion.button>
          {creditPop && (
            <motion.div   onHoverStart={()=>setCreditPop(true)}  onHoverEnd={()=>{setCreditPop(false)}} initial={{ opacity: 0, y:-4 }} animate={{ opacity: 1 , y:0}} transition={{duration:0.6}} className="absolute  top-12.5 bg-gray-500/30 flex justify-center items-center p-4 border border-gray-200/60 text-white/80 rounded-lg shadow-lg ">
              Want more Credits? <a href="" className="text-lime-600 text-sm hover:text-lime-800 tracking-wide border-b border-b-lime-600 ml-1">Click</a>
            </motion.div>
          )}
          {userData? (<div className="md:hidden text-white border border-white/20 h-10 w-10 rounded-full flex items-center justify-center cursor-pointer" onClick={()=>setProfilePopUp2(!profilePopUp2)}>
             {userData?.name ? userData.name.charAt(0).toUpperCase() : 'U'}
          </div>): (<motion.button
              whileHover={{ y: -2, scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="block md:hidden cursor-pointer px-4 py-2 text-sm border border-white/15 text-gray-300 rounded-lg hover:bg-white/10 transition"
              onClick={() => navigate("/auth")}
            >
              Login
            </motion.button>)}
          {profilePopUp2?<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 } } transition={{duration:0.4} } className="absolute top-16 right-4 p-4  bg-lime-500 text-black rounded-lg shadow-lg flex flex-col items-center gap-2 md:hidden">
            <p className="text-lg text-black tracking-widest border-b-2">{userData?.name}</p>
            <button className="bg-lime-200 text-black px-2 flex gap-2  transition duration-200 ease-in-out items-center p-1 rounded-lg shadow-2xl  cursor-pointer font-semibold hover:translate-x-1" onClick={handleLogout}>Logout <FiLogOut size={20} /> </button>
          </motion.div>:null}
        </div>
      </div>
    </motion.nav>
  );
}
