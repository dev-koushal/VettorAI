import React, { useState } from "react";
import { FaArrowLeft, FaCheck, FaCoins } from "react-icons/fa";
import { color, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ServerURL } from "../App";
import {useDispatch} from "react-redux";
import { setUserData } from "../redux/userSlice";
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.18 },
  },
};

const card = {
  hidden: { opacity: 0, y: 40 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const plans = [
  {
    id: "starter",
    name: "Starter Pack",
    price: "₹99",
    credits: 100,
    description: "Great for focused interview practice",
    features: [
      "100 Interview Credits",
      "AI Question Generation",
      "Interview Feedback",
      "Interview History",
    ],
  },
  {
    id: "pro",
    name: "Pro Pack",
    price: "₹199",
    credits: 250,
    description: "Best value for serious preparation",
    features: [
      "250 Interview Credits",
      "Advanced AI Feedback",
      "Target Company Interviews",
      "Performance Analytics",
    ],
    featured: true,
  },
  {
    id: "elite",
    name: "Elite Pack",
    price: "₹399",
    credits: 500,
    description: "Maximum practice with full features",
    features: [
      "500 Interview Credits",
      "Priority AI Processing",
      "Company Style Interviews",
      "Full Analytics Dashboard",
    ],
  },
];

function Pricing() {
  const navigate = useNavigate();
  const [loadingPlan, setLoadingPlan] = useState(null);
  const dispatch = useDispatch();

  const handlePayment = async (plan) => {
    try {
      setLoadingPlan(plan.id);

      const { data: order } = await axios.post(
        ServerURL + "/api/payment/order",
        {
          planId: plan.id,
          amount: Number(plan.price.replace("₹", "")),
          credits: plan.credits,
        },
        { withCredentials: true },
      );

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Vettor AI",
        description: `${plan.credits} Interview Credits`,
        order_id: order.id,

        handler: async function (response) {
          const verifyPay = await axios.post(
            ServerURL + "/api/payment/verify",
            response,
            { withCredentials: true },
          );
          dispatch(setUserData(verifyPay.data.user))
          window.alert("Payment done!!❤️❤️");
          navigate("/");
        },
        theme :{
          color : " #003300"
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* animated glow background */}
      <motion.div
        animate={{ x: [-40, 40, -40], y: [0, 30, 0] }}
        transition={{ duration: 18, repeat: Infinity }}
        className="absolute w-[600px] h-[500px] bg-lime-500/10 blur-[160px] -top-40 -left-40 rounded-full"
      />

      <motion.div
        animate={{ x: [40, -40, 40], y: [20, -10, 20] }}
        transition={{ duration: 20, repeat: Infinity }}
        className="absolute w-[500px] h-[450px] bg-lime-400/10 blur-[160px] -bottom-40 -right-40 rounded-full"
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 mt-20">
        {/* header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-16"
        >
          <button
            onClick={() => navigate("/")}
            className="p-3 rounded-lg bg-lime-500/10 border border-lime-500/30 hover:bg-lime-500/20 transition"
          >
            <FaArrowLeft className="text-lime-400" />
          </button>

          <div>
            <h1 className="text-3xl font-semibold">Choose Your Plan</h1>
            <p className="text-gray-400 text-sm">
              Select the best plan for your interview preparation
            </p>
          </div>
        </motion.div>

        {/* pricing cards */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid md:grid-cols-3 gap-8"
        >
          {plans.map((plan) => (
            <motion.div
              key={plan.id}
              variants={card}
              whileHover={{
                scale: 1.02,
                boxShadow: "0px 10px 40px rgba(132,204,22,0.18)",
              }}
              className={`rounded-xl p-8 flex flex-col relative
                ${
                  plan.featured
                    ? "bg-[#0d0d0d] border border-lime-400/40"
                    : "bg-[#0b0b0b] border border-white/5"
                }`}
            >
              {plan.featured && (
                <div className="absolute -top-3 right-4 text-xs bg-lime-400 text-black px-3 py-1 rounded-full font-medium">
                  Most Popular
                </div>
              )}

              <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>

              <p className="text-gray-400 text-sm mb-6">{plan.description}</p>

              <motion.div
                whileHover={{ scale: 1.1 }}
                className="flex items-center gap-2 mb-6"
              >
                <FaCoins className="text-lime-400" />
                <span className="text-3xl font-semibold">{plan.price}</span>
              </motion.div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-2 text-sm text-gray-300"
                  >
                    <FaCheck className="text-lime-400 text-xs" />
                    {feature}
                  </li>
                ))}
              </ul>

              <motion.button
                disabled={loadingPlan}
                onClick={(e) => {
                  e.stopPropagation();
                  handlePayment(plan);
                }}
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0px 0px 20px rgba(132,204,22,0.45)",
                }}
                whileTap={{ scale: 0.96 }}
                className="mt-auto py-3 rounded-lg bg-lime-500 text-black font-medium hover:bg-lime-400 transition"
              >
                Buy {plan.credits} Credits
              </motion.button>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

export default Pricing;
