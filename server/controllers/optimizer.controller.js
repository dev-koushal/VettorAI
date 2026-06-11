import { askAi } from "../services/openRouter.service.js";
import Interview from "../models/interview.model.js";

// ─── Optimize a Single Answer ─────────────────────────────────────────────────
export const optimizeAnswer = async (req, res) => {
  try {
    const { interviewId, questionIndex } = req.body;
    const userId = req.userId;

    if (!interviewId || questionIndex === undefined) {
      return res.status(400).json({ message: "interviewId and questionIndex are required" });
    }

    const interview = await Interview.findOne({ _id: interviewId, userId }).lean();
    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    const q = interview.questions[questionIndex];
    if (!q) {
      return res.status(400).json({ message: "Invalid question index" });
    }

    if (!q.answer) {
      return res.status(400).json({ message: "No answer to optimize" });
    }

    const { question, answer, confidence, communication, correctness, structure, depth, score } = q;
    const { role, experience } = interview;

    // Step 1: Diagnose weaknesses
    const diagMessages = [
      {
        role: "system",
        content: `You are an expert interview coach. Diagnose exactly WHY this answer scored low.

Return STRICT JSON only:
{
  "weakAxes": ["Depth", "Structure"],
  "structuralIssues": ["Missing concrete example", "No intro framing"],
  "contentGaps": ["Did not mention tradeoffs", "No specific numbers or metrics"],
  "frameworkNeeded": "STAR | Technical Walkthrough | Problem-Solution-Result | Behavioral"
}`,
      },
      {
        role: "user",
        content: `Role: ${role} | Experience: ${experience}
Question: ${question}
Answer: ${answer}
Scores — Confidence: ${confidence}/10, Communication: ${communication}/10, Correctness: ${correctness}/10, Structure: ${structure}/10, Depth: ${depth}/10, Overall: ${score}/10`,
      },
    ];

    let diagnosis = { weakAxes: [], structuralIssues: [], contentGaps: [], frameworkNeeded: "STAR" };
    try {
      const diagResponse = await askAi(diagMessages);
      const match = diagResponse.match(/\{[\s\S]*\}/);
      diagnosis = match ? JSON.parse(match[0]) : diagnosis;
    } catch {
      // Use defaults
    }

    // Step 2: Generate optimized answer (up to 2 iterations)
    let optimizedAnswer = "";
    let newScores = { confidence: 0, communication: 0, correctness: 0, structure: 0, depth: 0, finalScore: 0 };
    let iterations = 0;

    const rewriteMessages = (currentAnswer, iteration) => [
      {
        role: "system",
        content: `You are an expert interview coach rewriting a candidate's answer to score 9+/10.

CRITICAL RULES:
- ONLY use experience, skills, and projects the candidate actually has
- Do NOT invent fake companies, projects, or experience they don't have
- Match the question's expected framework: ${diagnosis.frameworkNeeded}
- Fix these specific issues: ${[...diagnosis.structuralIssues, ...diagnosis.contentGaps].join(", ")}
- Answer must be deliverable in under 2 minutes (90-200 words)
- Sound like a real human talking, not an essay
- ${iteration > 0 ? "Previous rewrite still scored low on: " + diagnosis.weakAxes.join(", ") + ". Focus harder on these." : ""}

Return STRICT JSON:
{
  "optimizedAnswer": "the rewritten answer",
  "confidence": number (0-10),
  "communication": number (0-10),
  "correctness": number (0-10),
  "structure": number (0-10),
  "depth": number (0-10),
  "finalScore": number (0-10, average of above)
}`,
      },
      {
        role: "user",
        content: `Role: ${role} | Experience: ${experience}
Question: ${question}
Original Answer: ${currentAnswer}
Weak areas to fix: ${diagnosis.weakAxes.join(", ")}
Issues: ${[...diagnosis.structuralIssues, ...diagnosis.contentGaps].join("; ")}

Rewrite to score 9+/10 on all axes.`,
      },
    ];

    let currentAnswer = answer;
    for (let i = 0; i < 2; i++) {
      try {
        const rewriteResponse = await askAi(rewriteMessages(currentAnswer, i));
        const match = rewriteResponse.match(/\{[\s\S]*\}/);
        const parsed = match ? JSON.parse(match[0]) : {};

        optimizedAnswer = parsed.optimizedAnswer || "";
        newScores = {
          confidence: parsed.confidence || 7,
          communication: parsed.communication || 7,
          correctness: parsed.correctness || 7,
          structure: parsed.structure || 7,
          depth: parsed.depth || 7,
          finalScore: parsed.finalScore || 7,
        };
        iterations = i + 1;
        currentAnswer = optimizedAnswer;

        // If all axes >= 7, stop iterating
        if (
          newScores.confidence >= 7 &&
          newScores.communication >= 7 &&
          newScores.correctness >= 7 &&
          newScores.structure >= 7 &&
          newScores.depth >= 7
        ) {
          break;
        }
      } catch {
        break;
      }
    }

    // Step 3: Extract "Why This Works" principles
    const whyMessages = [
      {
        role: "system",
        content: `You are an interview coach. Explain WHY the optimized answer is better in exactly 4 bullet points.
Each bullet: 8-14 words. Start with what structural element was added and why it improves the score.
Return STRICT JSON: { "bullets": ["string", "string", "string", "string"], "frameworkName": "string" }`,
      },
      {
        role: "user",
        content: `Original: ${answer}\nOptimized: ${optimizedAnswer}\nWeak axes fixed: ${diagnosis.weakAxes.join(", ")}`,
      },
    ];

    let whyItWorks = [];
    let frameworkName = diagnosis.frameworkNeeded;
    try {
      const whyResponse = await askAi(whyMessages);
      const match = whyResponse.match(/\{[\s\S]*\}/);
      const parsed = match ? JSON.parse(match[0]) : {};
      whyItWorks = parsed.bullets || [];
      frameworkName = parsed.frameworkName || frameworkName;
    } catch {
      whyItWorks = [
        "Added specific example to demonstrate real-world application",
        "Structured response with clear intro, body, and conclusion",
        "Included measurable outcome or tradeoff to show depth",
        "Used precise technical language appropriate for the role",
      ];
    }

    // Compute simple diff tokens (word-level)
    const computeDiff = (orig, opt) => {
      const origWords = orig.split(/\s+/);
      const optWords = opt.split(/\s+/);
      const diff = [];
      // Simple approach: show original as removed, optimized as added (chunked)
      // For a real diff, a library like `diff` npm package would be used
      const origChunks = orig.match(/.{1,60}/g) || [];
      const optChunks = opt.match(/.{1,60}/g) || [];
      const maxLen = Math.max(origChunks.length, optChunks.length);
      for (let i = 0; i < maxLen; i++) {
        if (origChunks[i] && !optChunks[i]) diff.push({ text: origChunks[i], type: "removed" });
        else if (!origChunks[i] && optChunks[i]) diff.push({ text: optChunks[i], type: "added" });
        else if (origChunks[i] === optChunks[i]) diff.push({ text: origChunks[i], type: "unchanged" });
        else {
          diff.push({ text: origChunks[i], type: "removed" });
          diff.push({ text: optChunks[i], type: "added" });
        }
      }
      return diff;
    };

    const scoreDelta = Number((newScores.finalScore - (score || 0)).toFixed(1));

    return res.json({
      optimizedAnswer,
      originalScores: {
        confidence: confidence || 0,
        communication: communication || 0,
        correctness: correctness || 0,
        structure: structure || 0,
        depth: depth || 0,
        finalScore: score || 0,
      },
      optimizedScores: newScores,
      scoreDelta,
      whyItWorks,
      frameworkName,
      iterations,
      diffTokens: computeDiff(answer, optimizedAnswer),
      diagnosis: {
        weakAxes: diagnosis.weakAxes,
        structuralIssues: diagnosis.structuralIssues,
      },
    });
  } catch (error) {
    console.error("Optimizer error:", error);
    return res.status(500).json({ message: "Failed to optimize answer" });
  }
};
