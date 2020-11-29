import {
  isObjectId,
  NotAuthorizedError,
  NotFoundError,
  requireAuth,
  validateRequest,
} from "@cptodos/common";
import express, { Request, Response } from "express";
import { param } from "express-validator";
import { Task } from "../models/task";
import mongoose from "mongoose";

const router = express.Router();

router.delete(
  "/api/tasks/:id",
  requireAuth,
  [param("id").custom(isObjectId)],
  validateRequest,
  async (req: Request, res: Response) => {
    const task = await Task.findById(req.params.id);

    if (!task) {
      throw new NotFoundError();
    }

    if (task.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    task.remove();

    res.status(200).json(task);
  }
);

export { router as deleteTaskRoute };
