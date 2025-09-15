import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  LoginForm,
  RegisterForm,
  ResetPasswordForm,
} from '../../types/register';
import { Session, User } from '../../types/session';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { Events, Note, Notes } from '../../types/events';
import { Pomodoro, StudyPlan, StudySession, Task, TaskDTO } from '../../types/pomodoro';
import { _ } from '@ngx-translate/core';
import { Project, TaskStatus } from '../../types/project';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(private readonly http: HttpClient) {}

  private readonly baseUrl = environment.baseUrl;
  private resolveBearerToken = (token: string) => `Bearer ${token}`;

  getProfilePicture(session: Session) {
    return this.http
      .get(`${this.baseUrl}/users/${session.user.username}/profile-picture`, {
        headers: { authorization: this.resolveBearerToken(session.token) },
        responseType: 'blob',
      })
      .pipe(map((res) => URL.createObjectURL(res)));
  }

  getOtherProfilePicture(userID: string, session: Session) {
    return this.http
      .get(`${this.baseUrl}/users/${userID}/profile-picture`, {
        headers: { authorization: this.resolveBearerToken(session.token) },
        responseType: 'blob',
      })
      .pipe(map((res) => URL.createObjectURL(res)));
  }

  putProfilePicture(formData: FormData, session: Session) {
    return this.http.put(
      `${this.baseUrl}/users/${session.user.username}/profile-picture`,
      formData,
      {
        headers: { authorization: this.resolveBearerToken(session.token) },
      }
    );
  }

  login(form: LoginForm) {
    return this.http.post<Session>(`${this.baseUrl}/login`, form);
  }

  activate(token: string) {
    return this.http.get(`${this.baseUrl}/activate`, {
      params: { token: token },
    });
  }

  register(form: RegisterForm) {
    return this.http.post(`${this.baseUrl}/register`, form);
  }

  resetPassword(form: ResetPasswordForm) {
    return this.http.patch(`${this.baseUrl}/reset-password`, form);
  }

  deleteAccount(session: Session) {
    return this.http.delete(`${this.baseUrl}/users/${session.user.username}`, {
      headers: { authorization: this.resolveBearerToken(session.token) },
    });
  }

  getNotes(userID: string, token: string) {
    return this.http
      .get<any>(`${this.baseUrl}/users/${userID}/notes`, {
        headers: { authorization: this.resolveBearerToken(token) },
      })
      .pipe(
        map((response) => {
          const notesArray = Array.isArray(response)
            ? response
            : Object.values(response);

          return notesArray.map((note: any) => ({
            label: note.label,
            parent: note.parent,
            data: note.content,
            icon: note.icon,
            children: note.children,
            type: note.type,
            expanded: note.expanded,
            _id: note._id,
            lastEdit: note.lastEdit,
          }));
        })
      );
  }

  pushNote(userID: string, notes: Notes, token: string) {
    const mappedNotes = notes.map((note: any) => ({
      label: note.label,
      parent: note.parent,
      data: note.content,
      icon: note.icon,
      children: note.children,
      type: note.type,
      expanded: note.expanded,
      _id: note._id,
      lastEdit: note.lastEdit,
    }));
    return this.http.put(`${this.baseUrl}/users/${userID}/notes`, mappedNotes, {
      headers: { authorization: this.resolveBearerToken(token) },
    });
  }

  getRecentNotes(userID: string, token: string) {
    return this.http
      .get<Notes>(`${this.baseUrl}/users/${userID}/notes/recent`, {
        headers: { authorization: this.resolveBearerToken(token) },
      })
      .pipe(
        map((notes) =>
          notes.map((note) => ({
            ...note,
            lastEdit: new Date(note.lastEdit),
          }))
        )
      );
  }

  deleteNote(userID: string, noteid: string, token: string) {
    return this.http.delete(`${this.baseUrl}/users/${userID}/notes/${noteid}`, {
      headers: { authorization: this.resolveBearerToken(token) },
    });
  }

  //api per le sessioni e pomodoro

  getStudySessions(userID: string, token: string) {
    return this.http.get(
      `${this.baseUrl}/users/${userID}/pomodoro/oldSessions`,
      {
        headers: { authorization: this.resolveBearerToken(token) },
      }
    );
  }
  pushStudySessions(
    userID: string,
    pomodoroHistory: StudySession[],
    token: string
  ) {
    const mappedSession = pomodoroHistory.map((session: StudySession) => ({
      pomodoroNumber: session.pomodoroNumber,
      taskCompleted: session.taskCompleted,
      date: session.date,
    }));
    return this.http.put(
      `${this.baseUrl}/users/${userID}/pomodoro/oldSessions`,
      mappedSession,
      {
        headers: { authorization: this.resolveBearerToken(token) },
      }
    );
  }
  putStudySession(userID: string, sessions: StudySession[], token: string) {
    const mappedSession = sessions.map((session: StudySession) => ({
      _id: session._id,
      pomodoroNumber: session.pomodoroNumber,
      taskCompleted: session.taskCompleted,
      date: session.date,
    }));
    return this.http.put(
      `${this.baseUrl}/users/${userID}/pomodoro/oldSessions`,
      mappedSession,
      {
        headers: { authorization: this.resolveBearerToken(token) },
      }
    );
  }

  deleteStudySession(userID: string, token: string, indexSession: string) {
    return this.http.delete(
      `${this.baseUrl}/users/${userID}/pomodoro/oldSessions/${indexSession}`,
      {
        headers: { authorization: this.resolveBearerToken(token) },
      }
    );
  }

  //api per le task
  getTasks(userID: string, token: string) {
    return this.http.get<TaskDTO[]>(
      `${this.baseUrl}/users/${userID}/pomodoro/tasks`,
      {
        headers: { authorization: this.resolveBearerToken(token) },
      }
    );
  }
  putTask(userID: string, tasks: Task[], token: string) {
    const mappedTask = tasks.map((task) => ({
      _id: task._id,
      taskName: task.name,
      taskStatus: task.completed ? 'completed' : 'pending',
      taskCompleted: task.completed,
    }));

    return this.http.put(
      `${this.baseUrl}/users/${userID}/pomodoro/tasks`,
      mappedTask,
      {
        headers: { authorization: this.resolveBearerToken(token) },
      }
    );
  }
  pushTask(userID: string, tasks: any, token: string) {
    const mappedTask = tasks.map((task: any) => ({
      taskName: task.name,
      taskStatus: task.completed ? 'completed' : 'pending',
      taskCompleted: task.completed,
    }));

    return this.http.post(
      `${this.baseUrl}/users/${userID}/pomodoro/tasks`,
      mappedTask,
      {
        headers: { authorization: this.resolveBearerToken(token) },
      }
    );
  }
  deleteTask(userID: string, token: string, taskid: string) {
    return this.http.delete(
      `${this.baseUrl}/users/${userID}/pomodoro/tasks/${taskid}`,
      {
        headers: { authorization: this.resolveBearerToken(token) },
      }
    );
  }

  getPomodoro(userID: string, pomodoroId: string, token: string) {
    return this.http.get(
      `${this.baseUrl}/users/${userID}/pomodoro/pomodoroinfo/${pomodoroId}`,
      {
        headers: { authorization: this.resolveBearerToken(token) },
      }
    );
  }
  putPomodoro(userID: string, pomodoro: Pomodoro, token: string) {
    return this.http.put(
      `${this.baseUrl}/users/${userID}/pomodoro/pomodoroinfo`,
      pomodoro,
      {
        headers: { authorization: this.resolveBearerToken(token) },
      }
    );
  }

  getStudyPlans(userID: string, token: string) {
    return this.http.get(
      `${this.baseUrl}/users/${userID}/pomodoro/studyplan`,
      {
        headers: { authorization: this.resolveBearerToken(token) },
      }
    );
  }

  putStudyPlans(userID: string, plan: StudyPlan, token: string) {
    return this.http.put(
      `${this.baseUrl}/users/${userID}/pomodoro/studyplan`, plan,
      {
        headers: { authorization: this.resolveBearerToken(token) },
      }
    );
  }

  deleteStudyPlan(userID:string, planid: string, token: string){
    return this.http.delete(
      `${this.baseUrl}/users/${userID}/pomodoro/studyplan/${planid}`,
      {
        headers: { authorization: this.resolveBearerToken(token) },
      }
    );

  }

  getEvents(userID: string, token: string) {
    return this.http.get<Events>(`${this.baseUrl}/users/${userID}/events`, {
      headers: { authorization: this.resolveBearerToken(token) },
    });
  }

  saveProject(
    project: Omit<Project, 'id' | 'author'>,
    userID: string,
    token: string
  ) {
    return this.http.post<string>(
      `${this.baseUrl}/users/${userID}/project`,
      project,
      {
        headers: { authorization: this.resolveBearerToken(token) },
      }
    );
  }
  getAllProject(userID: string, token: string) {
    return this.http
      .get<Project[]>(`${this.baseUrl}/users/${userID}/project`, {
        headers: { authorization: this.resolveBearerToken(token) },
      })
      .pipe(
        map((it) =>
          it.map((it) => ({
            ...it,
            start: new Date(it.start),
            expire: new Date(it.expire),
            tasks: it.tasks.map((it) => ({
              ...it,
              expire: new Date(it.expire),
              start: new Date(it.start),
            })),
          }))
        )
      );
  }

  deleteProject(projectID: string, userID: string, token: string) {
    return this.http.delete<Project[]>(
      `${this.baseUrl}/users/${userID}/project/${projectID}`,
      {
        headers: { authorization: this.resolveBearerToken(token) },
      }
    );
  }

  putTaskInProject(
    projectID: string,
    task: any,
    userID: string,
    token: string
  ) {
    return this.http
      .patch<Project>(
        `${this.baseUrl}/users/${userID}/project/task`,
        { projectId: projectID, task: task },
        {
          headers: { authorization: this.resolveBearerToken(token) },
        }
      )
      .pipe(this.mapProjectObservable());
  }

  updateProject(project: Project, userID: string, token: string) {
    return this.http.patch<string>(
      `${this.baseUrl}/users/${userID}/project`,
      { project: project },
      {
        headers: { authorization: this.resolveBearerToken(token) },
      }
    );
  }

  autoSuggestUsers(partialUsername: string, userID: string, token: string) {
    return this.http
      .post<string[]>(
        `${this.baseUrl}/users/${userID}/search`,
        { partialUsername: partialUsername },
        {
          headers: { authorization: this.resolveBearerToken(token) },
        }
      )
      .pipe(
        map((it) => {
          it.splice(it.indexOf(userID), 1);
          return it;
        })
      );
  }

  setToday(date: Date) {
    return this.http.post<void>(`${this.baseUrl}/time`, { date });
  }
  resetToday() {
    return this.http.post<void>(`${this.baseUrl}/time/reset`, {});
  }
  getToday() {
    return this.http.get<{today: Date}>(`${this.baseUrl}/time`);
  }

  mapProjectObservable() {
    return map((it: Project) => ({
      ...it,
      expire: new Date(it.expire),
      tasks: it.tasks.map((task) => ({
        ...task,
        expire: new Date(task.expire),
        start: new Date(task.start),
      })),
    }));
  }
}
