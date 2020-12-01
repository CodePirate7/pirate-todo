import { requireAuth } from "@cptodos/common";
import express, { Request, Response } from "express";
import { Project } from "../models/project";

const router = express.Router();

router.get(
  "/api/projects",
  requireAuth,
  async (req: Request, res: Response) => {
    const projects = await Project.find({
      userId: req.currentUser!.id,
    }).populate({ path: "tasks", model: "Task" });

    res.status(200).json(projects);
  }
);

export { router as indexProjectRoute };
