import request from "supertest";
import mongoose from "mongoose";
import { app } from "../../app";
import { Task } from "../../models/task";

it("has a route handler listening to /api/tasks/:id for put requests", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  const response = await request(app).put(`/api/tasks/${id}`).send({});
  expect(response.status).not.toBe(404);
});

it("can only be accessed if the user is signed in", async () => {
  await request(app)
    .put(`/api/tasks/${new mongoose.Types.ObjectId().toHexString()}`)
    .send({})
    .expect(401);
});

it("returns an error if an invalid id is provided", async () => {
  await request(app)
    .put(`/api/tasks/1111`)
    .set("Cookie", global.signin())
    .send()
    .expect(400);
});

it("updates the task provided valid inputs", async () => {
  const cookie = global.signin();

  const response = await global.createTask(cookie);

  await request(app)
    .put(`/api/tasks/${response.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "modify title",
      urgent: true,
      important: true,
    })
    .expect(200);
  const task = await Task.findOne({ _id: response.body.id });
  expect(task).not.toBeNull();
  expect(task!.title).toBe("modify title");
  expect(task!.urgent).toBeTruthy();
  expect(task!.important).toBeTruthy();
});

it("returns a 404 if the provided id does not exist", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tasks/${id}`)
    .set("Cookie", global.signin())
    .send({
      title: "aslkdfj",
    })
    .expect(404);
});

it("returns a 401 if the user does not own the task", async () => {
  const response = await global.createTask();

  await request(app)
    .put(`/api/tasks/${response.body.id}`)
    .set("Cookie", global.signin())
    .send({
      title: "modify",
    })
    .expect(401);
});
