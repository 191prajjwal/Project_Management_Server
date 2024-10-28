const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const bodyParser = require("body-parser");

const userRoutes = require("./routes/userRoutes");
const taskRoutes = require("./routes/taskRoutes");
const analyticsRoute = require("./routes/taskAnalyticsRoute");
const sharedLinkRoute = require("./routes/sharedLinkRoute");
const assignTaskRoute=require("./routes/assignTaskRoute")

dotenv.config();
const app = express();
const PORT = process.env.PORT || 4005;

const incommingReqLogger = require("./middlewares/logger");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.use(cors({
  origin: '*', 
  methods: 'GET,POST,PUT,DELETE',
  credentials: true,
  allowedHeaders: 'Content-Type,Authorization'
}));

app.use(incommingReqLogger);

app.get("/", (req, res) => {
  res.status(200).json({success:true,message:"Server is Live now"});
});

app.use("/api/v1/users", userRoutes);
app.use("/api/v1/tasks", taskRoutes);
app.use("/api/v1/info", analyticsRoute);
app.use("/api/v1/link", sharedLinkRoute);
app.use("/api/v1/assign",assignTaskRoute)

app.listen(PORT, () => {
  console.log(`Server is live at port ${PORT}`);
  mongoose.connect(process.env.MONGODB_URL).then(() => {
    console.log("Database connected");
  }).catch((err) => {
    console.log(err);
  });
});
