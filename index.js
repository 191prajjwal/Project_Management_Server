const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const bodyParser = require("body-parser");

const userRoutes = require("./routes/userRoutes");
const taskRoutes = require("./routes/taskRoutes");
const analyticsRoute = require("./routes/taskAnalyticsRoute");
const sharedLinkRoute = require("./routes/sharedLinkRoute");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 4005;

const incommingReqLogger = require("./middlewares/logger");

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// CORS configuration to allow requests from Vercel frontend
app.use(cors({
  origin: 'https://project-management-client-five.vercel.app', // Add your frontend URL
  methods: 'GET,POST,PUT,DELETE',
  credentials: true
}));

app.use(incommingReqLogger);

// Routes
app.get("/", (req, res) => {
  res.send("Working fine");
});

app.use("/api/v1/users", userRoutes);
app.use("/api/v1/tasks", taskRoutes);
app.use("/api/v1/info", analyticsRoute);
app.use("/api/v1/link", sharedLinkRoute);

// Server and DB connection
app.listen(PORT, () => {
  console.log(`server is live at port ${PORT}`);
  mongoose.connect(process.env.MONGODB_URL).then(() => {
    console.log("Database connected");
  }).catch((err) => {
    console.log(err);
  });
});
