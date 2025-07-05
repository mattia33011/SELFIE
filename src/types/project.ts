import { PrimaryGreen } from '../../public/palettes';

export type Project = {
  id: string;
  tasks: Task[];
  name: string;
  note: string;
  author: string;
  expire: Date;
  start: Date;
  members: string[];
};

export type Task = {
  id: string;
  name: string;
  input?: string;
  output?: string;
  isMilestone: boolean;
  start: Date;
  expire: Date;
  linkedTask: string[];
  status: TaskStatus;
  authors: string[];
};

export const calcProgess = (t: Task) => {
  switch (t.status) {
    default:
    case 0:
      return 0;
    case 1:
      return 0;
    case 2:
      return 50;
    case 3:
      return 100;
    case 4:
      return 50;
    case 5:
      return 0;
    case 6:
      return 0;
  }
};

export function convertTaskToGanttTask(t: Task): GanttTask {
  const toDateFormat = (d: Date) =>
    `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate() + 1}`;

  return {
    id: t.id,
    name: t.name,
    start: toDateFormat(t.start),
    end: toDateFormat(t.expire),
    progress: calcProgess(t),
    dependencies: t.linkedTask,
    custom_class: 'task',
    color: t.isMilestone ? '#8f00ff' : '#adc178',
    color_progress: PrimaryGreen[700],
  };
}

export type GanttTask = {
  id?: string;
  name: string;
  start: string;
  end?: string;
  duration?: string;
  progress: number;
  dependencies?: string | string[];
  custom_class?: string;
  color?: string | undefined;
  color_progress?: string | undefined;
  _start?: Date;
  _end?: Date;
  _index?: number;
};

export enum TaskStatus {
  NotStartable,
  Startable,
  Started,
  Done,
  ReStarted,
  Overdue,
  Abandoned,
}
export const TASK_STATUS = [
  'Startable',
  'Started',
  'Done',
  'ReStarted',
  'Abandoned',
];
export function taskStatusToString(status: TaskStatus) {
  switch (status) {
    default:
    case 0:
      return 'NotStartable';
    case 1:
      return 'Startable';
    case 2:
      return 'Started';
    case 3:
      return 'Done';
    case 4:
      return 'ReStarted';
    case 5:
      return 'Overdue';
    case 6:
      return 'Leaved';
  }
}

export function stringToTaskStatus(status: string) {
  switch (status) {
    default:
    case "NotStartable":
      return TaskStatus.NotStartable;
    case "Startable":
      return TaskStatus.Startable;
    case "Started":
      return TaskStatus.Started;
    case "Done":
      return TaskStatus.Done;
    case "ReStarted":
      return TaskStatus.ReStarted;
    case "Overdue":
      return TaskStatus.Overdue;
    case "Abandoned":
      return TaskStatus.Abandoned;
  }
}