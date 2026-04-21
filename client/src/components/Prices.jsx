import React from "react";
import { motion } from "framer-motion";
import { FaCheck } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function Price() {
  const navigate = useNavigate();
  const plans = [
    {
      name: "Starter",
      price: "₹99",
      features: [
        "100 Credit",
        "2 AI mock interviews",
        "Basic feedback",
        "Performance tracking",
        "Late feedback",
        "low priority support"
      ]
    },
    {
      name: "Pro",
      price: "₹199",
      highlight: true,
      features: [
        "250 Credit",
        "Unlimited AI interviews",
        "Advanced AI feedback",
        "Performance analytics",
        "Resume analysis"
      ]
    },
    {
      name: "Elite",
      price: "₹399",
      features: [
        "500 Credit",
        "Everything in Pro",
        "Real company questions",
        "Priority AI evaluation",
        "Career insights"
      ]
    }
  ];

  return (
    <section id="prices" className="w-full mt-12 mb-12 bg-black">
      <div className="max-w-6xl mx-auto px-6">

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-white text-3xl md:text-4xl font-semibold text-center"
        >
          Pricing
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-gray-400 text-center mt-3 text-sm"
        >
          Simple pricing for smarter interview preparation.
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-20">

          {plans.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              whileHover={{ y: -8 }}
              className={`relative rounded-2xl border ${
                plan.highlight
                  ? "border-lime-400 shadow-[0_0_40px_rgba(163,230,53,0.15)]"
                  : "border-white/10"
              } bg-black/70 backdrop-blur-xl p-8`}
            >

              {plan.highlight && (
                <div className="absolute -top-3 right-6 text-xs bg-lime-400 text-black px-3 py-1 rounded-full">
                  Popular
                </div>
              )}

              <h3 className="text-white text-xl font-semibold">
                {plan.name}
              </h3>

              <p className="text-lime-400 text-3xl font-bold mt-4">
                {plan.price}
              </p>

              <div className="mt-8 space-y-4">

                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-gray-400 text-sm">
                    <FaCheck className="text-lime-400 text-xs" />
                    {feature}
                  </div>
                ))}

              </div>

              <button
              onClick={()=>navigate("/pricing")}
                className={`mt-10 w-full py-3 rounded-lg text-sm font-medium transition ${
                  plan.highlight
                    ? "bg-lime-400 text-black hover:bg-lime-300"
                    : "border border-white/10 text-gray-300 hover:bg-white/10"
                }`}
              >
                Get Started
              </button>

            </motion.div>
          ))}

        </div>

      </div>
    </section>
  );
}

export default Price;