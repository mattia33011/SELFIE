import { Component } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import {
  SessionService,
  retrieveIconFromUserField,
} from '../service/session.service';
import { InputTextModule } from 'primeng/inputtext';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ButtonModule } from 'primeng/button';
import { RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { ThemeService } from '../service/theme.service';
import { User } from '../../types/session';
@Component({
  selector: 'app-profile',
  imports: [
    FormsModule,
    SelectModule,
    RouterModule,
    AvatarModule,
    ButtonModule,
    InputIconModule,
    IconFieldModule,
    InputTextModule,
    InputGroupAddonModule,
    InputGroupModule,
    TranslatePipe,
    CardModule,
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent {
  constructor(
    protected readonly sessionService: SessionService,
    protected readonly translateService: TranslateService,
    private readonly themeService: ThemeService
  ) {
    this.fields = Object.entries(this.sessionService.getSession()!.user).map(
      ([key, val]) => {
        console.log(val, val instanceof Date);
        return {
          field: key,
          value: val instanceof Date ? val.toLocaleDateString() : val,
          icon: retrieveIconFromUserField(key as keyof User),
        };
      }
    );
    this.user = this.sessionService.getSession()!.user!;
    this.selectedLang = this.languages.find(
      (it) => it.lang == this.translateService.currentLang
    );
    this.selectedTheme = themeService.isDarkMode() ? 'dark' : 'light' 
  }

  selectedLang?: { lang: string; flag: string };
  languages = [
    { lang: 'it', flag: '🇮🇹' },
    { lang: 'en', flag: '🇬🇧' },
  ];
  user: User;
  fields: { field: string; value: any; icon: string }[];
  themes = [
    { value: 'dark', icon: 'pi-moon pi' },
    { value: 'light', icon: 'pi-sun pi' },
  ];
  selectedTheme: 'dark' | 'light'

  changeLang(lang: string) {
    localStorage.setItem('lang', lang);
    this.translateService.use(lang);
  }

  setTheme(event: { value: string }) {
    this.themeService.setDarkMode(event.value == 'dark');
  }
  signOut(){
    this.sessionService.signOut()
  }
}
