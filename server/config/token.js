import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const genToken = (userId) => {
  try {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "6h" });
  } catch (error) {
    console.log("JWT error:", error);
    return null;
  }
};

export default genToken;

