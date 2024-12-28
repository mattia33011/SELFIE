import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { Checkbox } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { StyleClassModule } from 'primeng/styleclass';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Card } from 'primeng/card';
import { Router, RouterLink, RouterModule } from '@angular/router';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { LoginForm } from '../../types/register';
import { ApiService } from '../service/api.service';
import { MessageService } from 'primeng/api';
import { Toast } from 'primeng/toast';
import { SessionService } from '../service/session.service';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    Checkbox,
    StyleClassModule,
    InputTextModule,
    TranslatePipe,
    Card,
    RouterModule,
    Toast
  ],
  providers: [MessageService],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  standalone: true,
})
export class LoginComponent {

  constructor(private readonly router: Router, private readonly apiService: ApiService, private readonly messageService: MessageService, private readonly translateService: TranslateService, private readonly sessionService: SessionService) { }

  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', Validators.required),
    rememberMe: new FormControl<boolean | null>(null),
  });

  loading = false

  submit() {
    if (this.form.invalid) return;
    this.loading = true
    const loginForm: LoginForm = {
      email: this.form.get('email')!.value!,
      password: this.form.get('password')!.value!, 
      rememberMe: this.form.get('rememberMe')!.value 
    }

    this.apiService.login(loginForm).subscribe({
      next: (res) => {
        this.sessionService.setToken(res)
        this.router.navigate(['/home'])
      },
      error: (err) => {
        console.log(err);
        this.messageService.add({ severity: 'error', summary: this.translateService.instant('http.error'), detail: this.translateService.instant('user') + ' ' + this.translateService.instant(`http.${err.status}`) });
        this.loading = false
      },
      complete: () => {
        this.loading = false       
      }
    })
    
  }
}
