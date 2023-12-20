import cookie from 'cookie';
import jwt from 'jsonwebtoken';
import { Server, Socket } from 'socket.io';
import { AvailableChatEvents, ChatEventEnum } from '../constants.js';
import { User } from '../models/auth/user.model.js';
import { ApiError } from '../utils/ApiError.js';
/**
 * @description This function is responsible to allow user to join the chat represented by chatId (chatId). event happens when user switches between the chats
 */

const mountJoinChatEvent = (socket) => {
  socket.on(ChatEventEnum.JOIN_CHAT_EVENT, (chatId) => {
    console.log(`User joined the chat 🤝. chatId: `, chatId);
    // joining the room with the chatId will allow specific events to be fired where we don't bother about the users like typing events
    // E.g. When user types we don't want to emit that event to specific participant.
    // We want to just emit that to the chat where the typing is happening
    socket.join(chatId);
  });
};


/**
 * @description This function emit the typing event to the other person in the chat
 */
const mountParticipantTypingEvent = (socket) => {
  socket.on(ChatEventEnum.TYPING_EVENT, (chatId) => {
    socket.in(chatId).emit(ChatEventEnum.TYPING_EVENT, chatId);
  });
};

/**
 * @description This function is responsible to emit the stopped typing event to other participants
 */
const mountParticipantStoppedTypingEvent = (socket) => {
  socket.on(ChatEventEnum.STOP_TYPING_EVENT, (chatId) => {
    socket.in(chatId).emit(ChatEventEnum.STOP_TYPING_EVENT, chatId);
  });
};

/**
 * @description initializeSocketIo
 */

const initializeSocketIO = (io) => {
  return io.on("connection", async (socket) => {
    try {
       // parse the cookies from the handshake headers (This is only possible if client has `withCredentials: true`)
      const cookies = cookie.parse(socket.handshake.headers?.cookie || "");

      let token = cookies?.accessToken; // get the accessToken

      if (!token) {
         token = socket.handshake.auth?.token;
      }

      if (!token) {
        throw new ApiError(401, "Un-authorized handshake. Token is invalid");
      }

      const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET); // decode the token
      const user = await User.findOne({
  attributes: {
    exclude: [
      "password",
      "refreshToken",
      "emailVerificationToken",
      "emailVerificationExpiry",
    ],
  },
  where: {
    id: decodedToken ? decodedToken._id : null,
  },
});

      if (!user) {
        throw new ApiError(401, "Un-authorized handshake. Token is invalid");
      }

      socket.user = user;

      socket.join(user._id.toString());
      socket.emit(ChatEventEnum.CONNECTED_EVENT) //emit the client is connected
      console.log("User connected 🗼. userId: ", user._id.toString())
      

      //commonevents that need to mount
      mountJoinChatEvent(socket)
      mountParticipantTypingEvent(socket)
      mountParticipantStoppedTypingEvent(socket)


      socket.on(ChatEventEnum.DISCONNECT_EVENT, () => {
        console.log("user has disconnected 🛑. userId: " + socket.user?._id)
        if (socket.user?._id) {
          socket.leave(socket.user._id);
        }
      })
      
    } catch (error) {
      socket.emit(
        ChatEventEnum.SOCKET_ERROR_EVENT,
        error?.message || "Something went wrong while connecting to the socket."
      );
    }
  })
}

const emitSocketEvent = (req, roomId, event, payload) => {
  req.app.get('io').in(roomId).emit(event,payload)
}

export {initializeSocketIO,emitSocketEvent}