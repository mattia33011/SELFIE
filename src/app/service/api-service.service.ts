import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LoginForm } from '../../types/register';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private readonly http: HttpClient) { }

  private readonly baseUrl = 'http://localhost:3000'

  login(form: LoginForm){
    return this.http.post<{token: string}>(`${this.baseUrl}/login`, form)
  }
}
