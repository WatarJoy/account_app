import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import sequelize from "./config/database";
import authRoutes from "./routes/auth";
import txRoutes from "./routes/transactions";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/transactions", txRoutes);

// Test DB connection and sync models
(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    console.log("Database connected");
  } catch (err) {
    console.error("Unable to connect to DB:", err);
  }
})();

export default app;
