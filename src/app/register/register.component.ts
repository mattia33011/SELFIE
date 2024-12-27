import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { Card } from 'primeng/card';
import { Checkbox } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { StyleClassModule } from 'primeng/styleclass';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { KeyFilterModule } from 'primeng/keyfilter';
import { RegisterForm, passwordRegex, phoneNumberRegex } from '../../types/register';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { PasswordModule } from 'primeng/password';
import { DividerModule } from 'primeng/divider';

@Component({
  selector: 'app-register',
  imports: [
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


  form: FormGroup = new FormGroup({
    firstName: new FormControl<string>('', [Validators.required, Validators.minLength(2)]),
    lastName: new FormControl<string>('',[Validators.required, Validators.minLength(2)]),
    email: new FormControl<string>('', [Validators.required, Validators.email]),
    phoneNumber: new FormControl<string>('', [Validators.required, Validators.pattern(phoneNumberRegex)]),
    password: new FormControl<string>('', [Validators.required, Validators.pattern(passwordRegex)]),
    confirmPassword: new FormControl<string>('', [Validators.required, Validators.pattern(passwordRegex)]),
    gdpr: new FormControl<boolean>(false, Validators.requiredTrue)
  },passwordMatchValidator);

  getPasswordErrors(type: 'lowercase' | 'uppercase' | 'minimum' | 'special' | 'numeric'){
    const value = this.form.get('password')!.value as string
    switch(type){
      case "lowercase": return /(?=.*[a-z])/.exec(value)
      case "uppercase": return /(?=.*[A-Z])/.exec(value)
      case "minimum": return /(?=.{8,})/.exec(value)
      case "numeric": return /(?=.*\d)/.exec(value)
      case "special": return /(?=.*[^a-zA-Z0-9])/.exec(value)
    }
  }
  isPasswordFieldPristine(){
    return this.form.get('password')?.pristine ?? false
  }
  
  submit(){
    if(this.form.invalid)
      return;

    const registerForm: RegisterForm = {
      email: this.form.get('email')!.value,
      firstName: this.form.get('firstName')!.value,
      lastName: this.form.get('lastName')!.value,
      password: this.form.get('password')!.value,
      phoneNumber: this.form.get('phoneNumber')!.value
    }
    console.log(registerForm);
    
  }

}

function passwordMatchValidator(g: any): any {
  return g.get('password')?.value === g.get('confirmPassword')?.value
     ? null : {'mismatch': true};
}
