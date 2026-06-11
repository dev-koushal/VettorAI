import express from "express";
import isAuth from "../middlewares/isAuth.middleware.js";

// Autopilot (P0)
import {
  generateFollowUp,
  generateCoaching,
  generateSynthesis,
} from "../controllers/autopilot.controller.js";

// Offer Intelligence (P1)
import { analyzeOfferProbability } from "../controllers/offerIntelligence.controller.js";

// Answer Optimizer (P2)
import { optimizeAnswer } from "../controllers/optimizer.controller.js";

// Adaptive Intelligence (P4)
import { getIntelligenceProfile } from "../controllers/intelligence.controller.js";

const aiRouter = express.Router();

// ── P0: Interview Autopilot ───────────────────────────────────────────────────
aiRouter.post("/autopilot/follow-up", isAuth, generateFollowUp);
aiRouter.post("/autopilot/coaching", isAuth, generateCoaching);
aiRouter.post("/autopilot/synthesis", isAuth, generateSynthesis);

// ── P1: Offer Intelligence ────────────────────────────────────────────────────
aiRouter.post("/offer-intelligence/analyze", isAuth, analyzeOfferProbability);

// ── P2: Answer Optimizer ──────────────────────────────────────────────────────
aiRouter.post("/optimizer/optimize", isAuth, optimizeAnswer);

// ── P4: Adaptive Intelligence Core ───────────────────────────────────────────
aiRouter.get("/intelligence/profile", isAuth, getIntelligenceProfile);

export default aiRouter;
