import { requireAuth, validateRequest } from "@cptodos/common";
import express, { Request, Response } from "express";
import { param } from "express-validator";
import { Task } from "../models/task";
import mongoose from "mongoose";

const router = express.Router();

router.get(
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
    const { id } = req.params;
    const task = await Task.findOne({ userId: req.currentUser!.id, _id: id });

    res.status(200).json(task || {});
  }
);

export { router as showTaskRoute };
