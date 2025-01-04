import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  LoginForm,
  RegisterForm,
  ResetPasswordForm,
} from '../../types/register';
import { Session, User } from '../../types/session';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  
  
  constructor(private readonly http: HttpClient) {}
  private readonly baseUrl = '/api';
  private resolveBearerToken = (token: string) => `Bearer ${token}`;

  getProfilePicture(session: Session) {
    return this.http
      .get(`${this.baseUrl}/users/${session.user.username}/profile-picture`, {
        headers: { authorization: this.resolveBearerToken(session.token) },
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
          headers: { authorization: this.resolveBearerToken(session.token) },
        }
      )
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
}
