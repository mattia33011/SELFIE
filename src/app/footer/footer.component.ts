import { Component } from '@angular/core';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { SpeedDialModule } from 'primeng/speeddial';
import { TooltipModule } from 'primeng/tooltip';
@Component({
  selector: 'app-footer',
  imports: [
    ButtonModule,
    SpeedDialModule,
    RouterModule,
    TooltipModule,
    TranslatePipe,
  ],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css',
})
export class FooterComponent {
  items: any[];
  isSpeedDialVisible = false;

  constructor(
    private readonly translateService: TranslateService,
    router: Router
  ) {
    this.items = [
      {
        type: 'home',
        label: 'footer.home',
        icon: 'pi pi-home',
        route: '/home',
        desc: "Home"
      },
      {
        type: 'tomato',
        label: 'footer.tomato',
        img: 'tomato.png',
        icon: 'pi pi-stopwatch',
        route: '/timer',
        desc: "tomatoTimer"
      },

      {
        type: 'project',
        label: 'footer.event',
        icon: 'pi pi-sitemap',
        route: '/project',
        desc: "project-view"
      },
      {
        type: 'note',
        label: 'Note',
        icon: 'pi pi-pen-to-square',
        route: '/notes',
        desc: "notes"
      },
    ];
  }
}
