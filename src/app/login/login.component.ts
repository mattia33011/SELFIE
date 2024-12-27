import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { Checkbox } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import {StyleClassModule} from 'primeng/styleclass';
import {TranslatePipe} from "@ngx-translate/core";
import { Card } from 'primeng/card';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [ButtonModule, Checkbox, StyleClassModule, InputTextModule, TranslatePipe, Card, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  standalone: true
})
export class LoginComponent {
  toggleDarkMode() {
    const element = document.querySelector('html');
    element?.classList.toggle('selfie-dark');
  }
}
