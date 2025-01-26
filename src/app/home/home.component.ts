import { Component } from '@angular/core';
import { SessionService } from '../service/session.service';
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';
import { PanelModule } from 'primeng/panel';
import { ButtonModule } from 'primeng/button';
import { TranslatePipe } from '@ngx-translate/core';
import { Events } from '../../types/events';
import { EventListComponent } from "./event-list/event-list.component";

@Component({
  selector: 'app-home',
  imports: [PanelModule, SkeletonModule, ButtonModule, TranslatePipe, EventListComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

  constructor(protected readonly sessionService: SessionService) { }

  todayEvents: Events = [{
    title: 'Palestra',
    description: 'FitActive Creti',
    'expireDate': new Date()
  },
  {
    title: 'TW Laboratorio',
    description: 'Laboratorio Ercolani Seminterrato',
    expireDate: new Date(),
    color: 'help'
  },
  {
    title: 'Calcolo numerico',
    description: 'Aula Ercolani 1',
    'expireDate': new Date(),
    color: 'danger'
  },
  {
    title: 'Tiro con l\'arco',
    'expireDate': new Date(),
    color: 'info'
  },
  {
    title: 'TW Laboratorio',
    'expireDate': new Date(),
    color: 'warn'

  }
]

deadlineEvents: Events = [
  {
    title: 'Esame TW',
    description: 'Laboratorio Ercolani Seminterrato',
    expireDate: new Date(),
    color: 'help'
  },
  {
    title: 'Esame Calcolo numerico',
    description: 'Aula Ercolani 1',
    'expireDate': new Date(),
    color: 'danger'
  }
]

loading = false


}
