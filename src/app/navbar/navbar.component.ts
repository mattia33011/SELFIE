import { Component } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { Menubar } from 'primeng/menubar';
import { BadgeModule } from 'primeng/badge';
import { CommonModule } from '@angular/common';
import { ImageModule } from 'primeng/image';
import { Avatar } from 'primeng/avatar';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ThemeService } from '../service/theme.service';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-navbar',
  imports: [
    Menubar,
    InputTextModule,
    BadgeModule,
    CommonModule,
    Avatar,
    ImageModule,
    ToggleSwitchModule,
    FormsModule
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  items: MenuItem[] | undefined;
  today = new Date()

  private _checked: boolean = false;

  constructor(private readonly themeService: ThemeService){}

  get checked () {
    return this._checked
  }
  set checked (val: boolean){
    this.themeService.setDarkMode(val)
    this._checked = val
  }

  ngOnInit() {
    console.log(this.themeService.isDarkMode());
    
    this.items = [];
    this.checked = this.themeService.isDarkMode()
  }
  ngOnCheck(){
    this.checked = this.themeService.isDarkMode()
  }
}
