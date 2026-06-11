import { askAi } from "../services/openRouter.service.js";
import Interview from "../models/interview.model.js";
import mongoose from "mongoose";
import User from "../models/user.model.js";

// ─── Offer Probability Analysis ───────────────────────────────────────────────
export const analyzeOfferProbability = async (req, res) => {
  try {
    const { jdText, company, round } = req.body;
    const userId = req.userId;

    if (!jdText) {
      return res.status(400).json({ message: "jdText is required" });
    }

    // Get user's resume from interview history for context
    let resumeText = req.body.resumeText || "";

    // Get user's interview performance history
    const recentInterviews = await Interview.find(
      { userId, status: "completed" },
      { finalScore: 1, questions: 1, role: 1 }
    )
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const avgHistoricalScore =
      recentInterviews.length > 0
        ? recentInterviews.reduce((s, i) => s + (i.finalScore || 0), 0) /
          recentInterviews.length
        : null;

    // Build axis averages from history
    const axisHistory = { confidence: [], communication: [], correctness: [], structure: [], depth: [] };
    recentInterviews.forEach((interview) => {
      interview.questions?.forEach((q) => {
        if (q.score > 0) {
          Object.keys(axisHistory).forEach((ax) => {
            if (q[ax]) axisHistory[ax].push(q[ax]);
          });
        }
      });
    });
    const avgAxes = Object.fromEntries(
      Object.entries(axisHistory).map(([k, arr]) => [
        k,
        arr.length ? Number((arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1)) : null,
      ])
    );

    const historyContext = avgHistoricalScore
      ? `User has completed ${recentInterviews.length} mock interviews with average score ${avgHistoricalScore.toFixed(1)}/10. 
Axis averages: Confidence ${avgAxes.confidence}/10, Communication ${avgAxes.communication}/10, Correctness ${avgAxes.correctness}/10, Structure ${avgAxes.structure}/10, Depth ${avgAxes.depth}/10`
      : "No interview history available.";

    const messages = [
      {
        role: "system",
        content: `You are an expert AI recruiter computing a candidate's offer probability for a specific role.

Analyze the resume, job description, and interview performance to compute:
1. Offer probability (0-100)
2. Top 3 factors (positive and negative)
3. Skill match percentage
4. Experience alignment
5. Actionable improvements ranked by probability ROI

Return STRICT JSON only:
{
  "probability": number (0-100),
  "confidenceInterval": number (5-15, smaller means more data),
  "skillMatchPercent": number (0-100),
  "experienceAlignment": number (0-100),
  "factors": [
    {
      "name": "string (e.g. Skill Match, Interview Performance, Experience Alignment)",
      "value": number (0-100),
      "status": "positive | neutral | negative",
      "detail": "one specific sentence explaining this factor"
    }
  ],
  "actionPlan": [
    {
      "action": "specific action to take",
      "probabilityBoost": number (1-15)
    }
  ],
  "recruiterPerspective": "2 sentences from a hiring manager's POV on this candidacy",
  "autoInterviewConfig": {
    "role": "extracted role title",
    "experience": "inferred experience level",
    "mode": "Technical | HR",
    "focusTopics": ["topic1", "topic2"]
  }
}`,
      },
      {
        role: "user",
        content: `RESUME TEXT:
${resumeText || "No resume provided"}

JOB DESCRIPTION:
${jdText}

COMPANY: ${company || "Not specified"}
INTERVIEW ROUND: ${round || "General"}

CANDIDATE INTERVIEW PERFORMANCE:
${historyContext}

Compute offer probability with detailed factor breakdown.`,
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

    // Adjust confidence interval based on data availability
    if (!resumeText) parsed.confidenceInterval = (parsed.confidenceInterval || 10) + 5;
    if (!avgHistoricalScore) parsed.confidenceInterval = (parsed.confidenceInterval || 10) + 3;

    return res.json({
      probability: Math.min(100, Math.max(0, parsed.probability || 50)),
      confidenceInterval: Math.min(20, Math.max(5, parsed.confidenceInterval || 12)),
      skillMatchPercent: parsed.skillMatchPercent || 0,
      experienceAlignment: parsed.experienceAlignment || 0,
      factors: parsed.factors || [],
      actionPlan: parsed.actionPlan || [],
      recruiterPerspective: parsed.recruiterPerspective || "",
      autoInterviewConfig: parsed.autoInterviewConfig || null,
    });
  } catch (error) {
    console.error("Offer probability error:", error);
    return res.status(500).json({ message: "Failed to compute offer probability" });
  }
};
