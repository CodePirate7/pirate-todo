import { TaskCreatedEvent, TaskUpdatedEvent } from "@cptodos/common";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { Task } from "../../../models/task";
import { natsWrapper } from "../../../nats-wrapper";
import { TaskUpdatedListener } from "../task-updated-listener";

const setup = async () => {
  const listener = new TaskUpdatedListener(natsWrapper.client);

  // Create and save a task
  const task = Task.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: "title",
    description: "description",
    urgent: true,
    important: true,
    userId: mongoose.Types.ObjectId().toHexString(),
    completed: false,
    progress: 0,
    createdAt: new Date().valueOf(),
    updatedAt: new Date().valueOf(),
  });

  await task.save();
  const data: TaskUpdatedEvent["data"] = {
    id: task.id,
    title: "title updated",
    description: "description updated",
    urgent: true,
    important: true,
    userId: task.userId,
    completed: true,
    progress: 0,
    createdAt: task.createdAt,
    updatedAt: new Date().valueOf(),
  };

  // Create a fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg, task };
};

it("ack the message", async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});

it("does not call ask if task is not found", async () => {
  const { listener, data, msg } = await setup();

  data.id = mongoose.Types.ObjectId().toHexString();

  try {
    await listener.onMessage(data, msg);
  } catch (err) {}

  expect(msg.ack).not.toHaveBeenCalled();
});

it("finds, updates, and saves a task", async () => {
  const { listener, data, msg, task } = await setup();

  await listener.onMessage(data, msg);

  const updatedTask = await Task.findById(task.id);

  // @ts-ignore
  delete data.userId;
  expect(updatedTask!.title).toEqual(data.title);
  expect(updatedTask!.completed).toEqual(data.completed);

  msg;
});
