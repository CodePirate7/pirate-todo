import request from "supertest";
import mongoose from "mongoose";
import { app } from "../../app";
import { Task } from "../../models/task";
import { natsWrapper } from "../../nats-wrapper";

it("has a route handler listening to /api/tasks/:id for delete requests", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  const response = await request(app).delete(`/api/tasks/${id}`).send();
  expect(response.status).not.toBe(404);
});

it("can only be accessed if the user is signed in", async () => {
  await request(app)
    .delete(`/api/tasks/${new mongoose.Types.ObjectId().toHexString()}`)
    .send()
    .expect(401);
});

it("returns an error if an invalid id is provided", async () => {
  await request(app)
    .delete(`/api/tasks/1111`)
    .set("Cookie", global.signin())
    .send()
    .expect(400);
});

it("returns a 404 if the provided id does not exist", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .delete(`/api/tasks/${id}`)
    .set("Cookie", global.signin())
    .send()
    .expect(404);
});

it("returns a 401 if the user does not own the task", async () => {
  const response = await global.createTask();

  await request(app)
    .delete(`/api/tasks/${response.body.id}`)
    .set("Cookie", global.signin())
    .send()
    .expect(401);
});

it("delete own task", async () => {
  const cookie = global.signin();
  const response = await global.createTask(cookie);
  let tasks = await Task.findById(response.body.id);
  expect(tasks).not.toBeNull();

  await request(app)
    .delete(`/api/tasks/${response.body.id}`)
    .set("Cookie", cookie)
    .send()
    .expect(200);

  tasks = await Task.findById(response.body.id);
  expect(tasks).toBeNull();
});

it("publishes an deleted event", async () => {
  const cookie = global.signin();
  const response = await global.createTask(cookie);
  let tasks = await Task.findById(response.body.id);
  expect(tasks).not.toBeNull();

  await request(app)
    .delete(`/api/tasks/${response.body.id}`)
    .set("Cookie", cookie)
    .send()
    .expect(200);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
