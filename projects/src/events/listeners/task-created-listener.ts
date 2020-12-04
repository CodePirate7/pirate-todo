import { Message } from "node-nats-streaming";
import { Subjects, Listener, TaskCreatedEvent } from "@cptodos/common";
import { queueGroupName } from "./queue-group-name";
import { Task } from "../../models/task";

export class TaskCreatedListener extends Listener<TaskCreatedEvent> {
  subject: Subjects.TaskCreated = Subjects.TaskCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: TaskCreatedEvent["data"], msg: Message) {
    const task = Task.build(data);
    await task.save();

    msg.ack();
  }
}
