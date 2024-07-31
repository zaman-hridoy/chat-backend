const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");
const Message = require("../models/messageModel");
const { getLinkPreview } = require("link-preview-js");

const sendMesage = asyncHandler(async (req, res) => {
  const { content, chatId, isVideo = false } = req.body;

  if (!content || !chatId) {
    return res.status(400).send("Invalid data passed");
  }

  const newMessage = {
    sender: req.user._id,
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

    const messages = await Message.aggregate([
      {
        $match: { _id: message._id },
      },
      {
        $lookup: {
          from: "users",
          localField: "sender",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
            },
          },
          messageByDate: {
            $push: "$$ROOT",
          },
        },
      },
    ]);

    res.status(200).json(messages);
  } catch (err) {
    res.status(400);
    throw new Error(err.message);
  }
});

const getAllMessages = asyncHandler(async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name pic email")
      .populate("chat");

    // const messages = await Message.aggregate([
    //   {
    //     $match: { chatId: req.params.chatId },
    //   },
    //   {
    //     $lookup: {
    //       from: "users",
    //       localField: "sender",
    //       foreignField: "_id",
    //       as: "user",
    //     },
    //   },
    //   {
    //     $group: {
    //       _id: {
    //         $dateToString: {
    //           format: "%Y-%m-%d",
    //           date: "$createdAt",
    //         },
    //       },
    //       messageByDate: {
    //         $push: "$$ROOT",
    //       },
    //     },
    //   },
    //   {
    //     $sort: {
    //       _id: 1,
    //     },
    //   },
    // ]);

    res.status(200).json(messages);
  } catch (err) {
    res.status(400);
    throw new Error(err.message);
  }
});

// generate links
const generateLink = asyncHandler(async (req, res) => {
  try {
    const { link } = req.body;
    if (!link) {
      return res.status(404).json({ message: "Link is not found!" });
    }
    const data = await getLinkPreview(link);
    res.status(200).json(data);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = { sendMesage, getAllMessages, generateLink };
