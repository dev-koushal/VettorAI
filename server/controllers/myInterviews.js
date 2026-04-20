import Interview from '../models/interview.model.js'


export const myInterviews = async (req,res) => {
    try {
        
        const interviews = await Interview.find({userId:req.userId})
        .sort({createdAt:-1})
        .select("role experience mode finalScore status createdAt");

        return res.status(200).json(interviews);

    } catch (error) {
        console.log(error)
        return res.status(500).json({message:"Error in fetching the Interviews!!", error})
    }
}

export const getInterviewReport = async (req,res) => {
    try {
        
        const interview = await Interview.findById(req.params.id);
        
        if(!interview){return res.status(404).json({message:"No Interview report found!!"})}

        
    const totalQuestions = interview.questions.length;

    let totalConfidence = 0;
    let totalCommunication = 0;
    let totalCorrectness = 0;

    interview.questions.forEach((q) => {
      
      totalConfidence += q.confidence || 0;
      totalCommunication += q.communication || 0;
      totalCorrectness += q.correctness || 0;
    });

    
    const avgConfidence = totalQuestions ? totalConfidence / totalQuestions : 0;
    const avgCommunication = totalQuestions
      ? totalCommunication / totalQuestions
      : 0;
    const avgCorrectness = totalQuestions
      ? totalCorrectness / totalQuestions
      : 0;

      
   
    return res.json({
      confidence: Number(avgConfidence.toFixed(1)),
      communication: Number(avgCommunication.toFixed(1)),
      correctness: Number(avgCorrectness.toFixed(1)),
      questionWiseScore: interview.questions
    }); 

    } catch (error) {
        console.log(error)
        return res.status(500).json({message:"Error in getting current Interview!!", error})
    }
}