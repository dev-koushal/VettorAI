import fs from "fs";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import { askAi } from "../services/openRouter.service.js";
import User from "../models/user.model.js";
import Interview from "../models/interview.model.js";

export const analyzeResume = async (req, res) => {
  let filepath;

  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    filepath = req.file.path;

    const fileBuffer = await fs.promises.readFile(filepath);
    const uint8Array = new Uint8Array(fileBuffer);

    const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise;

    let resumeText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();

      const pageText = textContent.items.map((item) => item.str || "").join(" ");

      resumeText += pageText + "\n";
    }

    resumeText = resumeText.replace(/\s+/g, " ").trim();

    const messages = [
      {
        role: "system",
        content: `Extract structured data from resume. Return STRICT JSON only:

{
"role": "candidate's primary job title (ex: Full Stack Developer, Backend Engineer)",
"experience": "summary of work experience excluding the role title",
"projects": ["project1","project2"],
"skills": ["skill1","skill2"]
}`,
      },
      {
        role: "user",
        content: resumeText,
      },
    ];

    const aiResponse = await askAi(messages);

    let parsed;

    try {
      parsed = JSON.parse(aiResponse);
    } catch {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    }

    res.json({
      role: parsed.role || "",
      experience: parsed.experience || "",
      projects: parsed.projects || [],
      skills: parsed.skills || [],
      resumeText,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error analyzing resume" });
  } finally {
    if (filepath && fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }
  }
};

export const generateQuestion = async (req, res) => {
  try {
    let { role, experience, mode, resumeText, projects, skills } = req.body;

    role = role?.trim();
    experience = experience?.trim();
    mode = mode?.trim();

    if (!role || !experience || !mode) {
      return res.status(400).json({ message: "All fields required" });
    }

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.credits < 50) {
      return res.status(404).json({ message: "Buy more credits.Minimum 50" });
    }

    const projectText =
      Array.isArray(projects) && projects.length ? projects.join(", ") : "None";

    const skillsText =
      Array.isArray(skills) && skills.length ? skills.join(", ") : "None";

    const safeResume = resumeText?.trim() || "None";

    const userPrompt = `
    Role:${role}
    Experience:${experience}
    InterviewMode:${mode}
    Projects:${projectText}
    Skills:${skillsText},
    Resume:${safeResume}
    `;

    if (!userPrompt.trim()) {
      return res.status(400).json({
        message: "Prompt not found!!",
      });
    }

    const messages = [
      {
        role: "system",
        content: `
You are a real human interviewer conducting a professional interview.

Speak natural English as if you are directly talking to the candidate.

Generate exactly 5 interview questions.

Strict Rules:
- Each question must contain between 15 and 25 words.
- Each question must be a single complete sentence.
- Do NOT number them.
- Do NOT add explanations.
- Do NOT add extra text before or after.
- One question per line only.
- Keep language simple and conversational.
- Questions should be from previous asked interviews of the big MNC's.
- Questions must feel practical and realistic.

Difficulty progression:
Question 1 → easy  
Question 2 → medium 
Question 3 → medium  
Question 4 → hard  
Question 5 → hard  

Make questions based on the candidate’s role, experience, interviewMode, projects, skills, and resume details.
`,
      },
      {
        role: "user",
        content: userPrompt,
      },
    ];

    const aiResponse = await askAi(messages);

    if (!aiResponse || !aiResponse.trim()) {
      return res.status(500).json({
        message: "Ai returned empty response",
      });
    }

    const questionArray = aiResponse
      .split("\n")
      .map((q) => q.trim())
      .filter((q) => q.length > 0)
      .slice(0, 5);

    if (questionArray.length === 0) {
      return res.status(500).json({
        message: "AI failed to generate questions.",
      });
    }

    user.credits -= 50;
    await user.save();

   const interview = await Interview.create({
  userId: user._id,
  role,
  experience,
  mode,
  resumeText: safeResume,
  questions: questionArray.map((q, index) => ({
    question: q,
    difficulty: ["easy", "medium", "medium", "hard", "hard"][index],
    timeLimit: [60, 90, 90, 120, 120][index],
  })),
});

    res.json({
  interviewId: interview._id,
  creditLeft: user.credits,
  userName: user.name,
  questions:interview.questions,
});
  } catch (error) {
    return res
      .status(400)
      .json({ message: "There is error in generating questions", error });
  }
};

export const submitAnswer = async (req, res) => {
  try {
    const { interviewId, questionsIndex, answer, timeTaken } = req.body;

    const interview = await Interview.findById(interviewId);

    console.log(interview);
if (!interview) {
  return res.status(404).json({ error: "Interview not found" });
}

if (!interview?.questions || interview.questions.length === 0) {
  return res.status(400).json({ error: "No questions found in interview" });
}

if (questionsIndex === undefined) {
  return res.status(400).json({ error: "questionsIndex missing" });
}

const question = interview?.questions[questionsIndex];

if (!question) {
  return res.status(400).json({ error: "Invalid question index" });
}

    if (!answer) {
      question.score = 0;
      question.feedback = "You didn't Attempted question";
      question.answer = "";
      await interview.save();

      return res.json({
        feedback: question.feedback,
      });
    }

    if (timeTaken > question.timeLimit) {
      question.score = 0;
      question.feedback = "Time limit exceeded.";
      question.answer = answer;

      await interview.save();

      return res.json({
        feedback: question.feedback,
      });
    }

    const messages = [
      {
        role: "system",
        content: `
You are a professional human interviewer evaluating a candidate's answer in a real interview.

Evaluate naturally and fairly, like a real person would.

Score the answer in these areas (0 to 10):

1. Confidence – Does the answer sound clear, confident, and well-presented?
2. Communication – Is the language simple, clear, and easy to understand?
3. Correctness – Is the answer accurate, relevant, and complete?
4. Structure – Logical flow (intro → points → conclusion).
5. Depth – Shows real understanding, not just surface-level.
Rules:
- Be realistic and unbiased.
- Do not give random high scores.
- If the answer is weak, score low.
- If the answer is strong and detailed, score high.
- Consider clarity, structure, and relevance.

Calculate:
finalScore = average of confidence, communication, structure, depth and correctness (rounded to nearest whole number).

Feedback Rules:
- Write natural human feedback.
- 15 to 20 words only.
- Sound like real interview feedback.
- Can suggest improvement if needed.
- Do NOT repeat the question.
- Do NOT explain scoring.
- Keep tone professional and honest.

Return ONLY valid JSON in this format:

{
  "confidence": number,
  "communication": number,
  "correctness": number,
  "finalScore": number,
  "structure": number,
  "depth" : number,
  "feedback": "short human feedback"
}
`,
      },
      {
        role: "user",
        content: `
Question: ${question.question}
Answer: ${answer}
`,
      },
    ];

    const aiResponse = await askAi(messages);
    const parsed = JSON.parse(aiResponse);

    question.answer = answer;
    question.confidence = parsed.confidence;
    question.communication = parsed.communication;
    question.correctness = parsed.correctness;
    question.score = parsed.finalScore;
    question.feedback = parsed.feedback;
    question.structure = parsed.structure;
    question.depth = parsed.depth;


    await interview.save();

    return res.status(200).json({ feedback: parsed.feedback });
  } catch (error) {
     console.log("failed to submit answer", error);
  return res.status(500).json({ message: "Failed to submit answer" });
  }
};

export const finishInterview = async (req, res) => {
  try {
    const { interviewId } = req.body;
   
    const interview = await Interview.findById(interviewId);
    console.log(interview)
    
    if (!interview) {
      return res.status(400).json({ message: "failed to find interview!!" });
    }
    

    const totalQuestions = interview.questions.length;

    let totalScore = 0;
    let totalConfidence = 0;
    let totalCommunication = 0;
    let totalCorrectness = 0;
    let totalStructure = 0;
    let totalDepth = 0;

    interview.questions.forEach((q) => {
      totalScore += q.score || 0;
      totalConfidence += q.confidence || 0;
      totalCommunication += q.communication || 0;
      totalCorrectness += q.correctness || 0;
      totalStructure += q.structure || 0;
      totalDepth += q.depth || 0;
    });

    const finalScore = totalQuestions ? totalScore / totalQuestions : 0;
    const avgConfidence = totalQuestions ? totalConfidence / totalQuestions : 0;
    const avgCommunication = totalQuestions
      ? totalCommunication / totalQuestions
      : 0;
    const avgCorrectness = totalQuestions
      ? totalCorrectness / totalQuestions
      : 0;
    const avgStructure = totalQuestions
      ? totalStructure / totalQuestions
      : 0;
    const avgDepth = totalQuestions
      ? totalDepth / totalQuestions
      : 0;
    

    interview.finalScore = finalScore;
    interview.status = "completed";

    await interview.save();

    return res.status(200).json({
      finalScore: Number(finalScore.toFixed(1)),
      confidence: Number(avgConfidence.toFixed(1)),
      communication: Number(avgCommunication.toFixed(1)),
      correctness: Number(avgCorrectness.toFixed(1)),
      structure: Number(avgStructure.toFixed(1)),
      depth: Number(avgDepth.toFixed(1)),
      questionWiseScore: interview.questions.map((q) => ({
        question: q.question,
         answer: q.answer || "",
        score: q.score || 0,
        feedback: q.feedback || "",
        confidence: q.confidence || 0,
        communication: q.communication || 0,
        correctness: q.correctness || 0,
        structure: q.structure || 0,
        depth: q.depth || 0,
      })),
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Error in finishing Error ${error}` });
  }
};

export const getFitScore = async (req, res) => {
  try {
    const { resumeText, jobDescription } = req.body;

    if (!resumeText || !jobDescription) {
      return res.status(400).json({
        message: "resumeText and jobDescription are required",
      });
    }

    const messages = [
      {
        role: "system",
        content: `You are an expert AI recruiter.

Compare the candidate resume with the job description.

Return STRICT JSON only:

{
  "score": number (0-100),
  "matchedSkills": ["skill1","skill2"],
  "missingSkills": ["skill1","skill2"],
  "summary": "short explanation in 1-2 lines",
  "improvements": ["suggestion1","suggestion2"]
}`
      },
      {
        role: "user",
        content: `
RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}
`
      }
    ];

    const aiResponse = await askAi(messages);

    let parsed;

    try {
      parsed = JSON.parse(aiResponse);
    } catch {
      const match = aiResponse.match(/\{[\s\S]*\}/);
      parsed = match ? JSON.parse(match[0]) : {};
    }

    return res.json({
      score: parsed.score || 0,
      matchedSkills: parsed.matchedSkills || [],
      missingSkills: parsed.missingSkills || [],
      summary: parsed.summary || "",
      improvements: parsed.improvements || []
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Error generating fit score",
    });
  }
};