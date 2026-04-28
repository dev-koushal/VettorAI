import express from "express";
import { getFitScore } from "../controllers/interview.controller.js";
import isAuth from "../middlewares/isAuth.middleware.js"
const fitScorerouter = express.Router();

fitScorerouter.post("/fit-score", isAuth, getFitScore);

export default fitScorerouter;