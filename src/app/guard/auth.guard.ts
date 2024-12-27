import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionService } from '../service/session.service';

export const loggedAuthGuard: CanActivateFn = (route, state) => {
  const isLogged = inject(SessionService).isLogged()
  if(!isLogged)
    inject(Router).navigate(['login'])
  return true;
};

export const notLoggedAuthGuard: CanActivateFn = (route, state) => {
  const isLogged = inject(SessionService).isLogged()
  if(isLogged)
    inject(Router).navigate(['home'])
  return true;
};