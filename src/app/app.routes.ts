import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { HomeComponent } from './home/home.component';
import { loggedAuthGuard, notLoggedAuthGuard } from './guard/auth.guard';
import { VerifyAccountComponent } from './register/verify-account/verify-account.component';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent, canActivate: [loggedAuthGuard] },
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
];
