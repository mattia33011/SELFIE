import { Component, effect } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { Card } from 'primeng/card';
import { Checkbox } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { StyleClassModule } from 'primeng/styleclass';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { KeyFilterModule } from 'primeng/keyfilter';
import {
  RegisterForm,
  passwordRegex,
  phoneNumberRegex,
} from '../../types/register';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { PasswordModule } from 'primeng/password';
import { DividerModule } from 'primeng/divider';
import { ApiService } from '../service/api.service';
import {
  getPasswordErrors,
  isPasswordFieldPristine,
  passwordMatchValidator,
} from '../../utils/password-utils';
import { DatePickerModule } from 'primeng/datepicker';
import { onMessageSubject } from '../service/toast.service';
import { TimeMachineService } from '../service/time-machine.service';

@Component({
  selector: 'app-register',
  imports: [
    DatePickerModule,
    DividerModule,
    PasswordModule,
    FormsModule,
    ReactiveFormsModule,
    InputGroupModule,
    InputGroupAddonModule,
    ButtonModule,
    Checkbox,
    StyleClassModule,
    InputTextModule,
    TranslatePipe,
    Card,
    RouterModule,
    KeyFilterModule,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  constructor(
    private readonly apiService: ApiService,
    private readonly router: Router,
    private readonly translateService: TranslateService,
    private readonly timeMachine: TimeMachineService
  ) {
    effect(() => {
      const today = timeMachine.today()
      if(today)
        this.maxDate = today
    })
  }
  loading = false;
  maxDate!: Date;
  form: FormGroup = new FormGroup(
    {
      firstName: new FormControl<string>('', [
        Validators.required,
        Validators.minLength(2),
      ]),
      lastName: new FormControl<string>('', [
        Validators.required,
        Validators.minLength(2),
      ]),
      username: new FormControl<string>('', [
        Validators.required,
        Validators.minLength(4),
      ]),
      birthDate: new FormControl<Date | undefined>(undefined, [
        Validators.required,
      ]),
      email: new FormControl<string>('', [
        Validators.required,
        Validators.email,
      ]),
      phoneNumber: new FormControl<string>('', [
        Validators.required,
        Validators.pattern(phoneNumberRegex),
      ]),
      password: new FormControl<string>('', [
        Validators.required,
        Validators.pattern(passwordRegex),
      ]),
      confirmPassword: new FormControl<string>('', [
        Validators.required,
        Validators.pattern(passwordRegex),
      ]),
      gdpr: new FormControl<boolean>(false, Validators.requiredTrue),
    },
    this.passwordMatchValidator
  );

  passwordMatchValidator(form: any): any {
    return passwordMatchValidator(form, 'password', 'confirmPassword');
  }

  getPasswordErrors(
    type: 'lowercase' | 'uppercase' | 'minimum' | 'special' | 'numeric'
  ) {
    return getPasswordErrors(this.form, 'password', type);
  }
  isPasswordFieldPristine() {
    return isPasswordFieldPristine(this.form, 'password');
  }
  submit() {
    if (this.form.invalid) return;
    this.loading = true;
    const registerForm: RegisterForm = {
      email: this.form.get('email')!.value.replaceAll(' ', ''),
      username: this.form.get('username')!.value.replaceAll(' ', ''),
      firstName: this.form.get('firstName')!.value.replaceAll(' ', ''),
      lastName: this.form.get('lastName')!.value.replaceAll(' ', ''),
      birthDate: this.form.get('birthDate')!.value,
      password: this.form.get('password')!.value.replaceAll(' ', ''),
      phoneNumber: this.form.get('phoneNumber')!.value.replaceAll(' ', ''),
    };

    this.apiService.register(registerForm).subscribe({
      next: (res) => {
        this.loading = true;
      },
      error: (err) => {
        console.log(err);
        const errDetail: string = err.error?.code ?? err.error?.status ?? 'genericError'
        const errContext = err.error?.context ?? ''

        onMessageSubject.next({ 
          severity: 'error',
          summary: this.translateService.instant(`http.error`),
          detail: this.translateService.instant(`http.${errDetail}`) + this.translateService.instant(`register.${errContext}`),
        });
        this.loading = false;
      },
      complete: () => {
        this.router.navigate(['verify']);
      },
    });
  }
  get password() {
    return this.form.get('password')!;
  }
}
