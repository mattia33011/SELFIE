import { ChangeDetectorRef, Component, effect } from '@angular/core';
import { SessionService } from '../service/session.service';
import { SkeletonModule } from 'primeng/skeleton';
import { PanelModule } from 'primeng/panel';
import { ButtonModule } from 'primeng/button';
import { TranslatePipe } from '@ngx-translate/core';
import { Events, Notes } from '../../types/events';
import { EventListComponent } from './event-list/event-list.component';
import { DatePickerModule } from 'primeng/datepicker';
import { CalendarComponent } from './calendar/calendar.component';
import { ApiService } from '../service/api.service';
import { forkJoin, Observable } from 'rxjs';
import { stringToDate } from '../../utils/timeConverter';
import { TimeMachineService } from '../service/time-machine.service';

@Component({
  selector: 'app-home',
  imports: [
    PanelModule,
    SkeletonModule,
    ButtonModule,
    TranslatePipe,
    EventListComponent,
    CalendarComponent,
  ], // calendar
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  recentNotes: Notes = [];

  constructor(
    protected readonly sessionService: SessionService,
    private readonly apiService: ApiService,
    private readonly timeMachine: TimeMachineService
  ) {
    effect(() => {
      const today = timeMachine.today();
      if (!today) return;

      this.todayEvents = [
        {
          title: 'Palestra',
          description: 'FitActive Creti',
          expireDate: today,
        },
        {
          title: 'TW Laboratorio',
          description: 'Laboratorio Ercolani Seminterrato',
          expireDate: today,
          color: 'help',
        },
        {
          title: 'Calcolo numerico',
          description: 'Aula Ercolani 1',
          expireDate: today,
          color: 'danger',
        },
        {
          title: "Tiro con l'arco",
          expireDate: today,
          color: 'info',
        },
        {
          title: 'TW Laboratorio',
          expireDate: today,
          color: 'warn',
        },
      ];
    });
    this.todayEvents = [];
  }

  ngOnInit() {
    forkJoin([
      this.apiService.getEvents(
        this.sessionService.getSession()!.user.username!,
        this.sessionService.getSession()!.token!
      ),
      this.apiService.getRecentNotes(
        this.sessionService.getSession()!.user.username!,
        this.sessionService.getSession()!.token!
      ),
    ]).subscribe({
      next: (response) => {
        this.recentNotes.push(
          ...response[1].map((it) => ({
            ...it,
            lastEdit: stringToDate(it.lastEdit.toString()),
          }))
        );
        this.deadlineEvents.push(
          ...response[0].map((it) => ({
            ...it,
            expireDate: stringToDate(it.expireDate.toString()),
          }))
        );
        this.todayEvents = this.deadlineEvents.filter((event) => {
          const format = (date: Date) =>
            `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
          return format(event.expireDate) == format(this.timeMachine.today()!);
        });
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  todayEvents: Events;

  deadlineEvents: Events = [];

  loading = false;
}
