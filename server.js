import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import userRoutes from "./routes/userRoutes.js";
import postRoutes from "./routes/postRoutes.js";

const app = express();
app.use(cors());
app.use(express.json());

// חיבור למסד נתונים
mongoose.connect("mongodb://127.0.0.1:27017/twitter_clone", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// ראוטים
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);

const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
