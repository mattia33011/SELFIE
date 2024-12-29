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
import { PopoverModule } from 'primeng/popover';
import { ListboxModule } from 'primeng/listbox';
import { SessionService } from '../service/session.service';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-navbar',
  imports: [
    TranslatePipe,
    ListboxModule,
    PopoverModule,
    Menubar,
    InputTextModule,
    BadgeModule,
    CommonModule,
    Avatar,
    ImageModule,
    ToggleSwitchModule,
    FormsModule,
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  constructor(
    protected readonly themeService: ThemeService,
    protected readonly sessionService: SessionService,
    private readonly router: Router
  ) {}

  items: MenuItem[] | undefined;
  today = new Date();

  private _checked: boolean = false;

  options!: { name: string; action: () => any }[];

  get checked() {
    return this._checked;
  }
  set checked(val: boolean) {
    this.themeService.setDarkMode(val);
    this._checked = val;
  }

  ngOnInit() {
    console.log(this.themeService.isDarkMode());
    this.options = [
      { name: 'nav.profile', action: () => this.router.navigate(['/profile']) },
    ];
    this.items = [];
    this.checked = this.themeService.isDarkMode();
  }
  ngOnCheck() {
    this.checked = this.themeService.isDarkMode();
  }
}
