const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");
const jwtMiddleware = require("./middlewares/jwtMiddleware");
const User = require("./models/User");
const Message = require("./models/Message");
const jwt = require("jsonwebtoken");
const app = express();
const http = require("http");
const { getUsers, setUsers, addUser } = require("./users");
const server = http.createServer(app);
require("dotenv/config");
require("./db")();

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});

const PORT = process.env.PORT || 5000;

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const flowsRouter = require("./routes/flows");
const messagesRouter = require("./routes/messages");

app.use("/images", express.static(path.join(__dirname, "./files")));
app.use(cors());
app.use(logger("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// Auth routes
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });
  if (user) {
    if (user.password === password) {
      const JWT_SECRET = process.env.JWT_SECRET;

      const token = jwt.sign({ id: user._id.toString() }, JWT_SECRET);
      res.status(200).json({
        status: true,
        token,
        data: user,
        message: "The account with these credentials exists",
      });
    } else {
      res.status(401).json({
        status: false,
        message: "Invalid credentials!",
      });
    }
  } else {
    res.status(401).json({
      status: false,
      message: "The user doesn't exist!",
    });
  }
});

app.use(jwtMiddleware);
app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/flows", flowsRouter);
app.use("/messages", messagesRouter);

const addNewUser = async (User) => {
  if (!getUsers().some((user) => user?._id === User?._id)) {
    addUser(User);
  }
};

const removeUser = (socketId) => {
  console.log(
    "User removed: ",
    getUsers()?.find((user) => user?.socketId === socketId)?.userName
  );
  setUsers(getUsers().filter((user) => user.socketId !== socketId));
};

// Sockets
io.on("connection", (socket) => {
  socket.on("chat_add_user", (User) => {
    addNewUser({
      ...User,
      socketId: socket.id,
    });
    console.log("New user added: ", User?.displayName);
    io.emit("chat_getOnlineUsers", getUsers());
  });

  socket.on("chat_send_message", async (messageData) => {
      const newMessage = new Message(messageData);
      const storeMessage = await newMessage.save();
      const messageStored = await Message.findById(storeMessage?._id).populate("from").populate("recipients").exec();
      if(messageStored?.from?.role !== 1) {
        await User.findOneAndUpdate({role: 1}, {$inc: {unreadCount: 1}});
      }
      io.emit("chat_message", messageStored);
  })

  socket.on("chat_mark_read", async(userId) => {
    await User?.findByIdAndUpdate(userId, {
      unreadCount: 0
    })
  })

  socket.on("chat_recipients_update", async (data) => {
    const {recipients, updates} = data;
    const onlineRecipients = getUsers()?.filter((user) => recipients?.includes(user?._id));

    const incObj = {$inc: {unreadCount: 1 }};
    const decObj = {$dec: {unreadCount: 1 }};
    const updateRequests = await Promise.all(updates?.map((update) => User?.findByIdAndUpdate(update?.recipient, update?.update === "increment" ? incObj : decObj)));
    onlineRecipients?.forEach((recip) => {
      io.to(recip?.socketId).emit("chat_recipients_updated", updates?.find(update => update?.recipient === recip?._id));
    })

  })

  socket.on("disconnect", () => {
    console.log("Socket got disconnected");
    removeUser(socket.id);
    io.emit("chat_getOnlineUsers", getUsers());
  });
});

server.listen(PORT, () => console.log("The server is listening at: ", PORT));
