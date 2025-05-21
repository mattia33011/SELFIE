export type Tasks = Task[];
export type Task = {
    id: number;
    name: string;
    completed: boolean;
}

export type Pomodoro={
    pomodoroNumber: number;
    pomodoroType: string;
    pomodoroDuration: number;
    shortBreak: number;
    longBreak: number;
    longBreakInterval: number;
}