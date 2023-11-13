const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const jwtMiddleware = require("./middlewares/jwtMiddleware");
const User = require("./models/User");
const jwt = require("jsonwebtoken");
require("dotenv/config");
require("./db")();

const app = express();
const PORT = process.env.PORT || 5000; 

const indexRouter = require('./routes/index');

app.use("/images", express.static(path.join(__dirname, './files')));
app.use(cors());
app.use(logger('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());


// Auth routes
app.post("/login", async (req, res) => {
  const {username, password} = req.body;

  const user = await User.findOne({username});
  if(user) {
    if(user.password === password){

      const JWT_SECRET = process.env.JWT_SECRET;

      const token = jwt.sign({id: user._id.toString()}, JWT_SECRET);
      res.status(200).json({
        status: true, 
        token,
        data: user,
        message: "The account with these credentials exists"
      })
    } else {
      res.status(401).json({
        status: false, 
        message: "Invalid credentials!"
      });
    }
  } else {
    res.status(401).json({
      status: false, 
      message: "The user doesn't exist!"
    });
  }
})

app.use(jwtMiddleware);
app.use('/', indexRouter);


app.listen(PORT, () => console.log("The server is listening at: ", PORT));