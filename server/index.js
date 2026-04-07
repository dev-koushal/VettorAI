import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
dotenv.config({});
/**
 * - Middleware: CORS, body-parser
 */
const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());

connectDB();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

