import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Session, User } from '../../types/session';
import { ApiService } from './api.service';
import { ReplaySubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  constructor(
    private readonly router: Router,
    private readonly apiService: ApiService
  ) {}

  isLogged() {
    return this.getSession() != null;
  }

  setToken(session: Session, rememberMe?: boolean) {
    if (rememberMe) localStorage.setItem('session', JSON.stringify(session));
    sessionStorage.setItem('session', JSON.stringify(session));
  }
  getSession(): Session | undefined {
    const sessionStr =
      sessionStorage.getItem('session') ?? localStorage.getItem('session');
    if (sessionStr) {
      const session = JSON.parse(sessionStr) as Session;
      return {
        ...session,
        user: { ...session.user, birthDate: new Date(session.user.birthDate) },
      };
    }

    return undefined;
  }
  profilePictureUrl?: string
  loadProfilePicture() {
    const user = this.getSession();
    if (user)
      this.apiService.getProfilePicture(user).subscribe({
        next: (res) => {
          this.profilePictureUrl = res
          profilePictureSubject.next(res)
        },
        error: (err) => {
          profilePictureSubject.next(undefined)
        }
      });
  }
  signOut() {
    this.profilePictureUrl = undefined
    localStorage.removeItem('session');
    sessionStorage.removeItem('session');
    this.router.navigate(['/login']);
  }
}

export const retrieveIconFromUserField = (key: keyof User) => {
  switch (key) {
    case 'email':
      return 'pi pi-at';
    case 'birthDate':
      return 'pi pi-calendar';
    case 'firstName':
      return 'pi pi-address-book';
    case 'lastName':
      return 'pi pi-users';
    case 'username':
      return 'pi pi-user';
    case 'phoneNumber':
      return 'pi pi-phone';
  }
};

export const profilePictureSubject = new ReplaySubject<string | undefined>(10)
