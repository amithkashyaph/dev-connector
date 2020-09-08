const express = require("express");

const connectDB = require("./config/db");

const app = express();

connectDB();

// Initialize middleware
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome to Dev-Connector");
});

// Import routers
const userRouter = require("./routes/apis/users");
const authRouter = require("./routes/apis/auth");
const profileRouter = require("./routes/apis/profile");
const postsRouter = require("./routes/apis/posts");

// Use the routers
app.use("/api/users", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/profile", profileRouter);
app.use("/api/posts", postsRouter);

const PORT = process.env.PORT || 7000;

app.listen(PORT, () => console.log("Server running on port 7000"));
