import { TaskCreatedEvent } from "@cptodos/common";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { Task } from "../../../models/task";
import { natsWrapper } from "../../../nats-wrapper";
import { TaskCreatedListener } from "../task-created-listener";

const setup = async () => {
  const listener = new TaskCreatedListener(natsWrapper.client);

  const data: TaskCreatedEvent["data"] = {
    id: mongoose.Types.ObjectId().toHexString(),
    title: "title",
    description: "description",
    urgent: true,
    important: true,
    userId: mongoose.Types.ObjectId().toHexString(),
    completed: false,
    createdAt: new Date().valueOf(),
    updatedAt: new Date().valueOf(),
    progress: 0,
  };

  // Create a fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg };
};
// Create the fake data event

it("creates and saves a task", async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const task = await Task.findById(data.id);

  expect(task).toBeDefined();
  expect(task!.id).toEqual(data.id);
});
