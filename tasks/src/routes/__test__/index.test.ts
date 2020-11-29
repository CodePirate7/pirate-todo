import request from "supertest";
import { app } from "../../app";

it("has a route handler listening to /api/tasks for get requests", async () => {
  const response = await request(app).get("/api/tasks").send();
  expect(response.status).not.toBe(404);
});

it("can only be accessed if the user is signed in", async () => {
  await request(app).get("/api/tasks").send().expect(401);
});

it("returns a status other than 401 if the user is signed in", async () => {
  await request(app)
    .get("/api/tasks")
    .set("Cookie", global.signin())
    .send()
    .expect(200);
});

it("can fetch a list of tasks", async () => {
  const cookie = global.signin();

  let response = await request(app)
    .get("/api/tasks")
    .set("Cookie", cookie)
    .send();
  expect(response.body).toHaveLength(0);

  await global.createTask(cookie);
  await global.createTask(cookie);
  await global.createTask(cookie);

  response = await request(app).get("/api/tasks").set("Cookie", cookie).send();

  expect(response.body).toHaveLength(3);
  expect(response.body[0].title).toBe("title");
});
