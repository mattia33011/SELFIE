import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LoginForm, RegisterForm, ResetPasswordForm } from '../../types/register';
import { Session } from '../../types/session';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private readonly http: HttpClient) { }

  private readonly baseUrl = "/api"

  login(form: LoginForm){
    return this.http.post<Session>(`${this.baseUrl}/login`, form)
  }
  
  register(form: RegisterForm){
    return this.http.post(`${this.baseUrl}/register`, form)
  }
  resetPassword(form: ResetPasswordForm){
    return this.http.patch(`${this.baseUrl}/reset-password`, form)
  }
}
