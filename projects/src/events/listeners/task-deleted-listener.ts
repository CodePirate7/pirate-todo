import { Message } from "node-nats-streaming";
import { Subjects, Listener, TaskDeletedEvent } from "@cptodos/common";
import { queueGroupName } from "./queue-group-name";
import { Task } from "../../models/task";

export class TaskDeletedListener extends Listener<TaskDeletedEvent> {
  subject: Subjects.TaskDeleted = Subjects.TaskDeleted;
  queueGroupName = queueGroupName;

  async onMessage(data: TaskDeletedEvent["data"], msg: Message) {
    const task = await Task.findById(data.id);

    if (!task) {
      throw new Error("Task not found");
    }

    await task.remove();

    msg.ack();
  }
}
