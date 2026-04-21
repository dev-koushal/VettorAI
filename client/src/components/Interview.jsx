import React, { useEffect, useRef, useState } from "react";
import { easeInOut, motion, time } from "motion/react";
import CameraPreview from "./CameraPreview";
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash } from "react-icons/fa";
import { BsArrowLeft, BsArrowRight} from "react-icons/bs";
import {Timer} from './Timer'
import axios from "axios";
import { ServerURL } from "../App";
import { toast } from "react-toastify";
function Interview({ interviewData, onFinish }) {
  const {interviewId, questions, userName} = interviewData;
  const[isIntroPhase, setIntroPhase] = useState(false);

  const [isMicOn,setIsMicOn] = useState(true);
  const recognitionRef = useRef(null)
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const[answer,setAnswer] = useState("");
  const[feedback,setFeedback] = useState("");
  const[timeLeft,setTimeLeft] = useState(questions[0]?.timeLimit || 60);
  const[isSubmitting, setIsSubmitting] =useState(false)
  const[subtitle,setSubtitle] = useState("");
  const[selectedVoice,setSelectedVoice] = useState(null);
  const[voiceGender,setVoiceGender] = useState("male");
  const[isAIPlaying,setIsAIPlaying] = useState(false);
  const[isCameraOn,setIsCameraOn] = useState(true);


  const currentQuestion = questions[currentIndex];
 
  useEffect(()=>{
    const loadVoices = ()=>{
    const voices = globalThis.speechSynthesis.getVoices();
    if(!voices.length) return;

    const femaleVoice = voices.find(v=>
      v.name.toLowerCase().includes("samantha")||
      v.name.toLowerCase().includes("female")
    );

    if(femaleVoice){
      setSelectedVoice(femaleVoice);
      setVoiceGender("female");
      return;
    }

    const maleVoice = 
    voices.find(v=>
      v.name.toLowerCase().includes("david")||
      v.name.toLowerCase().includes("mark")||
      v.name.toLowerCase().includes("male")
    );

    if(maleVoice){
      setSelectedVoice(maleVoice);
      setVoiceGender("male");
      return;
    }
    setSelectedVoice(voices[0]);
    setVoiceGender('female');
  };
    loadVoices();
    globalThis.speechSynthesis.onvoiceschanged = loadVoices;
  },[]);


  // Speech functionality:
  const speakText = (text)=>{
    return new Promise((resolve)=>{
      if(!window.speechSynthesis || !selectedVoice){
        resolve();
        return;
      }
      window.speechSynthesis.cancel();

      const humanText = text.replace(/,/g,", ... ").replace(/\./g, ". ... ");

      const utterance = new SpeechSynthesisUtterance(humanText);

      utterance.voice = selectedVoice;

      utterance.rate = 0.95;
      utterance.pitch = 1.05;
      utterance.volume = 1;

      utterance.onstart =()=>{
        setIsAIPlaying(true);
        stopMic();
      }

      utterance.onend = ()=>{
        setIsAIPlaying(false);

        if(isMicOn){
          stopMic();
        }

        setTimeout(()=>{
          setSubtitle("");
          resolve();
        }, 300);
      }

      setSubtitle(text);

      window.speechSynthesis.speak(utterance)

    })
  }

  useEffect(()=>{
    if(!selectedVoice){
      return;
    }
    const runIntro = async () => {
      if(isIntroPhase){
        await speakText(`Hi ${userName},This interview will assess your skills and responses in real time. Let’s begin.`);
        
        await speakText(`I'll ask you few questions. Just answer them confidently and naturally, and take your time.`);
        setIntroPhase(false);
      }else if(currentQuestion){
        await new Promise(r=>setTimeout(r,800));

        if(currentIndex === questions.length-1 || currentIndex === questions.length-2 ){
          await speakText("Alright, this one might be bit more challenging.")
        }
        await speakText(currentQuestion?.question);

        if(isMicOn){
          startMic();
        }
      }
    }

    runIntro();

  },[selectedVoice,isIntroPhase,currentIndex])


  useEffect(()=>{
    if(isIntroPhase)return;
    if(!currentQuestion)return;
    if(isSubmitting)return;

    const timer = setInterval(()=>{
      setTimeLeft((prev)=>{
        if(prev <= 1){
          clearInterval(timer)
          return 0
        }
        return prev-1
      })
    },1000);

    return ()=>clearInterval(timer)
  },[isIntroPhase,currentIndex,isSubmitting,currentQuestion])


  // Voice -------> Text
  useEffect(()=>{
    if(!("webkitSpeechRecognition" in window)) return;

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-US"
    recognition.continuous= true;
    recognition.interimResults = false;

    recognition.onresult = (e)=>{
      const transcript = e.results[e.results.length - 1][0].transcript;
      setAnswer((p)=>p+" "+ transcript);
    };
    recognitionRef.current = recognition;
  },[]);

  const startMic = ()=>{
    if(recognitionRef.current && !isAIPlaying){
      try {
        recognitionRef.current.start();
      } catch (error) { }
    }
  };
  const stopMic = ()=>{
    if(recognitionRef.current){
      recognitionRef.current.stop();
    }
  };

  const toggleMic = ()=>{
    if(isMicOn){
      stopMic();
    }else{
      startMic();
    }
    setIsMicOn(!isMicOn);
  }

  const submitAnswer = async () => {
    if(isSubmitting)return;
    stopMic()
    setIsSubmitting(true);
    
    try {
      // console.log(questions);
      const result = await axios.post(ServerURL+"/api/interview/submit-answer",{
        interviewId,
        questionsIndex: currentIndex,
        answer,
        timeTaken:currentQuestion.timeLimit - timeLeft,
      },{withCredentials:true})

      setFeedback(result.data.feedback);
      speakText(result.data.feedback)
      setIsSubmitting(false);
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.error || "Something went wrong");
    }
  }

  const handleNext = async () => {
    setAnswer("");
    setFeedback("");

    if(currentIndex + 1 >= questions.length){
      finishInterview();
      return;
    }

    await speakText("let's move to next question.");

    setCurrentIndex(currentIndex +1);
    setTimeout(() => {
      if(isMicOn) startMic();
    }, 600);
  }

 const finishInterview = async () => {
  stopMic();
  setIsMicOn(false);

  try {
    const result = await axios.post(
      ServerURL + "/api/interview/finish",
      { interviewId },
      { withCredentials: true }
    );

    console.log(result.data)

    onFinish(result.data);
    navigate("/history");

  } catch (error) {
    console.log(error.response.data.message);
  }
};

  useEffect(()=>{
    if(isIntroPhase)return;
    if(!currentQuestion)return;

    if(timeLeft ===0 && !isSubmitting && !feedback){
      submitAnswer();
    }
  },[timeLeft])

  useEffect(()=>{
    return ()=>{
      if(recognitionRef.current){
        recognitionRef.current.stop();
        recognitionRef.current.abort();
      }
      window.speechSynthesis.cancel();
    }
  },[])

  useEffect(() => {
  if (currentQuestion) {
    setTimeLeft(currentQuestion.timeLimit);
  }
}, [currentIndex, currentQuestion]);


  return (
    <div className="min-h-screen flex justify-center items-center bg-linear-to-br from-black to-lime-950 relative overflow-hidden py-4">
      <div className="absolute w-[600px] h-[400px] bg-lime-500/20 blur-[120px] -top-40 -left-40 rounded-full" />
      <div className="absolute w-[600px] h-[400px] bg-lime-500/10 blur-[100px] -bottom-40 -right-40 rounded-full" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-[95%] max-w-6xl grid md:grid-cols-[320px_1fr] gap-6 bg-white/10 p-4 rounded-xl z-10 border border-gray-300 mt-20 md:mt-20"
      >
        {/* LEFT CARD */}
        <div className="bg-black/60 backdrop-blur-xl border border-lime-500/20 rounded-xl p-4 shadow-lg shadow-lime-500/10">
          <div className="w-full h-[160px] bg-zinc-800 rounded-lg mb-4">
           
            <div className="w-full h-[160px] bg-zinc-800 rounded-lg mb-4 relative overflow-hidden">

  <CameraPreview isCameraOn={isCameraOn} />

  {/* Camera Toggle */}
  <button
    onClick={() => setIsCameraOn(prev => !prev)}
    className={`absolute bottom-2 right-2 rounded-full ${!isCameraOn?"bg-lime-500":"bg-red-400"} duration-300 text-black text-xs px-3 py-1  font-semibold transition`}
  >
    {isCameraOn ? <FaVideoSlash size={21}/> : <FaVideo size={20}/>} 
  </button>

</div>
          </div>

          <div className="flex justify-between text-sm text-zinc-400 mb-4">
            <span>Interview Status</span>
            {isAIPlaying && <span className="text-lime-400">{isAIPlaying? "AI Speaking": ""}</span>}
          </div>

          <div className="flex justify-center mb-4">
            
           <Timer timeLeft={timeLeft} totalTime={currentQuestion?.timeLimit || 60} />
          </div>

          <div className="border-t border-lime-500/20 my-3" />

          <div className="flex justify-between text-xs text-zinc-400">
            <span>
              <span className="text-lime-400 font-semibold">{currentIndex+1}</span> Current
              Question
            </span>
            <span>
              <span className="text-lime-400 font-semibold">5</span> Total
              Questions
            </span>
          </div>
          <div><h1 className="text-xs text-gray-200/60 mt-4 tracking-widest">Subtitles: <p className="text-gray-50/50">{subtitle}</p></h1></div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex flex-col gap-4">
          <h2 className="text-lime-400 font-semibold text-lg">
            Interview
          </h2>

          <div className="bg-black/60 border border-lime-500/20 rounded-lg p-4 text-zinc-300">
            <p className="text-xs text-zinc-500 mb-1">Question {currentIndex+1} of 5</p>
            <p className="text-sm">{isIntroPhase? "AI is preparing your question..." :currentQuestion?.question}</p>
          </div>

          <textarea
            onChange={(e)=>setAnswer(e.target.value)}
            value={answer}
            placeholder="Type your answer here..."
            className="flex-1 min-h-[260px] bg-black/60 border border-lime-500/20 rounded-lg p-4 text-zinc-300 outline-none focus:border-lime-400 resize-none"
          />

        {!feedback? (<div className="flex gap-2">
           <motion.button whileTap={{opacity:0}} transition={{ease:easeInOut, duration:0.4}} className={`h-12 w-12 ${isMicOn?"bg-lime-500":"bg-red-300"} flex justify-center items-center rounded-full cursor-pointer`} onClick={toggleMic}>
            {isMicOn?<FaMicrophone size={30} />:<FaMicrophoneSlash size={38} />}
           </motion.button>
          <button className="text-white bg-lime-500 hover:bg-lime-400 transition rounded-lg disabled:bg-gray-700 py-3 font-medium text-black w-[95%]" onClick={submitAnswer}
          disabled={isSubmitting}>
            {isSubmitting?"Submitting Answer...":"Submit Answer"}
          </button>
         </div>):
         <motion.div className="mt-6 bg-emerald-50 border border-emerald-200 p-5 rounded-2xl shadow-sm">
          <p className="text-lime-700 font-medium mb-4 tracking-wider">{feedback}</p>
          <button className="w-full bg-linear-to-r from-lime-600 to-lime-900 text-white py-3 rounded-xl shadow-md hover:opacity-90 transition flex items-center justify-center gap-1" onClick={handleNext}>
            Next Question <BsArrowRight size={18}/>
          </button>
         </motion.div>
         }
        </div>
      </motion.div>
    </div>
  );
}

export default Interview;
