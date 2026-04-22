import axios from "axios";
import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { ServerURL } from "../App";
import { motion } from "framer-motion";

import autoTable from "jspdf-autotable";
import { FaDownload } from "react-icons/fa";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";
import jsPDF from "jspdf";


function ScoreRing({ label, value }) {
  const circumference = 301;
  const offset = circumference - (circumference * value) / 10;

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col items-center"
    >
      <div className="relative w-28 h-28">
        <svg className="w-28 h-28 -rotate-90">
          <circle
            cx="56"
            cy="56"
            r="48"
            stroke="#27272a"
            strokeWidth="8"
            fill="transparent"
          />

          <motion.circle
            cx="56"
            cy="56"
            r="48"
            stroke="#84cc16"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1 }}
          />
        </svg>

        <div className="absolute inset-0 flex items-center justify-center text-xl text-lime-300 font-semibold">
          {value}
        </div>
      </div>

      <p className="text-gray-400 mt-3">{label}</p>
    </motion.div>
  );
}

function InterviewReport() {
  const { interviewId } = useParams();
  const [report, setReport] = useState(null);
  const reportRef = useRef();

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const result = await axios.get(
          ServerURL + `/api/interview/report/${interviewId}`,
          { withCredentials: true },
        );
        // console.log(result.data)
        setReport(result.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchReport();
  }, [interviewId]);

  // Download PDF functionality:


const downloadPDF = async () => {
  const doc = new jsPDF();

  doc.setFontSize(20);
  doc.text("AI Interview Report", 14, 20);

  doc.setFontSize(11);
  doc.text(
    "This report evaluates the candidate based on communication, confidence, correctness, structure, and depth during the AI interview.",
    14,
    30
  );

  autoTable(doc, {
    startY: 40,
    head: [["Metric", "Score (0-10)"]],
    body: [
      ["Confidence", report.confidence],
      ["Communication", report.communication],
      ["Correctness", report.correctness],
      ["Structure", report.structure],
      ["Depth", report.depth],
    ],
  });

  const questionData = report.questionWiseScore.map((q, i) => [
    i + 1,
    q.question,
    q.answer,
    q.score,
    `${q.timeLimit}s`,
  ]);

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 10,
    head: [["#", "Question", "Answer", "Score", "Time Limit"]],
    body: questionData,
  });

  const avg =
    (report.confidence +
      report.communication +
      report.correctness +
      report.structure +
      report.depth) /
    5;

  let feedback = "";

  if (avg >= 8) feedback = "Excellent performance with strong clarity and understanding.";
  else if (avg >= 6) feedback = "Good performance but can improve depth and structure.";
  else feedback = "Needs improvement in clarity, correctness, and explanation depth.";

  doc.text("Feedback:", 14, doc.lastAutoTable.finalY + 20);
  doc.text(feedback, 14, doc.lastAutoTable.finalY + 28);

  doc.save(`interview-report_${Date(report.createdAt)}.pdf`);
};
  

  if (!report) {
    return (
      <div className="min-h-screen bg-[#0b0f0b] flex justify-center items-start pt-32 px-6">
        <div className="max-w-6xl w-full space-y-8 animate-pulse">
          {/* title skeleton */}
          <div className="h-8 w-56 bg-zinc-800 rounded-md" />

          {/* chart skeleton */}
          <div className="h-[320px] w-full bg-zinc-800/60 rounded-xl" />

          {/* score cards */}
          <div className="flex justify-center gap-10">
            <div className="h-24 w-24 bg-zinc-800 rounded-full" />
            <div className="h-24 w-24 bg-zinc-800 rounded-full" />
            <div className="h-24 w-24 bg-zinc-800 rounded-full" />
          </div>

          {/* question skeleton */}
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-6 rounded-xl bg-zinc-800/50 space-y-4">
              <div className="h-4 w-3/4 bg-zinc-700 rounded" />
              <div className="grid grid-cols-3 gap-4">
                <div className="h-3 bg-zinc-700 rounded" />
                <div className="h-3 bg-zinc-700 rounded" />
                <div className="h-3 bg-zinc-700 rounded" />
              </div>
              <div className="h-3 w-1/2 bg-zinc-700 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const chartData = [
    { subject: "Confidence", value: report.confidence },
    { subject: "Communication", value: report.communication },
    { subject: "Correctness", value: report.correctness },
    { subject: "Structure", value: report.structure },
    { subject: "Depth", value: report.depth },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0b0f0b]">
      {/* animated background */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="absolute inset-0 bg-gradient-to-br from-lime-900/20 via-black to-lime-950"
      />

      <motion.div
        animate={{ x: [-40, 40, -40], y: [0, 30, 0] }}
        transition={{ repeat: Infinity, duration: 14 }}
        className="absolute w-[350px] h-[350px] md:w-[600px] md:h-[600px] bg-lime-500/20 blur-[150px] top-[-150px] left-[-120px] md:top-[-200px] md:left-[-150px] rounded-full"
      />

      <motion.div
        animate={{ x: [40, -40, 40], y: [20, -20, 20] }}
        transition={{ repeat: Infinity, duration: 16 }}
        className="absolute w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-lime-400/10 blur-[150px] bottom-[-150px] right-[-120px] md:bottom-[-200px] md:right-[-150px] rounded-full"
      />

      <div
        ref={reportRef}
        className="max-w-6xl mx-auto relative z-10 py-12 md:py-16 px-4 sm:px-6 mt-10 md:mt-22 bg-gray-500/10 p-4 rounded-2xl border border-lime-500/20 "
      >
        {/* header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8 md:mb-12 ">
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            Interview Report
          </h1>

          <button onClick={downloadPDF} className="flex items-center justify-center gap-2 bg-lime-500/10 border border-lime-500/30 px-3 md:px-4 py-2 rounded-lg text-lime-300 hover:bg-lime-500/20 transition text-sm md:text-base">
            <FaDownload />
            Download PDF
          </button>
        </div>

        {/* radar chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="w-full min-w-0 h-[300px] sm:h-[360px] md:h-[420px] mb-12 md:mb-16"
        >
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={chartData}>
              <PolarGrid stroke="#3f3f46" />
              <PolarAngleAxis dataKey="subject" stroke="#a3e635" />
              <PolarRadiusAxis angle={30} domain={[0, 10]} stroke="#52525b" />
              <Radar
                dataKey="value"
                stroke="#84cc16"
                fill="#84cc16"
                fillOpacity={0.45}
              />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* score rings */}
        <div className="flex flex-wrap justify-center gap-8 md:gap-12 mb-12 md:mb-16">
          <ScoreRing label="Confidence" value={report.confidence} />
          <ScoreRing label="Communication" value={report.communication} />
          <ScoreRing label="Correctness" value={report.correctness} />
          <ScoreRing label="Structure" value={report.structure} />
          <ScoreRing label="Depth" value={report.depth} />
        </div>

        {/* question analysis */}
        <div className="space-y-5 md:space-y-6">
          {report.questionWiseScore.map((q, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ scale: 1.01 }}
              className="border border-lime-500/20 bg-zinc-900/40 backdrop-blur-lg rounded-xl p-4 md:p-6"
            >
              <p className="text-white font-semibold mb-3 text-sm md:text-base">
                Q{i + 1}. {q.question}
              </p>
              <div className="bg-gray-100/10 border mb-2 border-gray-300/20 w-full  text-gray-400 text-sm cursor-pointer tracking-wide p-2  rounded-lg">
                <span className="text-lime-800 inline font-bold">
                  Your answer:
                </span>{" "}
                {q.answer}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-sm text-gray-300 mb-3">
                <p>
                  Confidence:
                  <span className="text-lime-300 ml-1">{q.confidence}</span>
                </p>

                <p>
                  Communication:
                  <span className="text-lime-300 ml-1">{q.communication}</span>
                </p>

                <p>
                  Correctness:
                  <span className="text-lime-300 ml-1">{q.correctness}</span>
                </p>
                <p>
                  Stucture:
                  <span className="text-lime-300 ml-1">{q.correctness}</span>
                </p>
                <p>
                  Depth:
                  <span className="text-lime-300 ml-1">{q.correctness}</span>
                </p>
              </div>

              {q.feedback && (
                <p className="text-lime-600 font-bold text-sm leading-relaxed mt-2">
                  <span className="tracking-wider text-gray-300 inline font-semibold">
                    {" "}
                    Feedback:
                  </span>{" "}
                  {q.feedback}
                </p>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default InterviewReport;
