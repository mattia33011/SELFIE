import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SessionService {

  constructor() { }

  isLogged(){
    return this.getSession() != null
  }
  
  setToken(session: Session){
    sessionStorage.setItem('session', JSON.stringify(session))
  }
  getSession(): Session | undefined{
    const session = sessionStorage.getItem('session')
    if(session)
      return JSON.parse(session)
    return undefined;
    }
}

export type Session = {
  token: string,
  user: {
    email: string
  }
} 
