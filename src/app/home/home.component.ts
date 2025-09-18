import { ChangeDetectorRef, Component, effect } from '@angular/core';
import { SessionService } from '../service/session.service';
import { SkeletonModule } from 'primeng/skeleton';
import { PanelModule } from 'primeng/panel';
import { ButtonModule } from 'primeng/button';
import { TranslatePipe } from '@ngx-translate/core';
import { Events, Notes, CalendarEvent } from '../../types/events';
import { EventListComponent } from './event-list/event-list.component';
import { CalendarComponent } from './calendar/calendar.component';
import { ApiService } from '../service/api.service';
import { forkJoin } from 'rxjs';
import { stringToDate } from '../../utils/timeConverter';
import { TimeMachineService } from '../service/time-machine.service';
import { NotificationService } from '../service/notification.service';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Dialog } from 'primeng/dialog';
import { StudyPlan } from '../../types/pomodoro';
import { KnobModule } from 'primeng/knob';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Knob } from 'primeng/knob';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';


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
    KnobModule,
    CommonModule,
    FormsModule,
    Knob,
    RouterModule,
    CardModule
  ],
  providers: [DialogService],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
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
    private readonly cd: ChangeDetectorRef,
    router: Router
  ) {
    effect(() => {
      const today = timeMachine.today();
      if (!today) return;
      this.loadPlan(today);

      this.todayEvents = [
      ];

      this.todayEvents.forEach((it) => {
        this.showNotification(it)
      });
    });

    this.todayEvents = [];
  }

isNotificationVisible = false
  showNotification(event: CalendarEvent, delay?: number){

    setTimeout(() => {
      const options = { body: `Scade oggi ${event.title ?? ''}` }; //non ha desccription

      this.notificationService.showNotification(
        event.title,
        () => {
          window.focus();
          this.notificationDialog = {
            title: event.title,
            //description: event.description,
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
      this.apiService.getEvents(this.sessionService.getSession()!.user.username!, this.sessionService.getSession()!.token!),
      this.apiService.getRecentNotes(this.sessionService.getSession()!.user.username!, this.sessionService.getSession()!.token!)
    ]).subscribe({
      next: (response) => {
        this.recentNotes.push(
          ...response[1].map((it) => ({
          ...it,
          lastEdit: stringToDate(it.lastEdit.toString())
        }))
        )
        console.log(this.recentNotes);

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
        console.log(error);
      },
    });
    this.loadPlan(null);
  }

  planDone: number=0;
  fullPlans: StudyPlan[]=[];
  todayPlan: StudyPlan = {
    settings: {  pomodoroNumber: 0,
                pomodoroType: "",
                pomodoroDuration: 0,
                shortBreakDuration: 0,
                longBreakDuration: 0,
                longBreakInterval: 0,
                id: ""
              },
    plan: [],
    totalTime: 0,
    days: []
  };
  planToDo: boolean=false;
  
  loadPlan(ifToday: any) {
    this.apiService
      .getStudyPlans(
        this.sessionService.getSession()!.user.username!,
        this.sessionService.getSession()!.token!
      )
      .subscribe({
        next: (response) => {
          this.fullPlans = response as StudyPlan[];
          let today=new Date;
          if(ifToday) {today=ifToday;}
          else {today = this.timeMachine.today() as Date;}
          
          if (!today) return;
          today.setHours(0, 0, 0, 0);
  
          const normalizeDate = (d: Date): number => {
            const date = new Date(d);
            date.setHours(0, 0, 0, 0);
            return date.getTime();
          };
  
          const matchingPlan = this.fullPlans.find((plan) =>
            plan.days.some((d) => normalizeDate(d.day) === today.getTime())
          );
  
          if (matchingPlan) {
            const dayIndex = matchingPlan.days.findIndex(
            (d) => normalizeDate(d.day) === today.getTime()
            );
            
              this.todayPlan = matchingPlan;
              const completedStepIndex = this.todayPlan.days[dayIndex].step;
              if (completedStepIndex < 0) return;

              // somma le durate degli step completati
              const doneMinutes = this.todayPlan.plan
                .slice(0, completedStepIndex + 1)
                .reduce((sum, step) => sum + step.duration, 0);

              // percentuale rispetto al totale
              this.planDone= Math.round((doneMinutes / this.todayPlan.totalTime) * 100);
              this.planToDo=true;
            

          } else {
            //NON ho un piano per oggi
            this.planToDo=false;
          }
        },
        error: (err) => console.error("Errore nel caricamento piani:", err),
      });
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
