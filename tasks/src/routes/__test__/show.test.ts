import request from "supertest";
import mongoose from "mongoose";
import { app } from "../../app";

it("has a route handler listening to /api/tasks/:id for get requests", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  const response = await request(app).get(`/api/tasks/${id}`).send();
  expect(response.status).not.toBe(404);
});

it("can only be accessed if the user is signed in", async () => {
  await request(app)
    .get(`/api/tasks/${new mongoose.Types.ObjectId().toHexString()}`)
    .send()
    .expect(401);
});

it("returns a status other than 401 if the user is signed in", async () => {
  await request(app)
    .get(`/api/tasks/${new mongoose.Types.ObjectId().toHexString()}`)
    .set("Cookie", global.signin())
    .send()
    .expect(200);
});

it("returns an error if an invalid id is provided", async () => {
  await request(app)
    .get(`/api/tasks/1111`)
    .set("Cookie", global.signin())
    .send()
    .expect(400);
});

it("can fetch task", async () => {
  const cookie = global.signin();
  const emptyRes = await request(app)
    .get(`/api/tasks/${new mongoose.Types.ObjectId().toHexString()}`)
    .set("Cookie", cookie)
    .send()
    .expect(200);
  expect(emptyRes.body).toEqual({});

  const response = await global.createTask(cookie);
  const taskResponse = await request(app)
    .get(`/api/tasks/${response.body.id}`)
    .set("Cookie", cookie)
    .send()
    .expect(200);

  expect(taskResponse.body.title).toBe("title");
});
