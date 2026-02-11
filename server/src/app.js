import express from "express";
import "dotenv/config";
import cors from "cors";

import logsRoutes from "./routes/logsRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import symptomRoutes from "./routes/symptomRoutes.js";
import groupRoutes from "./routes/groupRoutes.js";
import choreRoutes from "./routes/choreRoutes.js";
import receiptRoutes from "./routes/receiptRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";

import { verifyToken } from "./middlewares/validationMiddleware.js";

const app = express();

app.use(cors());
app.use(express.json());

// Helpful routes so "/" and health work
app.get("/", (req, res) => res.send("Nomi API is running"));
app.get("/health", (req, res) => res.json({ ok: true }));

// keep your existing paths (no /api prefix needed)
app.use("/logs", verifyToken, logsRoutes);
app.use("/user", userRoutes);
app.use("/symptom", verifyToken, symptomRoutes);
app.use("/groups", verifyToken, groupRoutes);
app.use("/chores", verifyToken, choreRoutes);
app.use("/receipts", receiptRoutes);
app.use("/expenses", expenseRoutes);

export default app;