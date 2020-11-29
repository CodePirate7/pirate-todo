import {
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

router.put(
  "/api/tasks/:id",
  requireAuth,
  [
    param("id").custom((value) => {
      if (!mongoose.isValidObjectId(value)) {
        throw new Error("id is invalid");
      }
      return true;
    }),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const task = await Task.findById(req.params.id);

    if (!task) {
      throw new NotFoundError();
    }

    if (task.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    task.set({
      ...req.body,
    });

    await task.save();

    res.status(200).json(task);
  }
);

export { router as updateTaskRoute };
