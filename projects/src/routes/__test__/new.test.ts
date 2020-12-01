import request from "supertest";
import { app } from "../../app";
import { Project } from "../../models/project";
import { Task } from "../../models/task";
import mongoose from "mongoose";

it("has a route handler listening to /api/projects for post requests", async () => {
  const response = await request(app).post("/api/projects").send({});

  expect(response.status).not.toBe(404);
});

it("can only be accessed if the user is signed in", async () => {
  await request(app).post("/api/projects").send({}).expect(401);
});

it("returns a status other than 401 if the user is signed in ", async () => {
  const response = await request(app)
    .post("/api/projects")
    .set("Cookie", global.signin())
    .send({});
  expect(response.status).not.toBe(401);
});

it("returns an error if an invalid title is provided", async () => {
  await request(app)
    .post("/api/projects")
    .set("Cookie", global.signin())
    .send({
      title: "",
    })
    .expect(400);

  await request(app)
    .post("/api/projects")
    .set("Cookie", global.signin())
    .send({})
    .expect(400);
});

it("create a project with valid inputs without tasks", async () => {
  const project = {
    title: "title",
  };

  await request(app)
    .post("/api/projects")
    .set("Cookie", global.signin())
    .send(project)
    .expect(201);

  let projects = await Project.find({});
  expect(projects).toHaveLength(1);
  expect(projects[0].title).toBe("title");
  expect(projects[0].description).toBe("");

  const response = await request(app)
    .post("/api/projects")
    .set("Cookie", global.signin())
    .send(Object.assign({}, project, { description: "description" }))
    .expect(201);
  projects = await Project.find({});
  expect(projects).toHaveLength(2);
  expect(projects[1].title).toBe("title");
  expect(projects[1].description).toBe("description");
});

it("create a project with valid inputs with tasks", async () => {
  // get user id
  const cookie = global.signin();
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
  });
  await task.save();

  // check tasks length
  let tasks = await Task.find({ userId });
  expect(tasks).toHaveLength(1);
  const project = {
    title: "title",
  };

  await request(app)
    .post("/api/projects")
    .set("Cookie", cookie)
    .send(project)
    .expect(201);

  let projects = await Project.find({});
  expect(projects).toHaveLength(1);
  expect(projects[0].title).toBe("title");

  await request(app)
    .post("/api/projects")
    .set("Cookie", cookie)
    .send(
      Object.assign({}, project, {
        tasks: [task.id],
        description: "description",
      })
    )
    .expect(201);
  projects = await Project.find({});

  expect(projects).toHaveLength(2);
  expect(projects[1].description).toBe("description");
  expect(projects[1].tasks).toContainEqual(mongoose.Types.ObjectId(task.id));
});
