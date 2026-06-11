import React, { useEffect, useRef, useState, lazy, Suspense } from "react";
import { easeInOut, motion, AnimatePresence } from "motion/react";
const CameraPreview = lazy(() => import("./CameraPreview"));
import {
  FaMicrophone,
  FaMicrophoneSlash,
  FaVideo,
  FaVideoSlash,
  FaBolt,
} from "react-icons/fa";
import { BsArrowRight } from "react-icons/bs";
const Timer = lazy(() =>
  import("./Timer").then((mod) => ({ default: mod.Timer }))
);
import axios from "axios";
import { ServerURL } from "../App";
import { toast } from "react-toastify";

// ── Filler word list ──────────────────────────────────────────────────────────
const FILLER_WORDS = ["um", "uh", "like", "basically", "you know", "right", "sort of", "kind of", "literally"];

const countFillers = (text) => {
  if (!text) return 0;
  const lower = text.toLowerCase();
  return FILLER_WORDS.reduce((count, fw) => {
    const regex = new RegExp(`\\b${fw}\\b`, "g");
    return count + (lower.match(regex) || []).length;
  }, 0);
};

// ── Score Bar component ───────────────────────────────────────────────────────
function ScoreBar({ label, value, max = 10 }) {
  const pct = Math.min(100, (value / max) * 100);
  const color =
    value >= 7
      ? "bg-lime-400"
      : value >= 5
      ? "bg-amber-400"
      : value > 0
      ? "bg-red-400"
      : "bg-zinc-700";
  return (
    <div className="mb-2">
      <div className="flex justify-between text-xs text-zinc-400 mb-1">
        <span>{label}</span>
        <span className={value >= 7 ? "text-lime-400" : value >= 5 ? "text-amber-400" : value > 0 ? "text-red-400" : "text-zinc-600"}>
          {value > 0 ? `${value}/10` : "—"}
        </span>
      </div>
      <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

// ── Micro-Coaching Drawer ────────────────────────────────────────────────────
function MicroCoachingDrawer({ coaching, onDismiss }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 9000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="absolute bottom-4 left-0 right-0 mx-4 z-30 bg-black/90 border border-lime-500/30 backdrop-blur-xl rounded-2xl p-4 shadow-2xl shadow-lime-500/10"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-lime-400 rounded-full animate-pulse" />
            <span className="text-xs text-lime-400 font-semibold tracking-widest uppercase">
              AI Coaching
            </span>
          </div>
          <button
            onClick={onDismiss}
            className="text-zinc-500 hover:text-white text-xs transition"
          >
            dismiss
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-lime-500/10 border border-lime-500/20 rounded-xl p-3">
            <p className="text-xs text-lime-400 font-semibold mb-1">✓ What Worked</p>
            <p className="text-xs text-gray-300 leading-relaxed">{coaching.whatWorked}</p>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
            <p className="text-xs text-amber-400 font-semibold mb-1">→ To Improve</p>
            <p className="text-xs text-gray-300 leading-relaxed">{coaching.whatToFix}</p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Main Interview Component ─────────────────────────────────────────────────
function Interview({ interviewData, onFinish }) {
  const { interviewId, questions, userName } = interviewData;
  const [isIntroPhase, setIntroPhase] = useState(false);

  const [isMicOn, setIsMicOn] = useState(true);
  const recognitionRef = useRef(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [timeLeft, setTimeLeft] = useState(questions[0]?.timeLimit || 60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subtitle, setSubtitle] = useState("");
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [voiceGender, setVoiceGender] = useState("male");
  const [isAIPlaying, setIsAIPlaying] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);

  // ── Autopilot state ──
  const [liveScores, setLiveScores] = useState(null);
  const [coaching, setCoaching] = useState(null);
  const [followUpQ, setFollowUpQ] = useState(null);
  const [isFollowUp, setIsFollowUp] = useState(false);
  const [fillerCount, setFillerCount] = useState(0);
  const [sessionScores, setSessionScores] = useState([]);
  const [showCoaching, setShowCoaching] = useState(false);
  const [isGeneratingFollowUp, setIsGeneratingFollowUp] = useState(false);

  const currentQuestion = isFollowUp ? followUpQ : questions[currentIndex];

  // ── Voice loading ────────────────────────────────────────────────────────────
  useEffect(() => {
    const loadVoices = () => {
      const voices = globalThis.speechSynthesis.getVoices();
      if (!voices.length) return;
      const femaleVoice = voices.find(
        (v) =>
          v.name.toLowerCase().includes("samantha") ||
          v.name.toLowerCase().includes("female")
      );
      if (femaleVoice) { setSelectedVoice(femaleVoice); setVoiceGender("female"); return; }
      const maleVoice = voices.find(
        (v) =>
          v.name.toLowerCase().includes("david") ||
          v.name.toLowerCase().includes("mark") ||
          v.name.toLowerCase().includes("male")
      );
      if (maleVoice) { setSelectedVoice(maleVoice); setVoiceGender("male"); return; }
      setSelectedVoice(voices[0]);
      setVoiceGender("female");
    };
    loadVoices();
    globalThis.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  // ── TTS ──────────────────────────────────────────────────────────────────────
  const speakText = (text) => {
    return new Promise((resolve) => {
      if (!window.speechSynthesis || !selectedVoice) { resolve(); return; }
      window.speechSynthesis.cancel();
      const humanText = text.replace(/,/g, ", ... ").replace(/\./g, ". ... ");
      const utterance = new SpeechSynthesisUtterance(humanText);
      utterance.voice = selectedVoice;
      utterance.rate = 0.95;
      utterance.pitch = 1.05;
      utterance.volume = 1;
      utterance.onstart = () => { setIsAIPlaying(true); stopMic(); };
      utterance.onend = () => {
        setIsAIPlaying(false);
        if (isMicOn) stopMic();
        setTimeout(() => { setSubtitle(""); resolve(); }, 300);
      };
      setSubtitle(text);
      window.speechSynthesis.speak(utterance);
    });
  };

  // ── Intro & question read ────────────────────────────────────────────────────
  useEffect(() => {
    if (!selectedVoice) return;
    const runIntro = async () => {
      if (isIntroPhase) {
        await speakText(`Hi ${userName},This interview will assess your skills in real time. Let's begin.`);
        await speakText(`I'll ask you a few questions. Just answer them confidently.`);
        setIntroPhase(false);
      } else if (currentQuestion && !isFollowUp) {
        await new Promise((r) => setTimeout(r, 800));
        if (currentIndex === questions.length - 1 || currentIndex === questions.length - 2) {
          await speakText("Alright, this one might be a bit more challenging.");
        }
        await speakText(currentQuestion?.question);
        if (isMicOn) startMic();
      } else if (isFollowUp && currentQuestion) {
        await new Promise((r) => setTimeout(r, 400));
        await speakText("Good start — let me follow up on that.");
        await speakText(currentQuestion.question);
        if (isMicOn) startMic();
      }
    };
    runIntro();
  }, [selectedVoice, isIntroPhase, currentIndex, isFollowUp]);

  // ── Timer ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (isIntroPhase || !currentQuestion || isSubmitting) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) { clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isIntroPhase, currentIndex, isSubmitting, currentQuestion, isFollowUp]);

  // ── STT ──────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!("webkitSpeechRecognition" in window)) return;
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.onresult = (e) => {
      const transcript = e.results[e.results.length - 1][0].transcript;
      setAnswer((p) => p + " " + transcript);
    };
    recognitionRef.current = recognition;
  }, []);

  const startMic = () => {
    if (recognitionRef.current && !isAIPlaying) {
      try { recognitionRef.current.start(); } catch {}
    }
  };
  const stopMic = () => { if (recognitionRef.current) recognitionRef.current.stop(); };
  const toggleMic = () => {
    if (isMicOn) stopMic(); else startMic();
    setIsMicOn(!isMicOn);
  };

  // Track filler words in real-time
  useEffect(() => { setFillerCount(countFillers(answer)); }, [answer]);

  // ── Submit Answer ─────────────────────────────────────────────────────────────
  const submitAnswer = async () => {
    if (isSubmitting) return;
    stopMic();
    setIsSubmitting(true);

    try {
      // If this is a follow-up answer, we don't save to DB (it's a local coaching moment)
      if (isFollowUp) {
        const feedbackMsg = "Great — I can see you elaborated further. Let's continue.";
        setFeedback(feedbackMsg);
        speakText(feedbackMsg);
        setIsSubmitting(false);
        setIsFollowUp(false);
        setFollowUpQ(null);
        return;
      }

      const result = await axios.post(
        ServerURL + "/api/interview/submit-answer",
        {
          interviewId,
          questionsIndex: currentIndex,
          answer,
          timeTaken: currentQuestion.timeLimit - timeLeft,
        },
        { withCredentials: true }
      );

      const scores = result.data.scores || null;
      setFeedback(result.data.feedback);

      // Update live score panel
      if (scores) {
        setLiveScores(scores);
        setSessionScores((prev) => [...prev, scores.finalScore || 0]);

        // P0: Trigger follow-up if depth < 6
        const depthScore = scores.depth || 0;
        if (depthScore < 6 && !isFollowUp) {
          triggerFollowUp(depthScore);
        }

        // P0: Generate micro-coaching
        fetchCoaching(scores);
      }

      speakText(result.data.feedback);
      setIsSubmitting(false);
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.error || "Something went wrong");
      setIsSubmitting(false);
    }
  };

  // ── P0: Follow-up question generation ────────────────────────────────────────
  const triggerFollowUp = async (depthScore) => {
    setIsGeneratingFollowUp(true);
    try {
      const result = await axios.post(
        ServerURL + "/api/ai/autopilot/follow-up",
        {
          question: currentQuestion?.question,
          answer,
          role: interviewData.role || "Software Engineer",
          depthScore,
        },
        { withCredentials: true }
      );
      if (result.data.followUp) {
        setFollowUpQ({ question: result.data.followUp, timeLimit: 60 });
      }
    } catch {
      // Silent fail
    } finally {
      setIsGeneratingFollowUp(false);
    }
  };

  // ── P0: Micro-coaching fetch ──────────────────────────────────────────────────
  const fetchCoaching = async (scores) => {
    try {
      const result = await axios.post(
        ServerURL + "/api/ai/autopilot/coaching",
        {
          question: currentQuestion?.question,
          answer,
          scores,
          role: interviewData.role || "Software Engineer",
        },
        { withCredentials: true }
      );
      setCoaching(result.data);
      setShowCoaching(true);
    } catch {
      // Silent fail
    }
  };

  // ── Handle Next / Follow-up ───────────────────────────────────────────────────
  const handleNext = async () => {
    // If there's a follow-up waiting and we haven't done it yet, show it
    if (followUpQ && !isFollowUp) {
      setIsFollowUp(true);
      setAnswer("");
      setFeedback("");
      setTimeLeft(60);
      setTimeout(() => { if (isMicOn) startMic(); }, 600);
      return;
    }

    setAnswer("");
    setFeedback("");
    setFollowUpQ(null);
    setIsFollowUp(false);
    setLiveScores(null);
    setShowCoaching(false);
    setCoaching(null);

    if (currentIndex + 1 >= questions.length) {
      finishInterview();
      return;
    }

    await speakText("Let's move to the next question.");
    setCurrentIndex(currentIndex + 1);
    setTimeout(() => { if (isMicOn) startMic(); }, 600);
  };

  const skipFollowUp = () => {
    setFollowUpQ(null);
    handleNext();
  };

  // ── Finish Interview ──────────────────────────────────────────────────────────
  const finishInterview = async () => {
    stopMic();
    setIsMicOn(false);
    try {
      const result = await axios.post(
        ServerURL + "/api/interview/finish",
        { interviewId },
        { withCredentials: true }
      );
      onFinish(result.data);
    } catch (error) {
      console.log(error.response?.data?.message);
    }
  };

  // ── Auto-submit on timeout ────────────────────────────────────────────────────
  useEffect(() => {
    if (isIntroPhase || !currentQuestion) return;
    if (timeLeft === 0 && !isSubmitting && !feedback) submitAnswer();
  }, [timeLeft]);

  useEffect(() => {
    if (currentQuestion) setTimeLeft(currentQuestion.timeLimit || 60);
  }, [currentIndex, isFollowUp]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current.abort();
      }
      window.speechSynthesis.cancel();
    };
  }, []);

  // ── Session trend ─────────────────────────────────────────────────────────────
  const sessionAvg =
    sessionScores.length > 0
      ? sessionScores.reduce((a, b) => a + b, 0) / sessionScores.length
      : null;

  const prevScore = sessionScores.length >= 2 ? sessionScores[sessionScores.length - 2] : null;
  const currScore = sessionScores.length >= 1 ? sessionScores[sessionScores.length - 1] : null;
  const trendDelta = prevScore !== null && currScore !== null ? currScore - prevScore : null;

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-black to-lime-950 relative overflow-hidden py-4">
      <div className="absolute w-[600px] h-[400px] bg-lime-500/20 blur-[120px] -top-40 -left-40 rounded-full" />
      <div className="absolute w-[600px] h-[400px] bg-lime-500/10 blur-[100px] -bottom-40 -right-40 rounded-full" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-[95%] max-w-7xl grid md:grid-cols-[300px_1fr_220px] gap-4 bg-white/5 p-4 rounded-2xl z-10 border border-white/10 mt-20 relative"
      >
        {/* ── LEFT: Camera + Status ─────────────────────────────────────────── */}
        <div className="bg-black/60 backdrop-blur-xl border border-lime-500/20 rounded-xl p-4 shadow-lg shadow-lime-500/10 flex flex-col gap-3">
          <div className="w-full h-[160px] bg-zinc-800 rounded-lg relative overflow-hidden">
            <Suspense fallback={<div className="w-full h-full flex items-center justify-center text-zinc-400">Camera</div>}>
              <CameraPreview isCameraOn={isCameraOn} />
            </Suspense>
            <button
              onClick={() => setIsCameraOn((prev) => !prev)}
              className={`absolute bottom-2 right-2 rounded-full ${isCameraOn ? "bg-lime-500" : "bg-red-400"} duration-300 text-black text-xs px-3 py-1 font-semibold transition`}
            >
              {!isCameraOn ? <FaVideoSlash size={18} /> : <FaVideo size={18} />}
            </button>
          </div>

          <div className="flex justify-between text-xs text-zinc-400">
            <span>Interview Status</span>
            {isAIPlaying && (
              <span className="text-lime-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-lime-400 rounded-full animate-pulse" />
                AI Speaking
              </span>
            )}
          </div>

          <Suspense fallback={<div>...</div>}>
            <Timer timeLeft={timeLeft} totalTime={currentQuestion?.timeLimit || 60} />
          </Suspense>

          <div className="border-t border-lime-500/20 my-1" />

          <div className="flex justify-between text-xs text-zinc-400">
            <span>
              <span className="text-lime-400 font-semibold">{currentIndex + 1}</span> / {questions.length}
              {isFollowUp && <span className="text-amber-400 ml-1">(follow-up)</span>}
            </span>
            {sessionAvg !== null && (
              <span className="text-lime-300">Avg: {sessionAvg.toFixed(1)}</span>
            )}
          </div>

          {/* Filler word badge */}
          {fillerCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={`text-xs px-2 py-1 rounded-lg text-center ${
                fillerCount > 5 ? "bg-red-500/20 text-red-300" : "bg-amber-500/15 text-amber-300"
              }`}
            >
              Filler words: {fillerCount} {fillerCount > 5 ? "⚠️" : ""}
            </motion.div>
          )}

          <div>
            <h1 className="text-xs text-gray-400 tracking-widest">
              Subtitles:{" "}
              <span className="text-gray-50/50">{subtitle}</span>
            </h1>
          </div>
        </div>

        {/* ── CENTER: Question + Answer ─────────────────────────────────────── */}
        <div className="flex flex-col gap-4 relative">
          <div className="flex items-center justify-between">
            <h2 className="text-lime-400 font-semibold text-lg">
              {isFollowUp ? "Follow-up Question" : "Interview"}
            </h2>
            {isGeneratingFollowUp && (
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 1.2 }}
                className="text-xs text-amber-400 flex items-center gap-1.5"
              >
                <FaBolt size={10} />
                Follow-up incoming...
              </motion.div>
            )}
          </div>

          <div className={`border rounded-lg p-4 text-zinc-300 ${isFollowUp ? "border-amber-500/30 bg-amber-900/10" : "bg-black/60 border-lime-500/20"}`}>
            <p className="text-xs text-zinc-500 mb-1">
              Question {currentIndex + 1}{isFollowUp ? " (Follow-up)" : ""}
            </p>
            <p className="text-sm">
              {isIntroPhase ? "AI is preparing your question..." : currentQuestion?.question}
            </p>
          </div>

          <textarea
            onChange={(e) => setAnswer(e.target.value)}
            value={answer}
            placeholder="Type your answer here..."
            className="flex-1 min-h-[220px] bg-black/60 border border-lime-500/20 rounded-lg p-4 text-zinc-300 outline-none focus:border-lime-400 resize-none"
          />

          {!feedback ? (
            <div className="flex gap-2">
              <motion.button
                whileTap={{ opacity: 0 }}
                transition={{ ease: easeInOut, duration: 0.4 }}
                className={`h-12 w-12 ${isMicOn ? "bg-lime-500" : "bg-red-300"} flex justify-center items-center rounded-full cursor-pointer flex-shrink-0`}
                onClick={toggleMic}
              >
                {isMicOn ? <FaMicrophone size={22} /> : <FaMicrophoneSlash size={28} />}
              </motion.button>
              <button
                className="text-white bg-lime-500 hover:bg-lime-400 transition rounded-lg disabled:bg-gray-700 py-3 font-medium text-black w-[95%]"
                onClick={submitAnswer}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Answer"}
              </button>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <div className="bg-emerald-50/5 border border-emerald-500/20 p-4 rounded-2xl">
                <p className="text-lime-600 font-medium tracking-wider text-sm">{feedback}</p>
              </div>

              <div className="flex gap-2">
                {followUpQ && !isFollowUp && (
                  <button
                    onClick={skipFollowUp}
                    className="flex-1 border border-lime-500/30 text-lime-400 py-3 rounded-xl hover:bg-lime-500/10 transition text-sm"
                  >
                    Skip Follow-up
                  </button>
                )}
                <button
                  className="flex-1 bg-gradient-to-r from-lime-600 to-lime-900 text-white py-3 rounded-xl shadow-md hover:opacity-90 transition flex items-center justify-center gap-1"
                  onClick={handleNext}
                >
                  {followUpQ && !isFollowUp
                    ? "Answer Follow-up"
                    : currentIndex + 1 >= questions.length && !isFollowUp
                    ? "Finish Interview"
                    : "Next Question"}{" "}
                  <BsArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {/* Micro-coaching drawer */}
          {showCoaching && coaching && (
            <MicroCoachingDrawer
              coaching={coaching}
              onDismiss={() => setShowCoaching(false)}
            />
          )}
        </div>

        {/* ── RIGHT: Live Score Panel ───────────────────────────────────────── */}
        <div className="hidden md:flex flex-col bg-black/60 border border-lime-500/20 rounded-xl p-4 gap-3">
          <div className="flex items-center gap-2 mb-1">
            <div className={`w-2 h-2 rounded-full ${liveScores ? "bg-lime-400 animate-pulse" : "bg-zinc-700"}`} />
            <span className="text-xs text-zinc-400 font-semibold tracking-widest uppercase">
              Live Scores
            </span>
          </div>

          {liveScores ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col gap-1"
            >
              <ScoreBar label="Confidence" value={liveScores.confidence || 0} />
              <ScoreBar label="Comm." value={liveScores.communication || 0} />
              <ScoreBar label="Correctness" value={liveScores.correctness || 0} />
              <ScoreBar label="Structure" value={liveScores.structure || 0} />
              <ScoreBar label="Depth" value={liveScores.depth || 0} />

              <div className="border-t border-lime-500/10 mt-2 pt-2">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400">Score</span>
                  <span
                    className={`font-bold ${
                      liveScores.finalScore >= 7
                        ? "text-lime-400"
                        : liveScores.finalScore >= 5
                        ? "text-amber-400"
                        : "text-red-400"
                    }`}
                  >
                    {liveScores.finalScore?.toFixed(1)}/10
                  </span>
                </div>
              </div>

              {trendDelta !== null && (
                <div className="flex items-center gap-1 text-xs mt-1">
                  <span
                    className={trendDelta > 0 ? "text-lime-400" : trendDelta < 0 ? "text-red-400" : "text-zinc-400"}
                  >
                    {trendDelta > 0 ? "↗" : trendDelta < 0 ? "↘" : "→"}{" "}
                    {trendDelta > 0 ? "+" : ""}
                    {trendDelta.toFixed(1)} vs prev
                  </span>
                </div>
              )}
            </motion.div>
          ) : (
            <div className="flex flex-col gap-2 mt-1">
              {["Confidence", "Comm.", "Correctness", "Structure", "Depth"].map((l) => (
                <div key={l}>
                  <div className="flex justify-between text-xs text-zinc-600 mb-1">
                    <span>{l}</span>
                    <span>—</span>
                  </div>
                  <div className="h-1.5 bg-zinc-800 rounded-full" />
                </div>
              ))}
              <p className="text-xs text-zinc-600 text-center mt-2">
                Scores appear after submission
              </p>
            </div>
          )}

          <div className="border-t border-lime-500/10 mt-auto pt-3">
            <p className="text-xs text-zinc-600 text-center">
              {questions.length} questions · Autopilot active
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Interview;
