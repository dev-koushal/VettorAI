import User from "../models/user.model.js";
import genToken from "../config/token.js";

export const googleAuth = async (req, res) => {
  try {
    const { email, name } = req.body;
    
    console.log("This is hitting")
    // Check if user already exists
    let user = await User.findOne({ email });
    if (!user) {
      // If user doesn't exist, create a new user in the database
      user = await User.create({ name, email });
      await user.save();
    }

    // Generate JWT token for the user
    const token = genToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure:"secure",
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    
    res.status(200).json(user);
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Google authentication failed. Please try again." });
  }
};

export const logout = (req, res) => {
  try {
    res.clearCookie("token");
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Logout failed. Please try again." });
  }
};
