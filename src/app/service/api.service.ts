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
import { Events, Notes } from '../../types/events';
import { Task, TaskDTO } from '../../types/pomodoro';
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

  getNotes(userID: string, token: string, dateFilter?: Date) {
    const params = dateFilter
      ? {
          dateFilter: dateFilter.toString(),
        }
      : undefined;
    return this.http.get<Notes>(`${this.baseUrl}/users/${userID}/notes`, {
      headers: { authorization: this.resolveBearerToken(token) },
      params: params,
    });
  }

  putNote(userID: string, note: Notes, token: string) {
    return this.http.put(`${this.baseUrl}/users/${userID}/notes`, note, {
      headers: { authorization: this.resolveBearerToken(token) },
    });
  }

  pushNote(userID: string, note: Notes, token: string) {
    return this.http.post(`${this.baseUrl}/users/${userID}/notes`, note, {
      headers: { authorization: this.resolveBearerToken(token) },
    });
  }

  getRecentNotes(userID: string, token: string) {
    return this.http.get<Notes>(
      `${this.baseUrl}/users/${userID}/notes/recent`,
      {
        headers: { authorization: this.resolveBearerToken(token) },
      }
    );
  }

  deleteNote(userID: string, note: Notes, token: string) {
    return this.http.delete(`${this.baseUrl}/users/${userID}/notes/${note}`, {
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
  pushStudySessions(userID: string, pomodoroHistory: any, token: string) {
    return this.http.post(
      `${this.baseUrl}/users/${userID}/pomodoro/oldSessions`,
      pomodoroHistory,
      {
        headers: { authorization: this.resolveBearerToken(token) },
      }
    );
  }

  deleteStudySession(
    userID: string,
    pomodoroHistory: any,
    token: string,
    indexSession: number
  ) {
    return this.http.delete(
      `${this.baseUrl}/users/${userID}/pomodoro/oldStudySession/${indexSession}`,
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

  getPomodoro(userID: string, token: string) {
    return this.http.get(`${this.baseUrl}/users/${userID}/pomodoro`, {
      headers: { authorization: this.resolveBearerToken(token) },
    });
  }
  putPomodoro(userID: string, pomodoro: any, token: string) {
    return this.http.put(`${this.baseUrl}/users/${userID}/pomodoro`, pomodoro, {
      headers: { authorization: this.resolveBearerToken(token) },
    });
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
            tasks: it.tasks.map(it => ({...it, expire: new Date(it.expire), start: new Date(it.start)}))
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
      .pipe(this.mapProjectObservable())
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



  mapProjectObservable(){
    return map((it: Project) => ({
      ...it,
      expire: new Date(it.expire),
      tasks: it.tasks.map((task) => ({
        ...task,
        expire: new Date(task.expire),
        start: new Date(task.start),
      })),
    }))
  }

  createEvent(userID: string, event: Event, token: string) {
    return this.http.post(`${this.baseUrl}/users/${userID}/events`, event, {
      headers: { authorization: this.resolveBearerToken(token) },
    });
  }
 updateEvent(userID: string, eventId: string, event: Event, token: string) {
    return this.http.put(`${this.baseUrl}/users/${userID}/events/${eventId}`, event, {
      headers: { authorization: this.resolveBearerToken(token) },
    });
  }

  deleteEvent(userID: string, eventId: string, token: string) {
    return this.http.delete(`${this.baseUrl}/users/${userID}/events/${eventId}`, {
      headers: { authorization: this.resolveBearerToken(token) },
    });
  }

  pushEvent(userID: string, event: any, token: string) {
    return this.http.post(`${this.baseUrl}/users/${userID}/events`, event, {
      headers: { authorization: this.resolveBearerToken(token) },
    });
  }
}