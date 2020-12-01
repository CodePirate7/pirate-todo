import { body } from "express-validator";
import { requireAuth, validateRequest } from "@cptodos/common";
import express, { Request, Response } from "express";
import { Project } from "../models/project";

const router = express.Router();

router.post(
  "/api/projects",
  requireAuth,
  [body("title").not().isEmpty().withMessage("Title is required")],
  validateRequest,
  async (req: Request, res: Response) => {
    const { title, description = "", tasks = [] } = req.body;
    const project = Project.build({
      title,
      description,
      userId: req.currentUser!.id,
      tasks,
    });
    await project.save();
    res.status(201).send(project);
  }
);

export { router as createProjectRoute };
