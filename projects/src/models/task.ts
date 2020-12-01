import mongoose from "mongoose";

interface TaskAttrs {
  id: string;
  title: string;
  description: string;
  urgent: boolean;
  important: boolean;
  userId: string;
  completed: boolean;
  progress: number;
}

export interface TaskDoc extends mongoose.Document {
  title: string;
  description: string;
  urgent: boolean;
  important: boolean;
  userId: string;
  projectId?: string;
  completed: boolean;
  createdAt: number;
  updatedAt: number;
  progress: number;
}

interface TaskModel extends mongoose.Model<TaskDoc> {
  build(attrs: TaskAttrs): TaskDoc;
}

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  urgent: {
    type: Boolean,
    required: true,
  },
  important: {
    type: Boolean,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  projectId: {
    type: String,
  },
});
taskSchema.statics.build = (attrs: TaskAttrs) =>
  new Task({ ...attrs, _id: attrs.id });

const Task = mongoose.model<TaskDoc, TaskModel>("Task", taskSchema);

export { Task };
