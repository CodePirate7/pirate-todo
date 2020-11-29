import { requireAuth } from "@cptodos/common";
import express, { Request, Response } from "express";
import { Task } from "../models/task";

const router = express.Router();

router.get("/api/tasks", requireAuth, async (req: Request, res: Response) => {
  const tasks = await Task.find({ userId: req.currentUser!.id });

  res.status(200).json(tasks);
});

export { router as indexTaskRoute };
