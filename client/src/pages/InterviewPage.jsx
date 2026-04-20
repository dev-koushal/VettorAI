import React, { useState } from 'react'
import SetUpIW from '../components/SetUpIW';
import Interview from '../components/Interview';
import ReportIW from '../components/ReportIW';

function InterviewPage() {
  const [step,setStep] = useState(1);
  const [interviewData, setInterviewData] = useState(null);

  return (
    <div className='bg-black min-h-screen  overflow-hidden'>
      {step === 1 && (<SetUpIW onStart={(data) => {
        setInterviewData(data);
        setStep(2);
      }} />)}
      {step === 2 && (<Interview interviewData={interviewData} onFinish={(report) => {setInterviewData(report); setStep(3)}} />)}
      {step === 3 && (<ReportIW report={interviewData} />)}
    </div>
  )
}

export default InterviewPage