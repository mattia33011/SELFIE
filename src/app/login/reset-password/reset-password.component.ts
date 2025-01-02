import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ResetPasswordForm, passwordRegex } from '../../../types/register';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { DividerModule } from 'primeng/divider';
import {
  PasswordValidatorType,
  getPasswordErrors,
  isPasswordFieldPristine,
  passwordMatchValidator,
} from '../../../utils/password-utils';
import { SessionService } from '../../service/session.service';
import { RouterModule } from '@angular/router';
import { Location } from '@angular/common';
import { MessageService } from 'primeng/api';
import { onMessageSubject } from '../../service/toast.service';
import { ApiService } from '../../service/api.service';
import { Session } from '../../../types/session';

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
    private readonly translateService: TranslateService,
    private readonly apiService: ApiService,
    private readonly location: Location
  ) {
    this.session = sessionService.getSession();
    this.form = new FormGroup(
      {
        userID: new FormControl(this.session?.user.email ?? '', [
          Validators.required,
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
    if (this.form.invalid) return;
    this.loading = true;
    const form: ResetPasswordForm = {
      userID: this.form.get('userID')!.value,
      oldPassword: this.form.get('oldPassword')!.value,
      newPassword: this.form.get('newPassword')!.value,
    };

    this.apiService.resetPassword(form).subscribe({
      next: (res) => {
        onMessageSubject.next({
          severity: 'success',
          summary: this.translateService.instant('http.success'),
          detail: this.translateService.instant('reset.passwordSetted'),
        });
        this.loading = false;
        this.location.back();
      },
      error: (err) => {
        onMessageSubject.next({
          severity: 'error',
          summary: this.translateService.instant('http.error'),
          detail: this.translateService.instant(
            this.resolveHttpError(err.status)
          ),
        });
        this.loading = false;
      },
    });
  }

  resolveHttpError(status: number): string {
    // TODO other status
    switch (status) {
      default:
        return 'reset.error';
    }
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
