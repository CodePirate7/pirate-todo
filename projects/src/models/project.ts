import mongoose from "mongoose";

interface ProjectAttrs {
  title: string;
  description: string;
  userId: string;
  tasks: string[];
}

interface ProjectDoc extends mongoose.Document {
  title: string;
  description: string;
  userId: string;
  tasks: string[];
  createdAt: number;
  updatedAt: number;
}

interface ProjectModel extends mongoose.Model<ProjectDoc> {
  build(attrs: ProjectAttrs): ProjectDoc;
}

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    tasks: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Task",
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        ret.createdAt = ret.createdAt.valueOf();
        ret.updatedAt = ret.updatedAt.valueOf();
        delete ret._id;
        delete ret.__v;
        delete ret.userId;
      },
    },
  }
);
projectSchema.statics.build = (attrs: ProjectAttrs) => new Project(attrs);

const Project = mongoose.model<ProjectDoc, ProjectModel>(
  "Project",
  projectSchema
);

export { Project };
