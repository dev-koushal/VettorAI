import express from "express";
import { getFitScore } from "../controllers/interview.controller.js";

const featurerouter = express.Router();

featurerouter.post("/fit-score",getFitScore);

export default featurerouter;