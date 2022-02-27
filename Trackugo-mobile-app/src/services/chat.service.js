import { useEffect, useRef, useState } from "react";
import socketIOClient from "socket.io-client";
import uriConfig from "../config/uri.config";


const SOCKET_SERVER_URL = uriConfig.apiUrl;

const useChat = (user,roomId) => {
  const [messages, setMessages] = useState([]); // Sent and received messages
  const socketRef = useRef();

  useEffect(() => {
    // Creates a WebSocket connection
    socketRef.current = socketIOClient(SOCKET_SERVER_URL, {
      query: {user,roomId },
    });

    // Listens for incoming messages
    socketRef.current.on(`messageFor${roomId}`, (message) => {
      const incomingMessage = {
        ...message,
        ownedByCurrentUser: message.senderId === socketRef.current.id,
      };
      setMessages((messages) => [...messages, incomingMessage]);
    });

    // Destroys the socket reference
    // when the connection is closed
    return () => {
      socketRef.current.disconnect();
    };
  }, [roomId]);

  // Sends a message to the server that
  // forwards it to all users in the same room
  const sendMessage = (msg, roomId, userFrom, userTo) => {
    socketRef.current.emit(`messageTo${roomId}`, {
      msg: msg,
      userFrom: userFrom,
      roomId:roomId,
      userTo:userTo
    });
  };

  return { messages, sendMessage, setMessages };
};

export default useChat;
