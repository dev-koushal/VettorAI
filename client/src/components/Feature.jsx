import React from "react";
import { motion } from "framer-motion";
import { FaRobot, FaChartLine, FaBolt, FaBrain } from "react-icons/fa";

function Feature() {
  const features = [
    {
      icon: <FaRobot />,
      title: "AI Interviews",
      desc: "Simulate real technical interviews powered by adaptive AI questions."
    },
    {
      icon: <FaChartLine />,
      title: "Performance Insights",
      desc: "Analyze your progress, discover weak areas, and improve faster."
    },
    {
      icon: <FaBolt />,
      title: "Instant Feedback",
      desc: "Receive detailed AI feedback immediately after every interview session."
    },
    {
      icon: <FaBrain />,
      title: "Smart Question Engine",
      desc: "Questions dynamically adapt based on your performance and difficulty level."
    }
  ];

  return (
    <section id="features" className="py-28 w-full bg-black">
      <div className="max-w-5xl mx-auto px-6">

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-white text-3xl md:text-4xl font-semibold text-center"
        >
          Features
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-gray-400 text-center mt-3 text-sm"
        >
          Built to make interview preparation smarter.
        </motion.p>

        {/* timeline */}
        <div className="relative mt-20">

          {/* center line */}
          <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-[2px] bg-lime-500/30"></div>

          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.10 }}
              className={`relative flex items-start md:items-center mb-16 ${
                i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
              }`}
            >

              {/* icon */}
              <div className="absolute  left-6 md:left-1/2 -translate-x-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-lime-500/10 border border-lime-400 text-lime-400 ">
                {feature.icon}
              </div>

              {/* content */}
              <div className="ml-16 md:ml-0 md:w-1/2 px-6 ">
                <h3 className="text-white text-xl font-semibold mb-2 ml-4">
                  {feature.title}
                </h3>

                <p className="text-gray-400 text-sm leading-relaxed ml-4">
                  {feature.desc}
                </p>
              </div>

            </motion.div>
          ))}

        </div>

      </div>
    </section>
  );
}

export default Feature;