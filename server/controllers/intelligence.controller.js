import mongoose from "mongoose";
import { askAi } from "../services/openRouter.service.js";
import Interview from "../models/interview.model.js";
import User from "../models/user.model.js";

// ─── Intelligence Profile Schema (inline, stored in User's interview data) ───
// Computed from all interviews: mastery map, trend, readiness

const ROLE_TOPICS = {
  Technical: ["Data Structures", "Algorithms", "System Design", "APIs & Backend", "Frontend", "Databases", "DevOps", "Security"],
  HR: ["Communication", "Leadership", "Problem Solving", "Teamwork", "Adaptability", "Work Ethic", "Conflict Resolution", "Career Goals"],
};

const MASTERY_LEVELS = [
  { label: "Novice", min: 0, max: 3.9, color: "red" },
  { label: "Developing", min: 4, max: 5.9, color: "amber" },
  { label: "Proficient", min: 6, max: 7.9, color: "lime" },
  { label: "Expert", min: 8, max: 10, color: "emerald" },
];

const getMasteryLevel = (score) =>
  MASTERY_LEVELS.find((l) => score >= l.min && score <= l.max) || MASTERY_LEVELS[0];

// ─── Get Intelligence Profile ─────────────────────────────────────────────────
export const getIntelligenceProfile = async (req, res) => {
  try {
    const userId = req.userId;

    const interviews = await Interview.find({ userId, status: "completed" })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    if (interviews.length === 0) {
      return res.json({
        sessionCount: 0,
        insufficientData: true,
        message: "Complete at least 3 sessions to unlock your Intelligence Profile.",
        topicMastery: [],
        readiness: { percent: 0, daysToReady: null },
        trend: null,
        regression: null,
        todayPrescription: null,
        weeklyBriefing: null,
      });
    }

    // Determine mode (Technical or HR based on most recent)
    const primaryMode = interviews[0]?.mode || "Technical";
    const topics = ROLE_TOPICS[primaryMode] || ROLE_TOPICS.Technical;

    // Build score history per topic (simplified: score all questions as "generic topic")
    // In production, topics would be tagged by the AI during question generation
    // Here we approximate using axis scores as topic proxies:
    const axisMappings = {
      "Data Structures": "correctness",
      "Algorithms": "depth",
      "System Design": "structure",
      "APIs & Backend": "correctness",
      "Frontend": "confidence",
      "Databases": "correctness",
      "DevOps": "depth",
      "Security": "depth",
      "Communication": "communication",
      "Leadership": "confidence",
      "Problem Solving": "correctness",
      "Teamwork": "communication",
      "Adaptability": "communication",
      "Work Ethic": "confidence",
      "Conflict Resolution": "structure",
      "Career Goals": "depth",
    };

    const allQuestions = interviews.flatMap((i) =>
      (i.questions || []).filter((q) => q.score > 0).map((q) => ({ ...q, mode: i.mode, createdAt: i.createdAt }))
    );

    // Compute per-topic mastery using the axis proxy
    const topicMastery = topics.map((topic) => {
      const axisKey = axisMappings[topic] || "score";
      const relevantScores = allQuestions
        .map((q) => q[axisKey] || q.score || 0)
        .filter((s) => s > 0);

      const avgScore =
        relevantScores.length > 0
          ? Number((relevantScores.reduce((a, b) => a + b, 0) / relevantScores.length).toFixed(1))
          : 0;

      // Compute velocity (trend over last 5 vs previous 5)
      const recent = relevantScores.slice(0, 5);
      const older = relevantScores.slice(5, 10);
      const recentAvg = recent.length ? recent.reduce((a, b) => a + b, 0) / recent.length : avgScore;
      const olderAvg = older.length ? older.reduce((a, b) => a + b, 0) / older.length : avgScore;
      const velocityDelta = recentAvg - olderAvg;
      const velocity =
        velocityDelta > 0.5 ? "improving" : velocityDelta < -0.5 ? "declining" : "plateauing";

      const mastery = getMasteryLevel(avgScore);
      const lastInterview = interviews[0];
      const daysSince = lastInterview
        ? Math.floor((Date.now() - new Date(lastInterview.createdAt)) / 86400000)
        : 0;

      return {
        topic,
        avgScore,
        velocity,
        masteryLevel: mastery.label,
        masteryColor: mastery.color,
        sessionCount: relevantScores.length,
        daysSincePractice: daysSince,
      };
    });

    // Sort: weakest first (for prescription)
    const sortedByWeakness = [...topicMastery].sort((a, b) => a.avgScore - b.avgScore);

    // Compute overall readiness (weighted avg, where weak topics count more)
    const overallAvg =
      topicMastery.reduce((s, t) => s + t.avgScore, 0) / (topicMastery.length || 1);
    const readinessPercent = Math.min(100, Math.round((overallAvg / 8.5) * 100));

    // Sessions remaining estimate: each session improves by ~0.3 pts on average
    const targetScore = 7.5;
    const daysToReady =
      overallAvg >= targetScore
        ? 0
        : Math.ceil((targetScore - overallAvg) / 0.3);

    // Regression detection: last 3 sessions vs previous 3
    const last3Avg =
      interviews.slice(0, 3).reduce((s, i) => s + (i.finalScore || 0), 0) /
      Math.min(3, interviews.length);
    const prev3Avg =
      interviews.slice(3, 6).length > 0
        ? interviews.slice(3, 6).reduce((s, i) => s + (i.finalScore || 0), 0) /
          interviews.slice(3, 6).length
        : last3Avg;

    const regressionDelta = Number((last3Avg - prev3Avg).toFixed(1));
    const isRegressing = regressionDelta < -1.5 && interviews.length >= 4;

    // Today's prescription: weakest topic that hasn't been "practiced" via improving
    const topicForPrescription = sortedByWeakness.find((t) => t.masteryLevel !== "Expert") ||
      sortedByWeakness[0];

    // Score trend across all sessions
    const sessionScores = interviews.map((i) => i.finalScore || 0).reverse();
    const firstScore = sessionScores[0] || 0;
    const lastScore = sessionScores[sessionScores.length - 1] || 0;
    const overallTrend = lastScore - firstScore;

    return res.json({
      sessionCount: interviews.length,
      insufficientData: interviews.length < 3,
      topicMastery,
      readiness: {
        percent: readinessPercent,
        daysToReady: daysToReady > 0 ? daysToReady : 0,
        overallAvgScore: Number(overallAvg.toFixed(1)),
        targetScore,
      },
      trend: {
        direction:
          overallTrend > 0.5 ? "improving" : overallTrend < -0.5 ? "declining" : "stable",
        delta: Number(overallTrend.toFixed(1)),
        sessionScores,
      },
      regression: isRegressing
        ? {
            isActive: true,
            delta: regressionDelta,
            likelyCause: `Your last 3 sessions averaged ${last3Avg.toFixed(1)}/10 vs ${prev3Avg.toFixed(1)}/10 previously.`,
          }
        : null,
      todayPrescription: topicForPrescription
        ? {
            topic: topicForPrescription.topic,
            reason:
              topicForPrescription.avgScore < 5
                ? `Lowest mastery area — avg ${topicForPrescription.avgScore}/10`
                : `Needs consistent practice to reach Proficient level`,
            config: {
              role: interviews[0]?.role || "Software Engineer",
              experience: interviews[0]?.experience || "2 years",
              mode: primaryMode,
              focusTopic: topicForPrescription.topic,
            },
          }
        : null,
      weeklyBriefing: {
        progressSummary: `You've completed ${interviews.length} sessions. Your overall score is ${overallAvg.toFixed(1)}/10 — ${
          overallTrend > 0 ? `up ${overallTrend.toFixed(1)} pts from your first session` : "consistency is key, keep going"
        }.`,
        topGap: sortedByWeakness[0]?.topic || null,
        strongestArea:
          [...topicMastery].sort((a, b) => b.avgScore - a.avgScore)[0]?.topic || null,
        sessionsThisWeek: interviews.filter(
          (i) => Date.now() - new Date(i.createdAt) < 7 * 86400000
        ).length,
      },
    });
  } catch (error) {
    console.error("Intelligence profile error:", error);
    return res.status(500).json({ message: "Failed to load intelligence profile" });
  }
};
