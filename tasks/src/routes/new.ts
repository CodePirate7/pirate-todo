import { body } from "express-validator";
import { requireAuth, validateRequest } from "@cptodos/common";
import express, { Request, Response } from "express";
import { Task } from "../models/task";
import { TaskCreatedPublisher } from "../events/publishers/task-created-publisher";
import { natsWrapper } from "../nats-wrapper";

const router = express.Router();

router.post(
  "/api/tasks",
  requireAuth,
  [
    body("title").not().isEmpty().withMessage("Title is required"),
    body("urgent").not().isEmpty().withMessage("Urgent is required"),
    body("important").not().isEmpty().withMessage("Important is required"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { title, urgent, important, description = "" } = req.body;

    const task = Task.build({
      title,
      urgent,
      description,
      important,
      userId: req.currentUser!.id,
      completed: false,
      progress: 0,
    });
    await task.save();
    console.log(task);
    //@ts-ignore
    new TaskCreatedPublisher(natsWrapper.client).publish(task.toJSON());

    res.status(201).send(task);
  }
);

export { router as createTaskRoute };
