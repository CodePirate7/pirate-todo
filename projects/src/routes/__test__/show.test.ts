import request from "supertest";
import mongoose from "mongoose";
import { app } from "../../app";

it("has a route handler listening to /api/projects/:id for get requests", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  const response = await request(app).get(`/api/projects/${id}`).send();
  expect(response.status).not.toBe(404);
});

it("can only be accessed if the user is signed in", async () => {
  await request(app)
    .get(`/api/projects/${new mongoose.Types.ObjectId().toHexString()}`)
    .send()
    .expect(401);
});

it("returns a status other than 401 if the user is signed in", async () => {
  await request(app)
    .get(`/api/projects/${new mongoose.Types.ObjectId().toHexString()}`)
    .set("Cookie", global.signin())
    .send()
    .expect(200);
});

it("returns an error if an invalid id is provided", async () => {
  await request(app)
    .get(`/api/projects/1111`)
    .set("Cookie", global.signin())
    .send()
    .expect(400);
});

it("can fetch project", async () => {
  const cookie = global.signin();
  const emptyRes = await request(app)
    .get(`/api/projects/${new mongoose.Types.ObjectId().toHexString()}`)
    .set("Cookie", cookie)
    .send()
    .expect(200);
  expect(emptyRes.body).toEqual({});

  const response = await global.createProject(cookie);
  const projectResponse = await request(app)
    .get(`/api/projects/${response.body.id}`)
    .set("Cookie", cookie)
    .send()
    .expect(200);

  expect(projectResponse.body.title).toBe("title");
});
