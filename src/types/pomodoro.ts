export type Tasks = Task[];
export type Task = {
  id: number;
  name: string;
  completed: boolean;
  _id?: string;
};
export type TaskDTO = {
  _id: string;
  taskName: string;
  taskStatus: string;
  taskCompleted: boolean;
};

export type StudySession ={
  id: number,
  pomodoroNumber: number,
  taskCompleted: number,
  date: string
  _id?: string,
}
export type StudySessionDTO = {
  _id: string;
  pomodoroNumber: number,
  taskCompleted: number,
  date: string
};

export type Pomodoro = {
  pomodoroNumber: number;
  pomodoroType: string;
  pomodoroDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  longBreakInterval: number;
  id: string;
};
