import request from "supertest";
import mongoose from "mongoose";
import { app } from "../../app";
import { Project } from "../../models/project";

it("has a route handler listening to /api/projects/:id for put requests", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  const response = await request(app).put(`/api/projects/${id}`).send({});
  expect(response.status).not.toBe(404);
});

it("can only be accessed if the user is signed in", async () => {
  await request(app)
    .put(`/api/projects/${new mongoose.Types.ObjectId().toHexString()}`)
    .send({})
    .expect(401);
});

it("returns an error if an invalid id is provided", async () => {
  await request(app)
    .put(`/api/projects/1111`)
    .set("Cookie", global.signin())
    .send()
    .expect(400);
});

it("updates the project provided valid inputs", async () => {
  const cookie = global.signin();

  const response = await global.createProject(cookie);

  await request(app)
    .put(`/api/projects/${response.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "modify title",
    })
    .expect(200);
  const project = await Project.findOne({ _id: response.body.id });
  expect(project).not.toBeNull();
  expect(project!.title).toBe("modify title");
});

it("returns a 404 if the provided id does not exist", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/projects/${id}`)
    .set("Cookie", global.signin())
    .send({
      title: "aslkdfj",
    })
    .expect(404);
});

it("returns a 401 if the user does not own the task", async () => {
  const response = await global.createProject();

  await request(app)
    .put(`/api/projects/${response.body.id}`)
    .set("Cookie", global.signin())
    .send({
      title: "modify",
    })
    .expect(401);
});
