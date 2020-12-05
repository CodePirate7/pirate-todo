import request from "supertest";
import { app } from "../../app";
import { Task } from "../../models/task";
import mongoose from "mongoose";

const buildTask = async (cookie: string[]) => {
  const userId = global.parseCookie(cookie).id;
  let task = await Task.build({
    title: "title",
    urgent: false,
    important: false,
    description: "",
    userId,
    completed: false,
    progress: 0,
    id: mongoose.Types.ObjectId().toHexString(),
    createdAt: new Date().valueOf(),
    updatedAt: new Date().valueOf(),
  });
  await task.save();
  return task;
};

it("has a route handler listening to /api/projects for get requests", async () => {
  const response = await request(app).get("/api/projects").send();
  expect(response.status).not.toBe(404);
});

it("can only be accessed if the user is signed in", async () => {
  await request(app).get("/api/projects").send().expect(401);
});

it("returns a status other than 401 if the user is signed in", async () => {
  await request(app)
    .get("/api/projects")
    .set("Cookie", global.signin())
    .send()
    .expect(200);
});

it("can fetch a list of projects", async () => {
  const cookie = global.signin();

  // Create three tasks
  const taskOne = await buildTask(cookie);
  const taskTwo = await buildTask(cookie);
  const taskThree = await buildTask(cookie);

  // make a request to build an task with this task
  await request(app)
    .post("/api/projects")
    .set("Cookie", cookie)
    .send({
      title: "title",
      tasks: [taskOne.id, taskTwo.id, taskThree.id],
    })
    .expect(201);
  // make request to fetch the project
  const { body: fetchedProject } = await request(app)
    .get("/api/projects")
    .set("Cookie", cookie)
    .send()
    .expect(200);

  expect(fetchedProject).toHaveLength(1);
  expect(fetchedProject[0].tasks).toHaveLength(3);
});
