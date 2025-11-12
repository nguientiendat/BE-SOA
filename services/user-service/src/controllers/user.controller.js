const User = require("../models/user.model");

const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.find({ _id: userId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getUserProfile,
};
