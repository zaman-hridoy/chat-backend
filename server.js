const express = require("express");
const mongoose = require("mongoose");
const { createServer } = require("http");
const cors = require("cors");
const dotenv = require("dotenv");

const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const { notFound, errorHandler } = require("./middlewares/errorMiddleware");

const app = express();
const httpServer = createServer(app);
const Chat = require("./models/chatModel");
const User = require("./models/userModel");
const Message = require("./models/messageModel");
const Notification = require("./models/notificationModel");
const ws = require("websocket-stream");
const { MESSAGES_FROM_CLIENT_TO_SERVER } = require("./pubSubTypes");
const { saveMessageToDB } = require("./dbUtilities/message");
const broker = require("aedes")();

// config
dotenv.config();
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// DB connection
connectDB();

const PORT = process.env.PORT || 4000;

app.get("/", (req, res) => {
  res.send("Api is running...");
});

// configure routes
app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

app.use(notFound);
app.use(errorHandler);

// ws server
ws.createServer({ server: httpServer }, broker.handle);
httpServer.listen(PORT, (client) => {
  console.log(`server started on port-${PORT}`);
});

broker.on("subscribe", function (subscriptions, client) {
  console.log({ subscriptions });
});

broker.on("unsubscribe", function (subscriptions, client) {
  // console.log({ subscriptions });
});

// fired when a client connects
broker.on("client", (client) => {
  console.log(`WS Client: ${client?.id} connected.`);
});
// fired when a client disconnects
broker.on("clientDisconnect", function (client) {
  console.log(`Client disconnected: client_id: ${client.id}`);
});

// fired when a message is published
broker.on("publish", async function (packet, client) {
  console.log(packet);
  if (packet.topic.includes(MESSAGES_FROM_CLIENT_TO_SERVER)) {
    saveMessageToDB(packet, broker);
  }
});
