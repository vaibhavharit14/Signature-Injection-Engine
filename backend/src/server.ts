import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { config } from "./config";
import pdfRoutes from "./routes/pdfRoutes";
import fs from "fs";

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

if (!fs.existsSync(config.STORAGE_DIR)) {
  fs.mkdirSync(config.STORAGE_DIR, { recursive: true });
}

app.use("/files", express.static(config.STORAGE_DIR));

mongoose.connect(config.MONGODB_URI)
  .then(() => console.log(" MongoDB connected"))
  .catch(err => console.error(" MongoDB error:", err));

app.use("/", pdfRoutes);

app.listen(config.PORT, () => {
  console.log(` Server running on http://localhost:${config.PORT}`);
});