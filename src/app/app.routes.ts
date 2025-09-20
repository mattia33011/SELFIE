import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { HomeComponent } from './home/home.component';
import { loggedAuthGuard, notLoggedAuthGuard } from './guard/auth.guard';
import { VerifyAccountComponent } from './register/verify-account/verify-account.component';
import { ResetPasswordComponent } from './login/reset-password/reset-password.component';
import { ProfileComponent } from './profile/profile.component';
import { PomodoroComponent } from './pomodoro/pomodoro.components';

import { ActivateAccountComponent } from './register/activate-account/activate-account.component';
import { NoteComponent } from './note/note.components';
import { ProjectComponent } from './project/project.component';
import { DetailsComponent } from './project/details/details.component';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent, canActivate: [loggedAuthGuard] },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [loggedAuthGuard],
  },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [notLoggedAuthGuard],
  },
  {
    path: 'register',
    component: RegisterComponent,
    canActivate: [notLoggedAuthGuard],
  },
  {
    path: 'verify',
    component: VerifyAccountComponent,
    canActivate: [notLoggedAuthGuard],
  },
  {
    path: 'reset-password',
    component: ResetPasswordComponent,
  },
  {
    path: 'pomodoro',
    component: PomodoroComponent,
    canActivate: [loggedAuthGuard],
  },
  {
    path: 'note',
    component: NoteComponent,
    canActivate: [loggedAuthGuard],
  },
  {
    path: 'project',
    component: ProjectComponent,
    canActivate: [loggedAuthGuard],
  },
  {
    path: 'project/:projectName',
    component: DetailsComponent,
    canActivate: [loggedAuthGuard],
  },
  {
    path: 'activate',
    component: ActivateAccountComponent,
    canActivate: [notLoggedAuthGuard],
  },
];
