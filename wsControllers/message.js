const Message = require("../models/messageModel");
const Chat = require("../models/chatModel");
const User = require("../models/userModel");

const storeMesageToDB = async (content, chatId, sender, isVideo) => {
  if (!content || !chatId || !sender) {
    console.log("Missing one payload to store message");
  }

  const newMessage = {
    sender: sender,
    content,
    chat: chatId,
    chatId,
    isVideo,
  };

  try {
    let message = await Message.create(newMessage);
    message = await message.populate("sender", "name userId");
    message = await message.populate("chat");

    message = await User.populate(message, {
      path: "chat.users",
      select: "name pic email",
    });

    await Chat.findByIdAndUpdate(chatId, {
      latestMessage: message,
    });
    console.log("message saved");
  } catch (err) {
    console.log(err.message);
  }
};

module.exports = {
  storeMesageToDB,
};
