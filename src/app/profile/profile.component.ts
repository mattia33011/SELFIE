import { Component } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import {
  SessionService,
  profilePictureSubject,
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
import { Session, User } from '../../types/session';
import { ApiService } from '../service/api.service';
import { TooltipModule } from 'primeng/tooltip';
import { onMessageSubject } from '../service/toast.service';
import {ConfirmDialogModule} from 'primeng/confirmdialog'
import { ConfirmationService } from 'primeng/api';
@Component({
  selector: 'app-profile',
  imports: [
    ConfirmDialogModule,
    TooltipModule,
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
  providers: [ConfirmationService],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent {
  constructor(
    protected readonly sessionService: SessionService,
    protected readonly translateService: TranslateService,
    private readonly themeService: ThemeService,
    private readonly apiService: ApiService,
    private readonly confirmationService: ConfirmationService
  ) {
    this.session = this.sessionService.getSession()!;
    this.fields = Object.entries(this.session!.user).map(([key, val]) => {
      console.log(val, val instanceof Date);
      return {
        field: key,
        value: val instanceof Date ? val.toLocaleDateString() : val,
        icon: retrieveIconFromUserField(key as keyof User),
      };
    });
    this.user = this.session!.user!;
    this.selectedLang = this.languages.find(
      (it) => it.lang == this.translateService.currentLang
    );
    this.selectedTheme = themeService.isDarkMode() ? 'dark' : 'light';
  }
  session: Session;
  imageUrl?: string;
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
  selectedTheme: 'dark' | 'light';

  changeLang(lang: string) {
    localStorage.setItem('lang', lang);
    this.translateService.use(lang);
  }

  setTheme(event: { value: string }) {
    this.themeService.setDarkMode(event.value == 'dark');
  }
  signOut() {
    this.sessionService.signOut();
  }

  ngOnInit() {
    this.imageUrl = this.sessionService.profilePictureUrl;
    profilePictureSubject.subscribe((path) => (this.imageUrl = path));
  }
  onFileChange(event: any) {
    const file = event.target.files[0] as File | undefined;
    if (!file) return;
    if(file.size > 2000000){
      onMessageSubject.next({severity: 'warn', summary: this.translateService.instant('http.warning'), detail: this.translateService.instant('profile.fileTooBig')})
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    this.apiService.putProfilePicture(formData, this.session).subscribe({
      next: (res) => {
        onMessageSubject.next({severity: 'success', summary: this.translateService.instant('http.success'), detail: this.translateService.instant('profile.uploadSuccess')})
        this.sessionService.loadProfilePicture()
      },
      error: (err) => {
        onMessageSubject.next({severity: 'error', summary: this.translateService.instant('http.error'), detail: this.translateService.instant('profile.uploadFailed')})
      },
    });
  }

  openDeleteDialog(event: Event) {
    this.confirmationService.confirm({
        target: event.target as EventTarget,
        message: this.translateService.instant('profile.deleteDialog.wouldDelete'),
        header: this.translateService.instant('profile.deleteDialog.areYouSure'),
        icon: 'pi pi-info-circle',
        rejectLabel: 'Cancel',
        
        rejectButtonProps: {
            label: this.translateService.instant('profile.deleteDialog.noDelete'),
        },
        acceptButtonProps: {
            label: this.translateService.instant('profile.deleteDialog.delete'),
            severity: 'danger',
        },
        accept: () => {
          this.apiService.deleteAccount(this.session).subscribe({
            next: () => {
              this.sessionService.signOut()
            },
            error: (err) => {
              onMessageSubject.next({severity: 'error', summary: this.translateService.instant('http.error'), detail: this.translateService.instant('profile.deleteDialog.error')})
            }
          })
        }
        
    });
}
}
