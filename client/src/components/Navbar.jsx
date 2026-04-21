import { motion } from "framer-motion";
import { FiLogOut } from "react-icons/fi";
import { FaCoins } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useState, useEffect } from "react";
import axios from "axios";
import { getCurrentUser, ServerURL } from "../App";
import { toast } from "react-toastify";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { userData } = useSelector((state) => state.user);

  const [profilePopUp, setProfilePopUp] = useState(false);
  const [profilePopUp2, setProfilePopUp2] = useState(false);
  const [creditPop, setCreditPop] = useState(false);

  const isTargetPage = location.pathname === "/target-companies" || location.pathname === "/target-companies/interview" ;

  const accentBg = isTargetPage ? "bg-red-500" : "bg-lime-500";
  const accentText = isTargetPage ? "text-red-400" : "text-lime-400";
  const accentHover = isTargetPage
    ? "hover:text-red-400"
    : "hover:text-lime-400";

  const handleLogout = async () => {
    try {
      const res = await axios.get(ServerURL + "/api/auth/logout", {
        withCredentials: true,
      });

      await getCurrentUser(dispatch);

      toast.success(res.data.message);

      navigate("/");
    } catch (err) {
      console.log(err);
    } finally {
      setProfilePopUp(false);
      setProfilePopUp2(false);
    }
  };

  useEffect(() => {
    if (profilePopUp2) {
      setTimeout(() => {
        setProfilePopUp2(false);
      }, 3000);
    }
  }, [profilePopUp2]);

  

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8 }}
      className="w-full fixed top-0 left-0 z-50 flex justify-center"
    >
      <div className="w-[95%] max-w-6xl px-6 py-3 flex items-center justify-between backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl mt-4 transition-colors duration-500">
        {/* logo */}

        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <motion.div
            whileHover={{ rotate: 8, scale: 1.1 }}
            className={`w-9 h-9 rounded-lg ${accentBg} flex items-center justify-center text-black font-bold text-lg`}
          >
            V
          </motion.div>

          <span className="text-white font-semibold text-lg" onClick={() => navigate("/")}>Vettor AI</span>
        </div>

        {/* links */}

        <div className="hidden md:flex items-center gap-8 text-gray-300 text-sm">
          <motion.div
            whileHover={{ y: -2 }}
            className={`cursor-pointer ${accentHover}`}
            onClick={()=>navigate("/")}
          >
            <a href="#products">Product </a>
          </motion.div>

          <motion.div
            whileHover={{ y: -2 }}
            className={`cursor-pointer ${accentHover}`}
            onClick={()=>navigate("/")}
          >
            <a href="#features"> Features </a>
          </motion.div>

          <motion.div whileHover={{ y: -2 }} onClick={()=>navigate("/")}>
            <a href="#prices">Pricing </a>
          </motion.div>

          <motion.div whileHover={{ y: -2 }} onClick={()=>navigate("/")}>
            <a href="#footer">Contact </a>
          </motion.div>

          {/* dynamic button */}

          <motion.div
            whileHover={{ y: -2 }}
            className={`cursor-pointer ${accentHover}`}
            onClick={() => navigate(isTargetPage ? "/" : "/target-companies")}
          >
            {isTargetPage ? "Home" : "Target Companies"}
          </motion.div>
        </div>

        {/* right side */}

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
              whileHover={{ scale: 1.05 }}
              className="hidden md:block h-10 w-10 cursor-pointer rounded-full p-1 text-gray-300 border border-white hover:bg-white/10 transition"
              onClick={() => setProfilePopUp(!profilePopUp)}
            >
              {userData.name.charAt(0).toUpperCase()}
            </motion.button>
          )}

          {/* profile popup */}

          {profilePopUp && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`absolute top-16 right-24 p-4 ${accentBg} text-black rounded-lg shadow-lg hidden md:flex flex-col items-center gap-2`}
            >
              <p className="text-lg tracking-widest border-b-2">
                {userData?.name}
              </p>

              <button
                className="bg-white px-2 flex gap-2 items-center p-1 rounded-lg cursor-pointer font-semibold hover:translate-x-1"
                onClick={handleLogout}
              >
                Logout <FiLogOut size={18} />
              </button>
            </motion.div>
          )}

          {/* credits */}

          <motion.button
            onHoverStart={() => setCreditPop(true)}
            onHoverEnd={() => setCreditPop(false)}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/pricing")}
            className={`px-3 md:px-4 py-2 text-sm ${accentBg} text-black rounded-lg font-medium shadow-lg flex items-center gap-2`}
          >
            <FaCoins size={18} />
            {userData?.credits || 0} Credits
          </motion.button>

          {/* credit popup */}

          {creditPop && (
            <motion.div
              onHoverStart={() => setCreditPop(true)}
              onHoverEnd={() => setCreditPop(false)}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute  top-12 bg-gray-600/40 p-3 border border-white/20 text-white rounded-lg"
            >
              Want more Credits?
              <span
                onClick={() => navigate("/pricing")}
                className={`${accentText} cursor-pointer underline `}
              >
                Buy
              </span>
            </motion.div>
          )}

          {/* mobile avatar */}

          {userData ? (
            <div
              className="md:hidden text-white border border-white/20 h-10 w-10 rounded-full flex items-center justify-center cursor-pointer"
              onClick={() => setProfilePopUp2(!profilePopUp2)}
            >
              {userData?.name?.charAt(0).toUpperCase()}
            </div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="block md:hidden px-4 py-2 text-sm border border-white/15 text-gray-300 rounded-lg hover:bg-white/10"
              onClick={() => navigate("/auth")}
            >
              Login
            </motion.button>
          )}

          {/* mobile popup */}

          {profilePopUp2 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`absolute top-16 right-4 p-4 ${accentBg} text-black rounded-lg shadow-lg flex flex-col items-center gap-2 md:hidden`}
            >
              <p className="text-lg tracking-widest border-b-2">
                {userData?.name}
              </p>

              <button
                className="bg-white px-2 flex gap-2 items-center p-1 rounded-lg cursor-pointer font-semibold hover:translate-x-1"
                onClick={handleLogout}
              >
                Logout <FiLogOut size={18} />
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </motion.nav>
  );
}
