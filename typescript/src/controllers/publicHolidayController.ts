import { Request, Response, NextFunction } from "express";
import publicHolidayModel from "../models/publicHolidayModel";

export async function listPublicHolidays(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    res.json(await publicHolidayModel.findAll());
  } catch (err) {
    next(err);
  }
}

export async function createPublicHoliday(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const body = req.body as {
      holidayDate?: string;
      date?: string;
      name?: string;
      holidayName?: string;
    };
    const holidayDate = body.holidayDate ?? body.date;
    const name = (body.name ?? body.holidayName)?.trim();

    if (!holidayDate || !name) {
      res.status(400).json({
        error: "holidayDate (or date) and name (or holidayName) are required.",
      });
      return;
    }

    const holiday = await publicHolidayModel.create(holidayDate, name);
    res.status(201).json(holiday);
  } catch (err) {
    next(err);
  }
}

export async function deletePublicHoliday(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({ error: "A valid holiday id is required." });
      return;
    }
    if (!(await publicHolidayModel.findById(id))) {
      res.status(404).json({ error: "Public holiday not found." });
      return;
    }
    await publicHolidayModel.remove(id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
