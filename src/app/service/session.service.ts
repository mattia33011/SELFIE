import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SessionService {

  constructor() { }

  isLogged(){
    return sessionStorage.getItem('sessionToken') != null
  }
  
  setToken(token: string){
    sessionStorage.setItem('sessionToken', token)
  }
}
