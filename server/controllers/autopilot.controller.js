import { askAi } from "../services/openRouter.service.js";
import Interview from "../models/interview.model.js";
import User from "../models/user.model.js";

// ─── Generate Follow-Up Question ─────────────────────────────────────────────
export const generateFollowUp = async (req, res) => {
  try {
    const { question, answer, role, depthScore } = req.body;

    if (!question || !answer || !role) {
      return res.status(400).json({ message: "question, answer, and role are required" });
    }

    // Only generate follow-up if depth is weak
    if (depthScore !== undefined && depthScore >= 6) {
      return res.json({ followUp: null, reason: "depth_sufficient" });
    }

    const messages = [
      {
        role: "system",
        content: `You are a professional interviewer. The candidate gave a shallow answer.
Generate ONE targeted follow-up question to probe for deeper understanding.

Rules:
- 10 to 20 words only
- Must be a question (end with ?)
- Must directly reference the candidate's answer content
- Must ask for a specific example, tradeoff, or deeper mechanism
- Do NOT repeat the original question
- Sound natural and conversational

Return ONLY the follow-up question. No preamble, no explanation.`,
      },
      {
        role: "user",
        content: `Role: ${role}
Original Question: ${question}
Candidate's Answer: ${answer}
Depth Score: ${depthScore ?? "not provided"}/10

Generate one follow-up question to probe deeper.`,
      },
    ];

    const aiResponse = await askAi(messages);
    const followUp = aiResponse.trim();

    // Validate: must be a question and reasonable length
    if (!followUp.endsWith("?") || followUp.split(" ").length < 8) {
      return res.json({ followUp: null, reason: "invalid_generation" });
    }

    return res.json({ followUp });
  } catch (error) {
    console.error("Follow-up generation error:", error);
    return res.status(500).json({ message: "Failed to generate follow-up" });
  }
};

// ─── Generate Micro-Coaching ─────────────────────────────────────────────────
export const generateCoaching = async (req, res) => {
  try {
    const { question, answer, scores, role } = req.body;

    if (!question || !answer || !scores) {
      return res.status(400).json({ message: "question, answer, and scores are required" });
    }

    const { confidence, communication, correctness, structure, depth, finalScore } = scores;

    const messages = [
      {
        role: "system",
        content: `You are an interview coach giving instant post-answer feedback.

Generate TWO things:
1. "whatWorked": One specific thing the candidate did well. 8-12 words. Start with a verb.
2. "whatToFix": One specific, actionable improvement. 8-15 words. Be precise, not generic.

Rules:
- Never say "Great answer" or generic praise
- Reference the actual content or score axes
- "whatToFix" must be specific and implementable
- Sound like a real coach, not an AI

Return STRICT JSON only:
{
  "whatWorked": "string",
  "whatToFix": "string"
}`,
      },
      {
        role: "user",
        content: `Role: ${role}
Question: ${question}
Answer: ${answer}

Scores:
- Confidence: ${confidence}/10
- Communication: ${communication}/10
- Correctness: ${correctness}/10
- Structure: ${structure}/10
- Depth: ${depth}/10
- Overall: ${finalScore}/10

Generate coaching feedback.`,
      },
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
      whatWorked: parsed.whatWorked || "Provided a structured response.",
      whatToFix: parsed.whatToFix || "Add a concrete example to increase depth.",
    });
  } catch (error) {
    console.error("Coaching generation error:", error);
    return res.status(500).json({ message: "Failed to generate coaching" });
  }
};

// ─── Session Synthesis ────────────────────────────────────────────────────────
export const generateSynthesis = async (req, res) => {
  try {
    const { interviewId } = req.body;

    if (!interviewId) {
      return res.status(400).json({ message: "interviewId is required" });
    }

    const interview = await Interview.findById(interviewId).lean();
    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    const { role, questions, finalScore } = interview;
    const completedQuestions = questions.filter((q) => q.answer && q.score > 0);

    if (completedQuestions.length === 0) {
      return res.json({
        trend: "stable",
        trendDelta: 0,
        practiceAreas: ["Complete more questions for analysis"],
        percentileRank: null,
        executiveSummary: "Session incomplete — not enough data for synthesis.",
      });
    }

    // Compute score trend (first half vs second half)
    const mid = Math.floor(completedQuestions.length / 2);
    const firstHalf = completedQuestions.slice(0, mid || 1);
    const secondHalf = completedQuestions.slice(mid || 1);

    const avgFirst =
      firstHalf.reduce((s, q) => s + (q.score || 0), 0) / (firstHalf.length || 1);
    const avgSecond =
      secondHalf.reduce((s, q) => s + (q.score || 0), 0) / (secondHalf.length || 1);
    const trendDelta = Number((avgSecond - avgFirst).toFixed(1));
    const trend =
      trendDelta > 0.3 ? "improving" : trendDelta < -0.3 ? "declining" : "stable";

    // Find weakest axes
    const axisAvgs = {
      Confidence:
        completedQuestions.reduce((s, q) => s + (q.confidence || 0), 0) /
        completedQuestions.length,
      Communication:
        completedQuestions.reduce((s, q) => s + (q.communication || 0), 0) /
        completedQuestions.length,
      Correctness:
        completedQuestions.reduce((s, q) => s + (q.correctness || 0), 0) /
        completedQuestions.length,
      Structure:
        completedQuestions.reduce((s, q) => s + (q.structure || 0), 0) /
        completedQuestions.length,
      Depth:
        completedQuestions.reduce((s, q) => s + (q.depth || 0), 0) /
        completedQuestions.length,
    };

    const sortedAxes = Object.entries(axisAvgs)
      .sort(([, a], [, b]) => a - b)
      .slice(0, 3)
      .map(([name]) => `Improve ${name} in answers`);

    // Compute basic percentile (compare against typical score distributions)
    // Using a simple model: score distribution approximated as
    // <4 = bottom 20%, 4-5.5 = 40%, 5.5-7 = 65%, 7-8.5 = 82%, >8.5 = 93%
    const computePercentile = (score) => {
      if (score >= 8.5) return 93;
      if (score >= 7) return 82;
      if (score >= 5.5) return 65;
      if (score >= 4) return 40;
      return 20;
    };

    const percentileRank = computePercentile(finalScore || 0);

    // Generate executive summary
    const messages = [
      {
        role: "system",
        content: `You are an expert interview coach. Write a 2-sentence executive summary of this interview session.
Tone: Professional, honest, constructive. Sound like a real person, not a bot.
Return ONLY the 2-sentence summary. No JSON, no bullets.`,
      },
      {
        role: "user",
        content: `Role: ${role}
Final Score: ${finalScore}/10
Trend: ${trend} (${trendDelta > 0 ? "+" : ""}${trendDelta} pts from start to end)
Weakest Areas: ${sortedAxes.join(", ")}
Strongest Area: ${Object.entries(axisAvgs).sort(([, a], [, b]) => b - a)[0]?.[0]}
Questions Answered: ${completedQuestions.length}`,
      },
    ];

    let executiveSummary;
    try {
      executiveSummary = await askAi(messages);
      executiveSummary = executiveSummary.trim();
    } catch {
      executiveSummary = `You completed ${completedQuestions.length} questions with a final score of ${finalScore}/10. Focus on ${sortedAxes[0]?.replace("Improve ", "")} in your next session.`;
    }

    return res.json({
      trend,
      trendDelta,
      practiceAreas: sortedAxes,
      percentileRank,
      executiveSummary,
      axisAverages: Object.fromEntries(
        Object.entries(axisAvgs).map(([k, v]) => [k, Number(v.toFixed(1))])
      ),
    });
  } catch (error) {
    console.error("Synthesis error:", error);
    return res.status(500).json({ message: "Failed to generate synthesis" });
  }
};
