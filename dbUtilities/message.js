const Message = require("../models/messageModel");
const Chat = require("../models/chatModel");
const User = require("../models/userModel");
const { MESSAGES_FROM_SERVER_TO_CLIENT } = require("../pubSubTypes");

/*
PACKET
{
  cmd: 'publish',
  brokerId: undefined,
  brokerCounter: 0,
  topic: 'channel/directMessage/client',
  payload: <Buffer 7b 22 73 65 6e 64 65 72 22 3a 22 36 33 38 33 34 63 62 61 64 37 39 65 33 36 65 33 37 31 37 32 35 62 63 66 22 2c 22 63 68 61 6e 6e 65 6c 49 64 22 3a 22 ... 56 more bytes>,
  qos: 2,
  retain: false,
  dup: false,
  messageId: 1
}
*/

const saveMessageToDB = async (packet, aedes) => {
  if (!packet || !aedes) return;
  try {
    let payload = packet.payload.toString();
    payload = JSON.parse(payload);
    const { sender, content, chatId, isVideo = false, receivers } = payload;

    if (!content || !chatId) {
      return;
    }

    const newMessage = {
      sender,
      content,
      chat: chatId,
      chatId,
      isVideo,
    };

    let message = await Message.create(newMessage);

    message = await message.populate("sender", "name pic email");
    message = await message.populate("chat");

    message = await User.populate(message, {
      path: "chat.users",
      select: "name pic email",
    });

    await Chat.findByIdAndUpdate(chatId, {
      latestMessage: message,
    });

    // const messageToPublish = await Message.aggregate([
    //   {
    //     $match: { _id: message._id },
    //   },
    //   {
    //     $lookup: {
    //       from: "users",
    //       localField: "sender",
    //       foreignField: "_id",
    //       as: "user",
    //     },
    //   },
    //   // {
    //   //   $project: {
    //   //     content: 1,
    //   //     isVideo: 1,
    //   //     createdAt: 1,
    //   //     user: {
    //   //       _id: 1,
    //   //       name: 1,
    //   //       isActive: 1,
    //   //       pic: 1,
    //   //     },
    //   //   },
    //   // },
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
    // ]);
    // aedes.publish({ topic: "aedes/hello", payload: "I'm broker " + aedes.id });

    aedes.publish({
      topic: MESSAGES_FROM_SERVER_TO_CLIENT,
      payload: JSON.stringify({
        messageToPublish: message,
        chatId,
        sender,
        receivers,
      }),
    });
  } catch (err) {
    console.log("Error saving message", err);
  }
};

module.exports = {
  saveMessageToDB,
};
