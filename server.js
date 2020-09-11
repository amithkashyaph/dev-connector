const express = require("express");
const path = require("path");

const connectDB = require("./config/db");

const app = express();

connectDB();

// Initialize middleware
app.use(express.json());

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

// Serve the static assets
if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}

const PORT = process.env.PORT || 7000;

app.listen(PORT, () => console.log("Server running on port 7000"));
