import express from "express";
import http from "http";
import { Server, Socket } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:4000",
  },
});

app.use(express.static("public"));

interface ChatMessage {
  fromUserId: string;
  toUserId: string;
  message: string;
  GroupChat: boolean;
}

const userNames = ["MARISELVAN", "JAIN", "ADITHYA", "ANISH", "KIRAN"];
let userIndex = 0;

const users: Record<string, Socket> = {};

io.on("connection", (socket: Socket) => {
  const userId = userNames[userIndex];
  userIndex = (userIndex + 1) % userNames.length;

  users[userId] = socket;

  console.log(`User connected with ID: ${userId}`);
  socket.emit("user connected", userId);

  socket.on("chat message", (msg: ChatMessage) => {
    const targetSocket = users[msg.toUserId];
    const senderSocket = users[msg.fromUserId];

        if (targetSocket &&  !msg.GroupChat) {
            targetSocket.emit('chat message', msg);
            senderSocket?.emit('chat message', msg);
        }else {
      io.emit("chat message", msg);
    }
  });

  socket.on("disconnect", () => {
    console.log(`User with ID ${userId} disconnected`);
    delete users[userId];
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Listening on *:${PORT}`);
});
