import {
  NotAuthorizedError,
  NotFoundError,
  requireAuth,
  validateRequest,
  isObjectId,
} from "@cptodos/common";
import express, { Request, Response } from "express";
import { param } from "express-validator";
import { Project } from "../models/project";

const router = express.Router();

router.put(
  "/api/projects/:id",
  requireAuth,
  [param("id").custom(isObjectId)],
  validateRequest,
  async (req: Request, res: Response) => {
    const project = await Project.findById(req.params.id);

    if (!project) {
      throw new NotFoundError();
    }

    if (project.userId.toString() !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    project.set({
      ...req.body,
    });

    await project.save();

    res.status(200).json(project);
  }
);

export { router as updateProjectRoute };
