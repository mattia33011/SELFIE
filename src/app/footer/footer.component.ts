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
  isSpeedDialVisible = false
  constructor(private readonly translateService: TranslateService) {
    this.items = [
      {
        type: 'tomato',
        label: translateService.instant('footer.Tomato') + ' timer',
        img: 'tomato.png',
        icon: "pi pi-stopwatch",
        route: '/timer',
      },
      
      {
        type: 'event',
        icon: 'pi pi-plus',
        route: '/timer',
      },
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
    ];
  }

  noteItems: {id: string, icon: string, callback: () => any}[] = [
    {id: 'add', icon: 'pi pi-plus', callback: () => undefined},
    {id: 'schedule', icon: 'pi pi-calendar', callback: () => undefined},
  ]
}
