import { easeInOut, motion } from "motion/react";
import { FaArrowRight } from "react-icons/fa";
import Product from "../components/Product";
import Feature from "../components/Feature";
import Prices from "../components/Prices";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import { FiBarChart } from "react-icons/fi";
function Home() {

  const navigate = useNavigate();
  return (

    <div id="home" className="bg-black w-full overflow-x-hidden">

      {/* HERO */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">

        {/* background glow */}
        <div className="absolute w-96 md:w-[700px] h-[500px] bg-lime-500/20 blur-[120px] rounded-full -top-40 -left-40" />
        <div className="absolute w-96 md:w-[700px] h-[500px] bg-lime-500/10 blur-[100px] rounded-full -bottom-40 -right-40" />

        <div className="flex flex-col items-center gap-8 px-6 max-w-5xl">

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-white text-5xl md:text-6xl font-bold text-center leading-tight mt-30 "
          >
            Master Interviews With{" "}
            <span className="text-lime-400 block">Vettor AI</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            viewport={{ once: true }}
            className="text-gray-400 text-lg text-center max-w-xl"
          >
            Practice real interview questions, receive AI feedback, track
            improvement, and prepare for top tech companies with confidence.
          </motion.p>

          {/* buttons */}
          <motion.div initial={{ opacity: 0, y: 20 }}  whileInView={{ opacity: 1, y: 0 }} transition={{ duration:0.6 ,delay: 0.4 }} viewport={{ once: true }} className="flex gap-4 mt-4">
            <motion.button
              transition={{ease: easeInOut }}
              whileTap={{ scale: 0.95 }}
              viewport={{ once: true }}
              className="flex text-sm items-center gap-2 hover:translate-x-1 transition ease-in-out duration-300 cursor-pointer px-6 py-3 bg-lime-500 text-black rounded-lg md:font-medium shadow-[0_0_14px_rgba(132,204,22,0.6)]"
             onClick={()=>navigate("/interview")}>
              Start Interview
              <FaArrowRight size={14} />
            </motion.button>

            <motion.button
            onClick={()=>navigate("/history")}
              
              whileTap={{ scale: 0.96 }}
              viewport={{ once: true }}
              className="px-12 py-3 border border-white/15 text-gray-300 rounded-lg hover:bg-white/10  hover:border hover:border-lime-500 transition duration-300 ease-in-out  font-semibold text-sm cursor-pointer flex justify-center items-center gap-2"
            >
              Growth <FiBarChart />
            </motion.button>
          </motion.div>

          {/* feature cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 w-full">

            {[
              {
                title: "AI Interviews",
                desc: "Simulate real technical interviews powered by AI.",
              },
              {
                title: "Performance Insights",
                desc: "Track progress and discover weak areas instantly.",
              },
              {
                title: "Smart Feedback",
                desc: "Get detailed AI feedback after every interview.",
              },
            ].map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.3 }}
                whileHover={{ y: -8 }}
                viewport={{ once: true }}
                className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl overflow-hidden"
              >

                {/* Browser Top */}
                <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border-b border-white/10">
                  <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                  <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                  <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                </div>

                <div className="p-6 text-center">
                  <h3 className="text-white text-lg font-semibold mb-2">
                    {card.title}
                  </h3>

                  <p className="text-gray-400 text-sm">
                    {card.desc}
                  </p>
                </div>

              </motion.div>
            ))}

          </div>

        </div>
      </section>

      {/* PRODUCT */}
      <Product />
      <Feature />
      <Prices />
      <Footer />
    </div>
  );
}

export default Home;