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
import { Session, SessionService } from '../../service/session.service';
import { RouterModule } from '@angular/router';
import { Location } from '@angular/common';
import { MessageService } from 'primeng/api';
import { onMessageSubject } from '../../service/toast.service';

@Component({
  selector: 'app-reset-password',
  imports: [
    CardModule,
    RouterModule,
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
  session?: Session;

  constructor(
    private readonly sessionService: SessionService,
    private readonly location: Location,
  ) {
    this.session = sessionService.getSession();
    this.form = new FormGroup(
      {
        email: new FormControl(this.session?.user.email ?? '', [
          Validators.required,
          Validators.email,
        ]),
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

  submit() {
    onMessageSubject.next({
      severity: 'success',
      summary: 'reset.success',
      detail: 'reset.passwordSetted',
    });
    this.location.back()
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
