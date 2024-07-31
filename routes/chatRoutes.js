const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroupChat,
  addToGroup,
  removeFromGroup,
  fetchNotifications,
  removeNotifications,
  addNotification,
  deleteChat,
  getChatById,
} = require("../controllers/chatControllers");

router.post("/", authMiddleware, accessChat);
router.get("/", authMiddleware, fetchChats);
router.get("/:chatId", authMiddleware, getChatById);
router.post("/add-notification", authMiddleware, addNotification);
router.get("/notifications", authMiddleware, fetchNotifications);
router.post("/remove-notifications", authMiddleware, removeNotifications);

// group chat
router.post("/create-group", authMiddleware, createGroupChat);
router.put("/rename-group", authMiddleware, renameGroupChat);
router.put("/remove-from-group", authMiddleware, removeFromGroup);
router.put("/add-to-group", authMiddleware, addToGroup);

router.post("/delete", authMiddleware, deleteChat);

module.exports = router;
