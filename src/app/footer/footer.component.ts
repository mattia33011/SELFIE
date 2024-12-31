import { Component } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { SpeedDialModule } from 'primeng/speeddial';

@Component({
  selector: 'app-footer',
  imports: [ButtonModule, SpeedDialModule, TranslatePipe],
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
        label: 'footer.tomato',
        img: 'tomato.png',
        icon: "pi pi-stopwatch",
        route: '/timer',
      },
      
      {
        type: 'event',
        label: 'footer.event',
        icon: 'pi pi-plus',
        route: '/event',
      },
      {
        type: 'note',
        label: 'Note',
        icon: 'pi pi-pen-to-square',
        route: '/notes'
      },
    ];
  }

  noteItems: {id: string, icon: string, callback: () => any}[] = [
    {id: 'add', icon: 'pi pi-plus', callback: () => undefined},
    {id: 'schedule', icon: 'pi pi-calendar', callback: () => undefined},
  ]
}
