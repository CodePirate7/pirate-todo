import { Message } from "node-nats-streaming";
import { Subjects, Listener, TaskUpdatedEvent } from "@cptodos/common";
import { queueGroupName } from "./queue-group-name";
import { Task } from "../../models/task";

export class TaskUpdatedListener extends Listener<TaskUpdatedEvent> {
  subject: Subjects.TaskUpdated = Subjects.TaskUpdated;
  queueGroupName = queueGroupName;

  async onMessage(data: TaskUpdatedEvent["data"], msg: Message) {
    const task = await Task.findById(data.id);
    if (!task) {
      throw new Error("task not found");
    }
    task.set({ ...task });

    await task.save();

    msg.ack();
  }
}
