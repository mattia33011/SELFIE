import { Component } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { Menubar } from 'primeng/menubar';
import { BadgeModule } from 'primeng/badge';
import { CommonModule } from '@angular/common';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { ImageModule } from 'primeng/image';
import { Avatar } from 'primeng/avatar';

@Component({
  selector: 'app-navbar',
  imports: [
    InputIcon,
    IconField,
    Menubar,
    InputTextModule,
    BadgeModule,
    CommonModule,
    Avatar,
    ImageModule,
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  items: MenuItem[] | undefined;
  today = new Date()
  ngOnInit() {
    this.items = [];
  }
}
