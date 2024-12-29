import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { passwordRegex } from '../../../types/register';
import { TranslatePipe } from '@ngx-translate/core';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { DividerModule } from 'primeng/divider';
import {
  PasswordValidatorType,
  getPasswordErrors,
  isPasswordFieldPristine,
  passwordMatchValidator,
} from '../../../utils/password-utils';

@Component({
  selector: 'app-reset-password',
  imports: [
    CardModule,
    ReactiveFormsModule,
    ButtonModule,
    TranslatePipe,
    InputTextModule,
    PasswordModule,
    DividerModule,
  ],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css',
})
export class ResetPasswordComponent {
  loading = false;
  form: FormGroup;

  constructor() {
    this.form = new FormGroup(
      {
        email: new FormControl('', [Validators.required, Validators.email]),
        oldPassword: new FormControl('', [
          Validators.required,
          Validators.pattern(passwordRegex),
        ]),
        newPassword: new FormControl('', [
          Validators.required,
          Validators.pattern(passwordRegex),
        ]),
        confirmNewPassword: new FormControl('', [
          Validators.required,
          Validators.pattern(passwordRegex),
        ]),
      },
      this.passwordMatchValidator
    );
  }

  passwordMatchValidator(form: any): any {
    return passwordMatchValidator(form, 'newPassword', 'confirmNewPassword');
  }

  isPasswordFieldPristine(controlName: string) {
    return isPasswordFieldPristine(this.form, controlName);
  }
  getPasswordErrors(controlName: string, type: PasswordValidatorType) {
    return getPasswordErrors(this.form, controlName, type);
  }
}
