import express from "express";
import { getFitScore, getSkillRoadmap } from "../controllers/interview.controller.js";

const featurerouter = express.Router();

featurerouter.post("/fit-score", getFitScore);
featurerouter.post("/skill-roadmap", getSkillRoadmap);

export default featurerouter;