import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {
  LoginForm,
  RegisterForm,
  ResetPasswordForm,
} from '../../types/register';
import {Session, User} from '../../types/session';
import {map} from 'rxjs';
import {environment} from '../../environments/environment';
import {Events, Notes} from '../../types/events';
import { Task, TaskDTO } from '../../types/pomodoro';

@Injectable({
  providedIn: 'root',
})
export class ApiService {


  constructor(private readonly http: HttpClient) {
  }

  private readonly baseUrl = environment.baseUrl;
  private resolveBearerToken = (token: string) => `Bearer ${token}`;

  getProfilePicture(session: Session) {
    return this.http
      .get(`${this.baseUrl}/users/${session.user.username}/profile-picture`, {
        headers: {authorization: this.resolveBearerToken(session.token)},
        responseType: 'blob',
      })
      .pipe(map((res) => URL.createObjectURL(res)));
  }

  putProfilePicture(formData: FormData, session: Session) {
    return this.http
      .put(
        `${this.baseUrl}/users/${session.user.username}/profile-picture`,
        formData,
        {
          headers: {authorization: this.resolveBearerToken(session.token)},
        }
      )
  }

  login(form: LoginForm) {
    return this.http.post<Session>(`${this.baseUrl}/login`, form);
  }

  activate(token: string) {
    return this.http.get(`${this.baseUrl}/activate`, {
      params: {token: token},
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
      headers: {authorization: this.resolveBearerToken(session.token)},
    });
  }

  getNotes(userID: string, token: string, dateFilter?: Date) {
    const params = dateFilter ? {
      dateFilter: dateFilter.toString()
    } : undefined
    return this.http.get<Notes>(`${this.baseUrl}/users/${userID}/notes`, {
      headers: {authorization: this.resolveBearerToken(token)},
      params: params,
    });
  }

  putNote(userID: string, note: Notes, token: string) {
    return this.http.put(`${this.baseUrl}/users/${userID}/notes`, note, {
      headers : {authorization: this.resolveBearerToken(token)},
    });
  }

  pushNote(userID: string, note: Notes, token: string) {
    return this.http.post(`${this.baseUrl}/users/${userID}/notes`, note, {
      headers: {authorization: this.resolveBearerToken(token)},
    });
  }

  getRecentNotes(userID: string, token: string) {
    return this.http.get<Notes>(`${this.baseUrl}/users/${userID}/notes/recent`, {
      headers: {authorization: this.resolveBearerToken(token)},
    });
  }

  deleteNote(userID: string, note: Notes, token: string) {
    return this.http.delete(`${this.baseUrl}/users/${userID}/notes/${note}`, {
    headers: {authorization: this.resolveBearerToken(token)},
    });
  }

  //api per le sessioni e pomodoro

  getStudySessions(userID: string, token: string) {
    return this.http.get(`${this.baseUrl}/users/${userID}/pomodoro/oldSessions`, {
      headers: {authorization: this.resolveBearerToken(token)},
    });
  }
  pushStudySessions(userID: string, pomodoroHistory: any, token: string) {
    return this.http.post(`${this.baseUrl}/users/${userID}/pomodoro/oldSessions`, pomodoroHistory, {
      headers: {authorization: this.resolveBearerToken(token)},
    });
  }

  deleteStudySession(userID: string, pomodoroHistory: any, token: string, indexSession: number) {
    return this.http.delete(`${this.baseUrl}/users/${userID}/pomodoro/oldStudySession/${indexSession}`, {
      headers: {authorization: this.resolveBearerToken(token)},
    });
  }

  //api per le task
  getTasks(userID: string, token: string) {
    return this.http.get<TaskDTO[]>(`${this.baseUrl}/users/${userID}/pomodoro/tasks`, {
      headers: {authorization: this.resolveBearerToken(token)},
    });
  }
  putTask(userID: string, tasks: Task[], token: string) {

    const mappedTask = tasks.map(task => ({
      taskName: task.name,
      taskStatus: task.completed ? "completed": "pending",
      taskCompleted: task.completed
    }))

    return this.http.put(`${this.baseUrl}/users/${userID}/pomodoro/tasks`, mappedTask, {
      headers: {authorization: this.resolveBearerToken(token)},
    });
  }
  pushTask(userID: string, tasks: any, token: string) {
    const mappedTask = tasks.map((task: any) => ({
      taskName: task.name,
      taskStatus: task.completed ? "completed": "pending",
      taskCompleted: task.completed
    }))

    return this.http.post(`${this.baseUrl}/users/${userID}/pomodoro/tasks`, mappedTask, {
      headers: {authorization: this.resolveBearerToken(token)},
    });
  }
  deleteTask(userID: string, token: string, taskid: string) {
    return this.http.delete(`${this.baseUrl}/users/${userID}/pomodoro/tasks/${taskid}`, {  
      headers : {authorization: this.resolveBearerToken(token)},
    });
  }

  getPomodoro(userID: string, token: string) {
    return this.http.get(`${this.baseUrl}/users/${userID}/pomodoro`, {
      headers: {authorization: this.resolveBearerToken(token)},
    });
  }
  putPomodoro(userID: string, pomodoro: any, token: string) {
    return this.http.put(`${this.baseUrl}/users/${userID}/pomodoro`, pomodoro, {
      headers: {authorization: this.resolveBearerToken(token)},
    });
  }

  getEvents(userID: string, token: string) {
    return this.http.get<Events>(`${this.baseUrl}/users/${userID}/events`, {
      headers: {authorization: this.resolveBearerToken(token)},
    });
  }
}
