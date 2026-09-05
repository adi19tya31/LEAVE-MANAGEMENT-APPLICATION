import { Request, Response, NextFunction } from "express";

interface AppError extends Error {
  statusCode?: number;
}

// Every controller forwards errors here via next(err) instead of
// formatting its own JSON error response — one consistent shape for the client.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: AppError, req: Request, res: Response, next: NextFunction): void {
  const statusCode = err.statusCode || 500;
  if (statusCode === 500) {
    console.error(err); // only log unexpected errors
  }
  res.status(statusCode).json({ error: err.message || "Something went wrong." });
}

export default errorHandler;
