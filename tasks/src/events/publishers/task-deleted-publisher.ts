import { Publisher, Subjects, TaskDeletedEvent } from "@cptodos/common";

export class TaskDeletedPublisher extends Publisher<TaskDeletedEvent> {
  subject: Subjects.TaskDeleted = Subjects.TaskDeleted;
}
