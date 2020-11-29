import express from "express";
import "express-async-errors";
import { json } from "body-parser";
import cookieSession from "cookie-session";
import { currentUser, NotFoundError } from "@cptodos/common";
import { errorHandler } from "@cptodos/common";
import { createTaskRoute } from "./routes/new";
import { indexTaskRoute } from "./routes";
import { showTaskRoute } from "./routes/show";
import { updateTaskRoute } from "./routes/update";
import { deleteTaskRoute } from "./routes/delete";

const app = express();
app.set("trust proxy", true);
app.use(json());
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== "test",
  })
);
app.use(currentUser);
app.use(createTaskRoute);
app.use(indexTaskRoute);
app.use(showTaskRoute);
app.use(updateTaskRoute);
app.use(deleteTaskRoute);

app.all("*", async (req, res) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
