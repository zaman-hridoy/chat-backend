const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const {
  sendMesage,
  getAllMessages,
  generateLink,
} = require("../controllers/messageControllers");

router.post("/", authMiddleware, sendMesage);
router.get("/:chatId", authMiddleware, getAllMessages);
router.post("/generate-link", generateLink);

module.exports = router;
