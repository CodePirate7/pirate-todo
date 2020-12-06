import {
  TaskCreatedEvent,
  TaskDeletedEvent,
  TaskUpdatedEvent,
} from "@cptodos/common";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { Task } from "../../../models/task";
import { natsWrapper } from "../../../nats-wrapper";
import { TaskDeletedListener } from "../task-deleted-listener";
const setup = async () => {
  const listener = new TaskDeletedListener(natsWrapper.client);

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
  const data: TaskDeletedEvent["data"] = {
    id: task.id,
  };

  // Create a fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg };
};
// Create the fake data event

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

it("finds and delete a task", async () => {
  const { listener, data, msg } = await setup();

  let tasks = await Task.find({});

  expect(tasks).toHaveLength(1);

  await listener.onMessage(data, msg);

  tasks = await Task.find({});
  expect(tasks).toHaveLength(0);
});
