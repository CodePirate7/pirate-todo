import request from "supertest";
import { app } from "../../app";
import { Task } from "../../models/task";
import { natsWrapper } from "../../nats-wrapper";

it("has a route handler listening to /api/tasks for post requests", async () => {
  const response = await await request(app).post("/api/tasks").send({});

  expect(response.status).not.toBe(404);
});

it("can only be accessed if the user is signed in", async () => {
  await request(app).post("/api/tasks").send({}).expect(401);
});

it("returns a status other than 401 if the user is signed in ", async () => {
  const response = await request(app)
    .post("/api/tasks")
    .set("Cookie", global.signin())
    .send({});
  expect(response.status).not.toBe(401);
});

it("returns an error if an invalid title is provided", async () => {
  await request(app)
    .post("/api/tasks")
    .set("Cookie", global.signin())
    .send({
      title: "",
      urgent: false,
      important: false,
    })
    .expect(400);

  await request(app)
    .post("/api/tasks")
    .set("Cookie", global.signin())
    .send({
      urgent: false,
      important: false,
    })
    .expect(400);
});

it("returns an error if an invalid urgent is provided", async () => {
  await request(app)
    .post("/api/tasks")
    .set("Cookie", global.signin())
    .send({
      title: "title",
      important: false,
    })
    .expect(400);
});

it("returns an error if an invalid important is provided", async () => {
  await request(app)
    .post("/api/tasks")
    .set("Cookie", global.signin())
    .send({
      title: "title",
      urgent: false,
    })
    .expect(400);
});

it("create a task with valid inputs", async () => {
  const task = {
    title: "title",
    urgent: false,
    important: false,
  };

  await request(app)
    .post("/api/tasks")
    .set("Cookie", global.signin())
    .send(task)
    .expect(201);

  let tasks = await Task.find({});
  expect(tasks).toHaveLength(1);
  expect(tasks[0].title).toBe("title");
  expect(tasks[0].description).toBe("");
  expect(tasks[0].urgent).toBeFalsy();
  expect(tasks[0].important).toBeFalsy();

  await request(app)
    .post("/api/tasks")
    .set("Cookie", global.signin())
    .send(Object.assign({}, task, { description: "description" }));

  tasks = await Task.find({});
  expect(tasks).toHaveLength(2);
  expect(tasks[1].title).toBe("title");
  expect(tasks[1].description).toBe("description");
});

it("publishes an created event", async () => {
  const task = {
    title: "title",
    urgent: false,
    important: false,
  };

  await request(app)
    .post("/api/tasks")
    .set("Cookie", global.signin())
    .send(task)
    .expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
