import React, { useState, lazy, Suspense } from 'react'
const SetUpIW = lazy(() => import('../components/SetUpIW'));
const Interview = lazy(() => import('../components/Interview'));
const ReportIW = lazy(() => import('../components/ReportIW'));

function InterviewPage() {
  const [step,setStep] = useState(1);
  const [interviewData, setInterviewData] = useState(null);

  return (
    <div className='bg-black min-h-screen  overflow-hidden'>
      {step === 1 && (
        <Suspense fallback={<div />}>
          <SetUpIW onStart={(data) => {
            setInterviewData(data);
            setStep(2);
          }} />
        </Suspense>
      )}

      {step === 2 && (
        <Suspense fallback={<div />}>
          <Interview interviewData={interviewData} onFinish={(report) => {setInterviewData(report); setStep(3)}} />
        </Suspense>
      )}

      {step === 3 && (
        <Suspense fallback={<div />}>
          <ReportIW report={interviewData} />
        </Suspense>
      )}
    </div>
  )
}

export default InterviewPage