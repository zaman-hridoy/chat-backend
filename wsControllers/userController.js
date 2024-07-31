const User = require("../models/userModel");

const updatedActiveStatus = async (userId, isActive = false) => {
  try {
    if (!userId) {
      return res.status(404).json({ message: "User not found" });
    }
    await User.findByIdAndUpdate(userId, {
      $set: {
        isActive,
        lastActive: Date.now(),
      },
    });

    console.log(`${userId} is ${isActive ? "online" : "offline"}`);
  } catch (err) {
    console.log(err.message);
  }
};

module.exports = {
  updatedActiveStatus,
};
