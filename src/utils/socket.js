const socket = require("socket.io");
const crypto = require("crypto");
const { Chat } = require("../models/chat");
const onlineUsers = new Map();

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
      onlineUsers.set(userId.toString(), socket.id);
      console.log("Online Users:", [...onlineUsers.keys()]);

      //online status
      io.emit("userStatusChanged", {
        userId,
        isOnline: true,
      });
      // emit a message to the room that the user has joined
    });
    socket.on("typing", ({ firstName, userId, targetUserId }) => {
      const roomId = getRoomHash(userId, targetUserId);
      socket.to(roomId).emit("typing", {
        firstName,
      });
    });
    socket.on("stopTyping", ({ userId, targetUserId }) => {
      const roomId = getRoomHash(userId, targetUserId);

      socket.to(roomId).emit("stopTyping");
    });
    socket.on("checkOnlineStatus", ({ targetUserId }) => {
      socket.emit("onlineStatus", {
        isOnline: onlineUsers.has(targetUserId),
      });
    });
    socket.on("markMessagesDelivered", async ({ userId, targetUserId }) => {
      try {
        const chat = await Chat.findOne({
          participants: { $all: [userId, targetUserId] },
        });

        if (!chat) return;

        let updatedMessages = [];

        chat.message.forEach((msg) => {
          // Messages sent by targetUser to current user
          if (
            msg.senderId.toString() === targetUserId &&
            msg.status === "sent"
          ) {
            msg.status = "delivered";
            updatedMessages.push(msg._id);
          }
        });

        if (updatedMessages.length > 0) {
          await chat.save();

          const roomId = getRoomHash(userId, targetUserId);

          io.to(roomId).emit("messagesDelivered", {
            messageIds: updatedMessages,
          });
        }
      } catch (err) {
        console.error(err);
      }
    });

    // NEW: bulk-mark all of the other user's messages as "seen"
    // Fired the moment a user opens/enters the chat window.
    socket.on("markMessagesSeen", async ({ userId, targetUserId }) => {
      try {
        const chat = await Chat.findOne({
          participants: { $all: [userId, targetUserId] },
        });

        if (!chat) return;

        let updatedMessages = [];

        chat.message.forEach((msg) => {
          // Any message the OTHER person sent me that isn't already "seen"
          if (
            msg.senderId.toString() === targetUserId &&
            msg.status !== "seen"
          ) {
            msg.status = "seen";
            updatedMessages.push(msg._id);
          }
        });

        if (updatedMessages.length > 0) {
          await chat.save();

          const roomId = getRoomHash(userId, targetUserId);

          io.to(roomId).emit("messagesSeen", {
            messageIds: updatedMessages,
          });
        }
      } catch (err) {
        console.error(err);
      }
    });

    socket.on("messageSeen", async ({ messageId, userId, targetUserId }) => {
      try {
        const chat = await Chat.findOne({
          participants: { $all: [userId, targetUserId] },
        });

        if (!chat) return;

        const message = chat.message.id(messageId);

        if (!message) return;

        if (message.status !== "seen") {
          message.status = "seen";

          await chat.save();

          const roomId = getRoomHash(userId, targetUserId);

          io.to(roomId).emit("messageSeen", {
            messageId,
          });
        }
      } catch (err) {
        console.error(err);
      }
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

          const latestMessage = chat.message[chat.message.length - 1];
          const receiverOnline = onlineUsers.has(targetUserId.toString());
          if (receiverOnline) {
            latestMessage.status = "delivered";
            await chat.save();
          }

          io.to(roomId).emit("receiveMessage", {
            messageId: latestMessage._id,
            firstName,
            lastName,
            userId,
            text,
            createdAt: latestMessage.createdAt,
            status: latestMessage.status,
          });
        } catch (err) {
          console.error(err.message);
        }
      },
    );

    socket.on("disconnect", () => {
      let disconnectedUser = null;
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          disconnectedUser = userId;
          onlineUsers.delete(userId);
          break;
        }
      }
      if (disconnectedUser) {
        io.emit("userStatusChanged", {
          userId: disconnectedUser,
          isOnline: false,
        });
      }
      console.log(`${disconnectedUser} went offline`);
    });
  });
};

module.exports = initializeSocket;
