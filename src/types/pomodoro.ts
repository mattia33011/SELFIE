export type Tasks = Task[];
export type Task = {
  id: number;
  name: string;
  completed: boolean;
  _id?: string;
};
export type TaskDTO = {
  id: string;
  taskName: string;
  taskStatus: string;
  taskCompleted: boolean;
};

export type Pomodoro = {
  pomodoroNumber: number;
  pomodoroType: string;
  pomodoroDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  longBreakInterval: number;
};
