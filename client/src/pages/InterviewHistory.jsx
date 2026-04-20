import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ServerURL } from "../App";
import { motion } from "framer-motion";
import { FaHistory, FaCalendarAlt, FaArrowRight } from "react-icons/fa";

function InterviewHistory() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const getMyInterviews = async () => {
      try {
        const result = await axios.get(
          ServerURL + "/api/interview/get-interview",
          { withCredentials: true },
        );

        setInterviews(result.data);
      } catch (error) {
        console.log(error?.response?.data?.message);
      } finally {
        setLoading(false);
      }
    };

    getMyInterviews();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-lime-950 relative overflow-hidden py-14 sm:py-20 px-3 sm:px-4">
      {/* background blobs */}

      <div className="absolute w-[350px] h-[250px] sm:w-[600px] sm:h-[400px] bg-lime-500/20 blur-[120px] -top-32 -left-32 sm:-top-40 sm:-left-40 rounded-full" />

      <div className="absolute w-[300px] h-[220px] sm:w-[600px] sm:h-[400px] bg-lime-500/10 blur-[100px] -bottom-32 -right-32 sm:-bottom-40 sm:-right-40 rounded-full" />

      <div className="max-w-6xl mx-auto relative z-10 mt-12 bg-gray-500/10 p-4 sm:p-6 rounded-2xl border border-lime-500/20">
        {/* header */}

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8 sm:mb-10"
        >
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
            <FaHistory className="text-lime-400 text-xl sm:text-2xl" />
            Interview History
          </h1>

          <span className="text-xs sm:text-sm text-gray-300 tracking-wider">
            (Total : {interviews.length || "0"})
          </span>
        </motion.div>

        {/* list */}

        <div className="space-y-4 sm:space-y-5 min-h-[300px]">
          {/* skeleton */}

          {loading &&
            [...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-black/40 border border-lime-500/10 rounded-xl p-5 sm:p-6 animate-pulse space-y-3"
              >
                <div className="h-4 w-32 bg-zinc-700 rounded" />

                <div className="h-3 w-24 bg-zinc-700 rounded" />
              </div>
            ))}

          {/* empty */}

          {!loading && interviews.length === 0 && (
            <p className="text-gray-400 text-center py-10">
              No interviews found
            </p>
          )}

          {/* cards */}

          {!loading &&
            interviews.map((interview, index) => (
              <motion.div
                key={interview._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.05 }}
                layout
                className="bg-black/40 backdrop-blur-lg border border-lime-500/20 rounded-xl p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 items-start md:items-center hover:border-lime-400/40 transition"
              >
                {/* role */}

                <div className="flex flex-col gap-1">
                  <p className="text-white font-semibold text-base sm:text-lg">
                    {interview.role || "Unknown"}
                  </p>

                  <div className="flex items-center gap-2 text-gray-400 text-xs sm:text-sm">
                    <FaCalendarAlt />

                    {new Date(interview.createdAt).toLocaleDateString()}
                  </div>
                </div>

                {/* score */}

                <div className="text-left sm:text-right md:text-center">
                  <p className="text-lime-300 font-semibold text-sm">
                    ({interview.finalScore}/10) correct
                  </p>
                </div>

                {/* button */}

                <div className="flex sm:justify-end">
                  <button
                    onClick={() => navigate(`/report/${interview._id}`)}
                    className="flex items-center justify-center gap-2 text-lime-400 hover:text-lime-300 transition cursor-pointer text-sm w-full sm:w-auto border sm:border-none border-lime-500/20 rounded-lg sm:rounded-none py-2 sm:py-0"
                  >
                    View
                    <FaArrowRight />
                  </button>
                </div>
              </motion.div>
            ))}
        </div>
      </div>
    </div>
  );
}
export default InterviewHistory;
