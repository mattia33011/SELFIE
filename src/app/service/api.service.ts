import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LoginForm } from '../../types/register';
import { Session } from './session.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private readonly http: HttpClient) { }

  private readonly baseUrl = 'http://192.168.1.10:3000'

  login(form: LoginForm){
    return this.http.post<Session>(`${this.baseUrl}/login`, form)
  }
}
