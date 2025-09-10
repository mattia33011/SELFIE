import { Component, effect } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { Menubar } from 'primeng/menubar';
import { BadgeModule } from 'primeng/badge';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ImageModule } from 'primeng/image';
import { Avatar } from 'primeng/avatar';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ThemeService } from '../service/theme.service';
import { FormsModule } from '@angular/forms';
import { PopoverModule } from 'primeng/popover';
import { ListboxModule } from 'primeng/listbox';
import { SessionService } from '../service/session.service';
import { Router, RouterModule } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { ApiService } from '../service/api.service';
import { TimeMachineService } from '../service/time-machine.service';
import { Button } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DatePickerModule } from 'primeng/datepicker';
@Component({
  selector: 'app-navbar',
  imports: [
    DialogModule,
    NgOptimizedImage,
    TranslatePipe,
    ListboxModule,
    PopoverModule,
    Menubar,
    RouterModule,
    InputTextModule,
    BadgeModule,
    CommonModule,
    Avatar,
    ImageModule,
    ToggleSwitchModule,
    FormsModule,
    Button,
    DatePickerModule,
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  constructor(
    protected readonly themeService: ThemeService,
    protected readonly sessionService: SessionService,
    private readonly router: Router,
    protected readonly timeMachine: TimeMachineService
  ) {
    effect(() => {
      const today = timeMachine.today()
      if(today)
        this.today = today;
    });
  }
  today!: Date;
  items: MenuItem[] | undefined;
  isDialogOpened = false;

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
    this.sessionService.loadProfilePicture();
    this.themeService.listen.subscribe((res) => {
      this._checked = res == 'dark' ? true : false;
    });
  }
  ngOnCheck() {
    this.checked = this.themeService.isDarkMode();
  }

  toggleDialog() {
    this.isDialogOpened = !this.isDialogOpened;
  }
  resetForm() {
    this.today = this.timeMachine.today()!;
  }
  resetTime() {
    this.timeMachine.resetToday(() => {
      this.toggleDialog();
    });
  }
  setTime() {
    if (this.today == this.timeMachine.today()) return;

    this.timeMachine.setToday(this.today, () => {
      this.toggleDialog();
    });
  }
}
