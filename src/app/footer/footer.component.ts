import { Component } from '@angular/core';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { SpeedDialModule } from 'primeng/speeddial';
import { TooltipModule } from 'primeng/tooltip';
@Component({
  selector: 'app-footer',
  imports: [ButtonModule, SpeedDialModule, RouterModule, TooltipModule, TranslatePipe],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css',
})
export class FooterComponent {
  noteItems: {id: string, icon: string, desc:string, callback: () => any}[]
  items: any[];
  isSpeedDialVisible = false

  constructor(private readonly translateService: TranslateService, router: Router) {
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

    this.noteItems = [
      {id: 'add', icon: 'pi pi-plus', desc: "add-event", callback: () => undefined},
      {id: 'add-project', icon: 'pi pi-calendar-plus', desc: "add-project", callback: () => undefined},
      {id: 'new-project', icon: 'pi pi-sitemap',desc: "project-view", callback: () => {
        this.isSpeedDialVisible=false
        router.navigate(["project"])
      }},
    ]
  }

}
