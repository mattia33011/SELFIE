import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { SpeedDialModule } from 'primeng/speeddial';

@Component({
  selector: 'app-footer',
  imports: [ButtonModule, SpeedDialModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css',
})
export class FooterComponent {
  items: any[];
  constructor(private translateService: TranslateService) {
    this.items = [
      {
        type: 'note',
        label: 'Note',
        icon: 'pi pi-pen-to-square',
        actions: [
          {
            label: translateService.instant('footer.createNote'),
            route: '/note?new=1',
          },
          {
            label: translateService.instant('footer.openNotes'),
            route: '/note',
          },
        ],
      },
      {
        type: 'event',
        icon: 'pi pi-plus',
        route: '/timer',
      },
      {
        type: 'tomato',
        label: translateService.instant('footer.Tomato') + ' timer',
        img: 'tomato.png',
        icon: "pi pi-stopwatch",
        route: '/timer',
      },
    ];
  }
}
