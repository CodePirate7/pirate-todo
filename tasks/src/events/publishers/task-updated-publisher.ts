import { Publisher, Subjects, TaskUpdatedEvent } from "@cptodos/common";

export class TaskUpdatedPublisher extends Publisher<TaskUpdatedEvent> {
  subject: Subjects.TaskUpdated = Subjects.TaskUpdated;
}
