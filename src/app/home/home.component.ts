import { ChangeDetectorRef, Component, effect } from '@angular/core';
import { SessionService } from '../service/session.service';
import { SkeletonModule } from 'primeng/skeleton';
import { PanelModule } from 'primeng/panel';
import { ButtonModule } from 'primeng/button';
import { TranslatePipe } from '@ngx-translate/core';
import { Event, Events, Notes } from '../../types/events';
import { EventListComponent } from './event-list/event-list.component';
import { CalendarComponent } from './calendar/calendar.component';
import { ApiService } from '../service/api.service';
import { forkJoin } from 'rxjs';
import { stringToDate } from '../../utils/timeConverter';
import { TimeMachineService } from '../service/time-machine.service';
import { NotificationService } from '../service/notification.service';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Dialog } from 'primeng/dialog';

@Component({
  selector: 'app-home',
  imports: [
    PanelModule,
    SkeletonModule,
    ButtonModule,
    TranslatePipe,
    EventListComponent,
    CalendarComponent,
    Dialog,
  ],
  providers: [DialogService],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  recentNotes: Notes = [];
  ref: DynamicDialogRef | undefined;
  notificationDialog?: {
    title: string;
    description?: string;
    onclose: () => void;
    onsnooze: () => void
  };

  constructor(
    protected readonly sessionService: SessionService,
    private readonly apiService: ApiService,
    private readonly timeMachine: TimeMachineService,
    private readonly notificationService: NotificationService,
    private readonly cd: ChangeDetectorRef
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

      this.todayEvents.forEach((it) => {
        this.showNotification(it)
      });
    });
    this.todayEvents = [];
  }

isNotificationVisible = false
  showNotification(event: Event, delay?: number){

    setTimeout(() => {
      const options = { body: `Scade oggi ${event.description ?? ''}` };

      this.notificationService.showNotification(
        event.title,
        () => {
          window.focus();
          this.notificationDialog = {
            title: event.title,
            description: event.description,
            onclose: () => (this.notificationDialog = undefined),
            onsnooze: () => {
              this.notificationDialog = undefined
              this.isNotificationVisible = false
              this.showNotification(event, 5 * 60 * 1000)
            }
          };
          this.isNotificationVisible = true
          this.cd.detectChanges();
        },
        options
      );
    }, delay ?? 1000);
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
        console.log(this.recentNotes);

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
