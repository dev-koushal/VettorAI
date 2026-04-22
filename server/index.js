import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import cookiesParser from "cookie-parser";
import authRouter from "./routes/auth.route.js";
import userRouter from "./routes/user.route.js";
import interviewRouter from "./routes/interview.route.js";
import paymentRouter from "./routes/razorpay.route.js";

dotenv.config();

const PORT = process.env.PORT ;

const app = express();

app.use(cors({ origin: "https://vettorai-1.onrender.com" , credentials: true }));

app.use(express.json());
app.use(cookiesParser());

connectDB();

// Routes
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/interview", interviewRouter);
app.use("/api/payment", paymentRouter);




app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
