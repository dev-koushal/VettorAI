import express from "express";
import { getFitScore } from "../controllers/interview.controller.js";

const fitScorerouter = express.Router();

fitScorerouter.post("/fit-score",getFitScore);

export default fitScorerouter;