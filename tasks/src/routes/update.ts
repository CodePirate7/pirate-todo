import {
  NotAuthorizedError,
  NotFoundError,
  requireAuth,
  validateRequest,
  isObjectId,
} from "@cptodos/common";
import express, { Request, Response } from "express";
import { param } from "express-validator";
import { TaskUpdatedPublisher } from "../events/publishers/task-updated-publisher";
import { Task } from "../models/task";
import { natsWrapper } from "../nats-wrapper";

const router = express.Router();

router.put(
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

    task.set({
      ...req.body,
    });

    await task.save();

    new TaskUpdatedPublisher(natsWrapper.client).publish(task);

    res.status(200).json(task);
  }
);

export { router as updateTaskRoute };
