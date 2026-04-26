import React from "react";
import { motion } from "framer-motion";
import { FaChartLine, FaBrain } from "react-icons/fa";

function Product() {

  const container = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const card = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <div id="products" className="py-24 max-w-6xl mx-auto px-6">
        

      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
         viewport={{ once: true }}
        className="text-3xl md:text-4xl font-semibold text-white text-center"
      >
        Product
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
         viewport={{ once: true }}
        className="text-gray-400 text-center mt-3 text-sm"
      >
        Powerful tools to simulate real interviews and improve faster.
      </motion.p>

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-14"
      >

        {[
          {
            title: "Mock Interview Simulator",
            desc: "Practice real interview scenarios with timed sessions and company-style questions.",
            icon: <FaBrain />
          },
          {
            title: "Performance Dashboard",
            desc: "Track interview scores, improvement areas, and progress across multiple mock interviews.",
            icon: <FaChartLine />
          },
          {
            title: "AI Feedback Engine",
            desc: "Detailed feedback on communication, problem solving, and coding approach after every session.",
            icon: <FaBrain />
          },
          {
            title: "Resume Match",
            desc: "Match your resume with company requirements and identify gaps instantly with AI MAX Feature",
            icon: <FaBrain />
          }
        ].map((product, i) => (

          <motion.div
            key={i}
            variants={card}
            whileHover={{ scale: 1.02 }}
            className="relative p-[1px] rounded-2xl bg-linear-to-r from-lime-400/40 to-transparent"
          >

            <motion.div
              whileHover={{ boxShadow: "0 0 30px rgba(163,230,53,0.25)" }}
              className="bg-black/70 backdrop-blur-xl rounded-2xl p-8 border border-white/10"
            >

              <motion.div
                whileHover={{ rotate: 10, scale: 1.1 }}
                className="w-12 h-12 flex items-center justify-center rounded-lg bg-lime-500/10 text-lime-400 text-xl mb-6"
              >
                {product.icon}
              </motion.div>

              <h3 className="text-white text-xl font-semibold mb-3">
                {product.title}
              </h3>

              <p className="text-gray-400 text-sm leading-relaxed">
                {product.desc}
              </p>
              <img src={product.image} alt="" />

              <motion.div
                whileHover={{ width: 120 }}
                className="mt-6 h-1 w-16 bg-lime-400 rounded-full transition-all"
              />


            </motion.div>

          </motion.div>

        ))}

      </motion.div>
    </div>
  );
}

export default Product;