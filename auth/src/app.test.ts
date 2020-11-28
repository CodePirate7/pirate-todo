import request from "supertest";
import { app } from "./app";

it("returns a 404 with an invalid router", async () => {
  await request(app).get("/api/users/xxxx").expect(404);
});
