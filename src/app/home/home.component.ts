import {ChangeDetectorRef, Component} from '@angular/core';
import {SessionService} from '../service/session.service';
import {SkeletonModule} from 'primeng/skeleton';
import {PanelModule} from 'primeng/panel';
import {ButtonModule} from 'primeng/button';
import {TranslatePipe} from '@ngx-translate/core';
import {Events, CalendarEvent, Notes} from '../../types/events';
import {EventListComponent} from "./event-list/event-list.component";
import {DatePickerModule} from 'primeng/datepicker';
import {CalendarComponent} from './calendar/calendar.component';
import {ApiService} from '../service/api.service';
import {forkJoin, Observable} from 'rxjs';
import {stringToDate} from '../../utils/timeConverter';

@Component({
  selector: 'app-home',
  imports: [PanelModule, SkeletonModule, ButtonModule, TranslatePipe, EventListComponent, CalendarComponent], // calendar
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  recentNotes: Notes = []

  constructor(protected readonly sessionService: SessionService, private readonly apiService: ApiService) {
  }

  ngOnInit() {
    forkJoin([
      this.apiService.getEvents(this.sessionService.getSession()!.user.username!, this.sessionService.getSession()!.token!),
      this.apiService.getRecentNotes(this.sessionService.getSession()!.user.username!, this.sessionService.getSession()!.token!)
    ]).subscribe({
      next: (response) => {
        this.recentNotes.push(...response[1].map(it => ({
          ...it,
          lastEdit: stringToDate(it.lastEdit.toString())
        })))
        this.deadlineEvents.push(...response[0]
          .filter(it => it.end !== undefined)
          .map(it => ({ ...it, end: stringToDate(it.end!.toString()) }))
        );
        this.todayEvents = this.deadlineEvents.filter(event => {
          const format = (date: Date) => `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
          return event.end instanceof Date && format(event.end) === format(new Date());
        });
      },
      error: (error) => {
        console.log(error)
      },
    })
  }

deadlineEvents: CalendarEvent[] = [];
todayEvents: CalendarEvent[] = [];


/*
  
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

  deadlineEvents: Events = []



  loading = false

*/
}
