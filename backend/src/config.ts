import dotenv from "dotenv";
dotenv.config();

export const config = {
  PORT: process.env.PORT || 4000,
  MONGODB_URI: process.env.MONGODB_URI || "",
  STORAGE_DIR: "storage"
};