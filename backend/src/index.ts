import "dotenv/config";
import express from "express";
import cors from "cors";
import chatRouter from "./routes/chat";

const app = express();
const PORT = process.env.PORT || 8080;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:3000";

app.use(cors({ origin: FRONTEND_ORIGIN }));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api", chatRouter);

app.listen(PORT, () => {
  console.log(`Persona AI backend running on http://localhost:${PORT}`);
});
