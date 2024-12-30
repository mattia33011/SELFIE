import { Component } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import {
  SessionService,
  User,
  retrieveIconFromUserField,
} from '../service/session.service';
import { InputTextModule } from 'primeng/inputtext';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { TranslatePipe } from '@ngx-translate/core';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ButtonModule } from 'primeng/button';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-profile',
  imports: [
    RouterModule,
    AvatarModule,
    ButtonModule,
    InputIconModule,
    IconFieldModule,
    InputTextModule,
    InputGroupAddonModule,
    InputGroupModule,
    TranslatePipe
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent {
  constructor(protected readonly sessionService: SessionService) {
    this.fields = Object.entries(this.sessionService.getSession()!.user).map(
      ([key, val]) => {
        console.log(val, val instanceof Date)
        return {
          field: key,
          value: (val instanceof Date) ? val.toLocaleDateString() : val,
          icon: retrieveIconFromUserField(key as keyof User),
        };
      }
    );
    this.user = this.sessionService.getSession()!.user!;
  }

  user: User;

  fields: {field: string, value: any; icon: string }[];
}
