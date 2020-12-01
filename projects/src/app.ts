import express from "express";
import "express-async-errors";
import { json } from "body-parser";
import cookieSession from "cookie-session";
import { currentUser, NotFoundError } from "@cptodos/common";
import { errorHandler } from "@cptodos/common";
import { createProjectRoute } from "./routes/new";
import { indexProjectRoute } from "./routes";
import { showProjectRoute } from "./routes/show";
import { deleteProjectRoute } from "./routes/delete";
import { updateProjectRoute } from "./routes/update";

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
app.use(createProjectRoute);
app.use(indexProjectRoute);
app.use(showProjectRoute);
app.use(updateProjectRoute);
app.use(deleteProjectRoute);

app.all("*", async (req, res) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
