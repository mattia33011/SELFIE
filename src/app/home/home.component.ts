import { Component } from '@angular/core';
import { SessionService } from '../service/session.service';
import { SkeletonModule } from 'primeng/skeleton';
import { PanelModule } from 'primeng/panel';
import { ButtonModule } from 'primeng/button';
import { TranslatePipe } from '@ngx-translate/core';
import { Events, Notes } from '../../types/events';
import { EventListComponent } from "./event-list/event-list.component";
import { DatePickerModule } from 'primeng/datepicker';
import { CalendarComponent } from './calendar/calendar.component';

@Component({
  selector: 'app-home',
  imports: [PanelModule, SkeletonModule, ButtonModule, TranslatePipe, EventListComponent,CalendarComponent], // calendar
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

notes: Notes = [
  {"title": "Appunti Analisi", lastEdit: new Date(), created: new Date(),  content: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.'}
]

loading = false


}
