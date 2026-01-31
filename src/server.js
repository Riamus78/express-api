import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import { isTesting } from "../env.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import habitRoutes from "./routes/habitRoutes.js";
import tagRoutes from "./routes/tagRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFound } from "./middleware/notFound.js";
import { authenticate } from "./middleware/authentication.js";
import { rateLimiting } from "./middleware/rateLimiting.js";

const app = express();
app.set("trust proxy", 1);
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  morgan("dev", {
    skip: () => isTesting(),
  }),
);

app.use("/api/auth", authRoutes);

app.use(authenticate, rateLimiting);

app.use("/api/user", userRoutes);
app.use("/api/habits", habitRoutes);
app.use("/api/tags", tagRoutes);

app.use(notFound);
app.use(errorHandler);

export { app };

export default app;
