import express, { Request, Response } from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes";
import leaveRoutes from "./routes/leaveRoutes";
import employeeRoutes from "./routes/employeeRoutes";
import departmentRoutes from "./routes/departmentRoutes";
import publicHolidayRoutes from "./routes/publicHolidayRoutes";
import compOffRoutes from "./routes/compOffRoutes";
import errorHandler from "./middleware/errorHandler";
import notificationRoutes from "./routes/notificationRoutes"

const app = express();

app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  // console.log("REQUEST:", req.method, req.originalUrl);
  next();
});

app.get("/api/health", (req: Request, res: Response) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api", employeeRoutes);
app.use("/api", departmentRoutes);
app.use("/api", leaveRoutes);
app.use("/api", publicHolidayRoutes);
app.use("/api", compOffRoutes);
app.use("/api",notificationRoutes)


// 404 for anything unmatched
app.use((req: Request, res: Response) =>
  res.status(404).json({ error: "Route not found." }),
);

// must be registered last — catches every next(err) from the routes above
app.use(errorHandler);

export default app;
