const socket = require("socket.io");
const crypto = require("crypto");
const { Chat } = require("../models/chat");

const getRoomHash = (userId, targetUserId) => {
  const secretRoomId = crypto
    .createHash("sha256")
    .update([userId, targetUserId].sort().join("-"))
    .digest("hex");

  return secretRoomId;
};
const initializeSocket = (server) => {
  const io = socket(server, {
    cors: {
      origin: ["http://localhost:5173", process.env.FRONTEND_URL],
    },
  });

  io.on("connection", (socket) => {
    // handle socket events
    socket.on("joinChat", ({ firstName, userId, targetUserId }) => {
      // create unique room id
      const roomId = getRoomHash(userId, targetUserId);

      console.log(`${firstName} joined room: ${roomId}`);
      socket.join(roomId);
      // emit a message to the room that the user has joined
    });

    socket.on(
      "sendMessage",
      async ({ firstName, lastName, userId, targetUserId, text }) => {
        // emit a message to the room

        try {
          const roomId = getRoomHash(userId, targetUserId);
          console.log(`${firstName + lastName} sent ${text}`);
          let chat = await Chat.findOne({
            participants: { $all: [userId, targetUserId] },
          });
          console.log("Chat:", chat);
          if (!chat) {
            console.log("NewChat");
            chat = new Chat({
              participants: [userId, targetUserId],
              message: [],
            });
          }
          chat.message.push({
            senderId: userId,
            text,
          });
          await chat.save();

          io.to(roomId).emit("receiveMessage", {
            firstName,
            lastName,
            userId,
            text,
          });
        } catch (err) {
          console.error(err.message);
        }
      },
    );

    socket.on("disconnect", () => {});
  });
};

module.exports = initializeSocket;
