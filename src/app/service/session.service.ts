import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class SessionService {

  constructor(private readonly router: Router) { }

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

    signOut(){
      sessionStorage.removeItem('session')
      this.router.navigate(['/login'])
    }  

}

export type Session = {
  token: string,
  user: {
    email: string
  }
} 
