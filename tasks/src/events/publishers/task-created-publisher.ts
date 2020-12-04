import { Publisher, Subjects, TaskCreatedEvent } from "@cptodos/common";

export class TaskCreatedPublisher extends Publisher<TaskCreatedEvent> {
  subject: Subjects.TaskCreated = Subjects.TaskCreated;
}
