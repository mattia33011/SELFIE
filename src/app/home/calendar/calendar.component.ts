import {AfterViewInit, Component, EventEmitter, OnInit, Output, ViewChild, effect,} from '@angular/core';
import { FullCalendarModule } from '@fullcalendar/angular';
import { FullCalendarComponent } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import ListWeekPlugin from '@fullcalendar/list';
import TimeGridPlugin from '@fullcalendar/timegrid';
import { PanelModule } from 'primeng/panel';
import interactionPlugin from '@fullcalendar/interaction';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import rrulePlugin from '@fullcalendar/rrule';
import { DatePickerModule } from 'primeng/datepicker';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { SelectButton } from 'primeng/selectbutton';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ColorPickerModule } from 'primeng/colorpicker';
import { InputTextModule } from 'primeng/inputtext';
import { IftaLabelModule } from 'primeng/iftalabel';
import { CheckboxModule } from 'primeng/checkbox';
import { ChangeDetectorRef } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { TimeMachineService } from '../../service/time-machine.service';
import { ApiService } from '../../service/api.service';
import { SessionService } from '../../service/session.service';
import { StudyPlan } from '../../../types/pomodoro';
import { Router } from '@angular/router';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [
    FullCalendarModule,
    PanelModule,
    FormsModule,
    CommonModule,
    DialogModule,
    ButtonModule,
    DatePickerModule,
    TranslatePipe,
    SelectButton,
    FloatLabelModule,
    ColorPickerModule,
    InputTextModule,
    IftaLabelModule,
    CheckboxModule,
  ],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.css',
})
export class CalendarComponent implements OnInit, AfterViewInit {
  @ViewChild('fullcalendar') calendarComponent!: FullCalendarComponent;

  today = new Date();
  eventName: string = ''; // nome evento
  theDate: Date | null = null; // data
  eventEndDate: Date | null = null; //data fine
  repeatUntil: Date | null = null; // ripeti fino a
  eventTime: Date | null = null; // ora evento
  eventEndTime: Date | null = null; // ora fine evento
  eventColor: string = '#99ff63'; // colore evento
  eventLocation: string = ''; // luogo evento
  repeatWeekly: boolean = false; // ripeti settimanalmente
  isTask: boolean = false; // è attività
  taskStatus: string = 'da_fare'; // status
  visible: boolean = false; // popup
  repeatType: string = ''; // type repeat
  repeatInterval: number = 1; // ogni n settimane
  repeatWeekDays: string[] = [];
  weekDays = [
    { label: 'Lunedì', value: 'MO' },
    { label: 'Martedì', value: 'TU' },
    { label: 'Mercoledì', value: 'WE' },
    { label: 'Giovedì', value: 'TH' },
    { label: 'Venerdì', value: 'FR' },
    { label: 'Sabato', value: 'SA' },
    { label: 'Domenica', value: 'SU' },
  ];

  @Output() refetchEvent: EventEmitter<any> = new EventEmitter();

  calendarOptions: CalendarOptions = {
    selectable: true,
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay prev,next',
    },
    buttonText: {
      dayGridMonth: window.innerWidth < 768 ? 'M' : 'Mese',
      timeGridWeek: window.innerWidth < 768 ? 'W' : 'Settimana',
      timeGridDay: window.innerWidth < 768 ? 'D' : 'Giorno',
    },
    dayMaxEvents: 2, //max eventi poi viene un popover
    contentHeight: window.innerWidth < 768 ? 400 : 700, // altezza calendario (se piccola va a 400 se grande 700)
    locale: ['it'],
    plugins: [dayGridPlugin, ListWeekPlugin, TimeGridPlugin, interactionPlugin, rrulePlugin,],
    dateClick: this.openPopup.bind(this),
    events: [], // Inizia vuota
    eventClick: this.handleEventClick.bind(this),

    eventDidMount: (info) => {
      if (!info.event.allDay)
        info.el.style.backgroundColor = info.event.backgroundColor;
    },
    dayCellDidMount: (info) => {
      const cellDate = info.date;

      // normalizza la data (rimuove ore, minuti, secondi)
      const normalizeDate = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
      };

      const normalizedCellDate = normalizeDate(cellDate);

      // controlla se ci sono piani di studio per questa data
      const hasPlan =
        this.fullPlans &&
        this.fullPlans.some((plan) =>
          plan.days.some((planDay) => {
            const planDate = new Date(planDay.day);
            const normalizedPlanDate = normalizeDate(planDate);
            return (
              normalizedPlanDate.getTime() === normalizedCellDate.getTime()
            );
          })
        );

      if (hasPlan) {
        const button = document.createElement('button');
        button.type = 'button';
        button.innerHTML = '<i class="pi pi-stopwatch"></i>';
        button.classList.add('study-session-button');
        button.title = 'Sessione di studio programmata';

        // stile inline per posizionamento
        button.style.position = 'absolute';
        button.style.bottom = '4px';
        button.style.right = '4px';
        button.style.padding = '2px';
        button.style.fontSize = '1.2rem';

        info.el.style.position = 'relative';
        info.el.appendChild(button);
      }
    },
  };

  fullPlans: StudyPlan[] = [];

  hasStudyPlanOn(date: Date): boolean {
    if (!this.fullPlans) return false;
    const normalize = (d: Date) =>
      new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    return this.fullPlans.some((plan) =>
      plan.days.some((day) => normalize(day.day) === normalize(date))
    );
  }

  loadPlan(ifToday: any) {
    this.apiService
      .getStudyPlans(
        this.sessionService.getSession()!.user.username!,
        this.sessionService.getSession()!.token!
      )
      .subscribe({
        next: (response) => {
          this.fullPlans = response as StudyPlan[];

          let today = new Date();
          if (ifToday) {
            today = ifToday;
          } else {
            today = this.timeMachine.today() as Date;
          }
          this.updateStudyIcons();
          this.calendarComponent.getApi().render();
        },
        error: (err) => {
          console.error('Errore nel caricamento piani:', err);
        },
      });
  }

  updateStudyIcons() {
    if (!this.calendarComponent || !this.fullPlans) return;
    const allCells = document.querySelectorAll('.fc-daygrid-day'); // tutte le celle giorno

    allCells.forEach((cell: any) => {
      const cellDateStr = cell.getAttribute('data-date');
      if (!cellDateStr) return;
      const cellDate = new Date(cellDateStr);

      const normalize = (d: Date) =>
        new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
      const hasPlan = this.fullPlans.some((plan) =>
        plan.days.some(
          (day) => normalize(new Date(day.day)) === normalize(cellDate)
        )
      );

      if (hasPlan && !cell.querySelector('.study-session-button')) {
        const button = document.createElement('button');
        button.type = 'button';
        button.innerHTML = '<i class="pi pi-stopwatch"></i>';
        button.classList.add('study-session-button');
        button.title = 'Sessione di studio programmata';
        button.style.position = 'absolute';
        button.style.bottom = '4px';
        button.style.right = '4px';
        button.style.fontSize = '1.2rem';

        cell.style.position = 'relative';
        cell.appendChild(button);
      }
    });
  }

  taskStatuses: any[] = [];
  repeatOptions: any[] = [];
  constructor(
    private translate: TranslateService,
    protected readonly timeMachine: TimeMachineService,
    private readonly apiService: ApiService,
    private readonly translateService: TranslateService,
    private readonly sessionService: SessionService
  ) {
    effect(() => {
      const date = timeMachine.today();
      if (!date) return;
      this.loadPlan(date);

      const dateString = `${date.getFullYear()}-${
        date.getMonth() + 1 <= 9
          ? `0${date.getMonth() + 1}`
          : date.getMonth() + 1
      }-${date.getDate() <= 9 ? `0${date.getDate()}` : date.getDate()}`;
      this.calendarComponent?.getApi().gotoDate(dateString);
    });
  }

  ngAfterViewInit() {
    // Forza un primo render
    setTimeout(() => {
      if (this.calendarComponent) {
        this.updateStudyIcons();
      }
    }, 100);
    this.calendarComponent?.getApi().render();
    const date = this.timeMachine.today();
    if (!date) return;
    const dateString = `${date.getFullYear()}-${
      date.getMonth() + 1 <= 9 ? `0${date.getMonth() + 1}` : date.getMonth() + 1
    }-${date.getDate() <= 9 ? `0${date.getDate()}` : date.getDate()}`;
    this.calendarComponent?.getApi().gotoDate(dateString);
  }

  ngOnInit() {
    this.apiService
      .getEvents(
        this.sessionService.getSession()!.user.username!,
        this.sessionService.getSession()!.token!
      )
      .subscribe({
        next: (events) => {
          this.calendarOptions.events = events.map((event) => ({
            ...event,
            start: event.start,
            end: event.end,
            id: event._id,
            color: event.color,
          }));
        },
        error: (err) => {
          console.error('Errore nel caricamento eventi', err);
        },
      });
    this.translate
      .get([
        'event.none',
        'event.daily',
        'event.weekly',
        'event.biweekly',
        'event.monthly',
        'event.yearly',
      ])
      .subscribe((translations) => {
        this.repeatOptions = [
          { label: translations['event.none'], value: '' },
          { label: translations['event.daily'], value: 'daily' },
          { label: translations['event.weekly'], value: 'weekly' },
          { label: translations['event.biweekly'], value: 'biweekly' },
          { label: translations['event.monthly'], value: 'monthly' },
          { label: translations['event.yearly'], value: 'yearly' },
        ];
        this.translate
          .get([
            'taskStatus.da_fare',
            'taskStatus.in_corso',
            'taskStatus.completata',
          ])
          .subscribe((translations) => {
            this.taskStatuses = [
              { label: translations['taskStatus.da_fare'], value: 'da_fare' },
              { label: translations['taskStatus.in_corso'], value: 'in_corso' },
              { label: translations['taskStatus.completata'], value: 'completata' },
            ];
          });
        this.translate
          .get([
            'day.mon',
            'day.tue',
            'day.wed',
            'day.thurs',
            'day.fri',
            'day.sat',
            'day.sun',
          ])
          .subscribe((translations) => {
            this.weekDays = [
              { label: translations['day.mon'], value: 'MO' },
              { label: translations['day.tue'], value: 'TU' },
              { label: translations['day.wed'], value: 'WE' },
              { label: translations['day.thurs'], value: 'TH' },
              { label: translations['day.fri'], value: 'FR' },
              { label: translations['day.sat'], value: 'SA' },
              { label: translations['day.sun'], value: 'SU' },
            ];
          });
      });
    this.loadPlan(null);
    this.calendarComponent?.getApi().render();
  }

  // per popup parte rrule (selezione giorni settimana)
  toggleWeekday(event: any, value: string) {
    if (event.checked) {
      if (!this.repeatWeekDays.includes(value)) {
        this.repeatWeekDays.push(value);
      }
    } else {
      this.repeatWeekDays = this.repeatWeekDays.filter((d) => d !== value);
    }
  }

  selectedEvent: any = null;

  openPopup(arg: any) {
    this.resetForm();
    this.theDate = arg.date; // preimposta nel popup la data selezionata
    this.visible = true; // mostra il form
  }

  // Funzione per aggiungere un evento
  addEvent() {
    if (!this.eventName.trim()) {
      alert("Inserisci un nome per l'evento");
      return;
    }
    if (!this.theDate) {
      alert("Seleziona una data per l'evento");
      return;
    }

    const isAllDay = this.isTask || !this.eventTime;
    
    const startDateTime = this.theDate;

    const newEvent: any = {
      title: this.eventName,
      color: this.eventColor,
      extendedProps: {
        luogo: this.eventLocation,
        tipo: this.isTask ? 'attività' : 'evento',
        stato: this.isTask ? this.taskStatus : undefined
      },
      allDay: isAllDay,
    };

    const freqMap: any = {
      daily: 'DAILY',
      weekly: 'WEEKLY',
      biweekly: 'WEEKLY',
      monthly: 'MONTHLY',
      yearly: 'YEARLY',
    };

    // Se evento e ha ripetizione
    if (!this.isTask && this.repeatType && freqMap[this.repeatType]) {
      newEvent.rrule = {
        freq: freqMap[this.repeatType],
        dtstart: startDateTime,
        interval: this.repeatType === 'biweekly' ? 2 : this.repeatInterval || 1,
        until: this.repeatUntil || undefined,
        byweekday: this.repeatWeekDays.length ? this.repeatWeekDays : undefined,
      };

      if (!isAllDay && this.eventTime && this.eventEndTime) { //per rrule serve string duration per calcolo orario
        newEvent.duration = this.getDuration(this.eventTime, this.eventEndTime);
      }
    } else {
      // Eventi singoli o attività
      newEvent.start = startDateTime;

      if (this.eventTime) {
        startDateTime.setHours(this.eventTime.getHours());
        startDateTime.setMinutes(this.eventTime.getMinutes());
        newEvent.start = startDateTime;
      }
      if (this.eventEndDate) {
        newEvent.end = new Date(this.eventEndDate);
      }
      if (this.eventEndTime) {
        const end = new Date();

        end.setDate(startDateTime.getDate());
        end.setMonth(startDateTime.getMonth());
        end.setFullYear(startDateTime.getFullYear());
        end.setHours(this.eventEndTime.getHours());
        end.setMinutes(this.eventEndTime.getMinutes());
        newEvent.end = end;
      }
      if (this.eventEndDate && this.eventEndTime) {
        const end = this.eventEndDate;
        end.setHours(this.eventEndTime.getHours());
        end.setMinutes(this.eventEndTime.getMinutes());
        newEvent.end = end;
      }
    }
    // chiamata al backend per salvare l'evento
    const username = this.sessionService.getSession()!.user.username!;
    const token = this.sessionService.getSession()!.token!;

    this.apiService.createEvent(username, newEvent, token).subscribe({
      next: (savedEvent: any) => {
        const calendarApi = this.calendarComponent?.getApi();
        const event = {
          ...newEvent,
          id: savedEvent._id,
          start: newEvent.start,
          end: newEvent.end,
        }
        this.calendarOptions.events = [
          ...(this.calendarOptions.events as any[]),
          event,
        ];

        calendarApi.addEvent(event);
        this.resetForm();
        this.refetchEvent.emit();
      },
      error: (err) => {
        console.error("Errore durante il salvataggio dell'evento", err);
      },
    });
  }

  handleEventClick(clickInfo: any) {
    const event = clickInfo.event;

    this.selectedEvent = event;

    this.eventName = event.title || '';
    this.eventLocation = event.extendedProps?.luogo || '';
    this.isTask = event.extendedProps?.tipo === 'attività';
    this.taskStatus = event.extendedProps?.stato || 'da_fare';
    this.eventColor = event.backgroundColor || '#99ff63';

    const start = event.start ? new Date(event.start) : null;
    const end = event.end ? new Date(event.end) : null;
    

    this.theDate = start;
    if (start && start.getMinutes() > 0 && start.getHours() > 0)
      this.eventTime = start;
    else this.eventTime = null;

    this.eventEndDate = end;
    if (end && end.getMinutes() > 0 && end.getHours() > 0)
      this.eventEndTime = end;
    else this.eventEndTime = null;

    const plainEvent = event.toPlainObject(); //ricava plain json
    const rrule = (this.calendarOptions.events as any[]).find(
      (it) => it.id == plainEvent.id
    )?.rrule;

    if (rrule) {
      this.repeatType = this.getRepeatTypeFromRRule(rrule);
      this.repeatUntil = rrule.until ? new Date(rrule.until) : null;
      this.repeatInterval = rrule.interval || 1;
      this.repeatWeekDays = rrule.byweekday || [];
    } else {
      this.repeatType = '';
      this.repeatUntil = null;
      this.repeatWeekDays = [];
    }

    this.visible = true;
  }

  getRepeatTypeFromRRule(rrule: any): string {
    if (rrule.freq === 'WEEKLY' && rrule.interval === 2) return 'biweekly';
    const freqMap = {
      DAILY: 'daily',
      WEEKLY: 'weekly',
      MONTHLY: 'monthly',
      YEARLY: 'yearly',
    };
    return (
      freqMap[rrule.freq as 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'] || ''
    );
  }

  // Parte per la modifica degli eventi
  updateEvent() {
    if (!this.selectedEvent) return;

    const calendarApi = this.calendarComponent?.getApi();
    const idd = this.selectedEvent.id;
    this.selectedEvent.remove();

    if (!this.theDate) {
      alert('Inserisci una data valida');
      return;
    }

    const isAllDay = this.isTask || !this.eventTime;

    const startDate = this.theDate;
    let endDate: Date | null = this.eventEndDate;

    let newEvent: any = {
      title: this.eventName,
      color: this.eventColor,
      extendedProps: {
        luogo: this.eventLocation,
        tipo: this.isTask ? 'attività' : 'evento',
        stato: this.isTask ? this.taskStatus : undefined
      },
      allDay: isAllDay,
    };
    if (this.isTask) {
      newEvent.start = startDate;
    } else if(!this.isTask && this.repeatType && this.repeatType !== 'none') {
      const freqMap: any = {
        daily: 'DAILY',
        weekly: 'WEEKLY',
        biweekly: 'WEEKLY',
        monthly: 'MONTHLY',
        yearly: 'YEARLY',
      };

      newEvent.rrule = {
        freq: freqMap[this.repeatType],
        dtstart: startDate,
        interval: this.repeatInterval || 1,
        until: this.repeatUntil || undefined,
        byweekday: this.repeatWeekDays.length ? this.repeatWeekDays : undefined,
      };

      if (!isAllDay && this.eventTime && this.eventEndTime) {
        newEvent.duration = this.getDuration(this.eventTime, this.eventEndTime);
      }
      
    } else {
      const start = new Date(this.theDate);
      if (!isAllDay && this.eventTime) {
        if (this.eventTime) {
          start.setHours(this.eventTime.getHours());
          start.setMinutes(this.eventTime.getMinutes());
        }
        newEvent.start = start;
      }

      if (!this.isTask) {
        if (!endDate) endDate = start;
        if (!isAllDay && this.eventEndTime) {
          if (this.eventEndTime) {
            endDate.setHours(this.eventEndTime.getHours());
            endDate.setMinutes(this.eventEndTime.getMinutes());
          }
          newEvent.end = new Date(endDate);
        }
      }
    }

    this.apiService
      .updateEvent(
        this.sessionService.getSession()!.user.username!,
        idd,
        newEvent,
        this.sessionService.getSession()!.token!
      )
      .subscribe({
        next: (_: any) => {

          const event: any = {
            ...newEvent,
            eventColor: newEvent.color,
            id: idd,
             extendedProps: {
              ...newEvent.extendedProps
            }
          };
          calendarApi.addEvent(event);

          this.resetForm();
        },
        error: (err) => {
          console.error('Errore durante aggiornamento evento', err);
          alert('Errore durante aggiornamento evento');
        },
      });
  }

  // Elimina evento
  deleteEvent() {
    if (this.selectedEvent) {
      if (confirm('Sei sicuro di voler eliminare questo evento?')) {

        const eventId = this.selectedEvent.id;
        const userId = this.sessionService.getSession()!.user.username!;
        const token = this.sessionService.getSession()!.token!;

        this.apiService.deleteEvent(userId, eventId, token).subscribe({
          next: () => {
            this.selectedEvent!.remove();
            this.resetForm();
          },
          error: (err) => {
            console.error('Errore durante eliminazione evento', err);
            alert('Errore durante eliminazione evento');
          },
        });
      }
    }
  }

  getDuration(startTime: Date, endTime: Date): string {
    const diffMillisec = endTime.getTime() - startTime.getTime();
    if (diffMillisec <= 0) {
      return '00:00';
    }

    const diffMins = Math.floor(diffMillisec / (1000*60));
    const hours = Math.floor(diffMins / 60);
    const minutes = (diffMins % 60);  

    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}`;
  }

  // Intervallo e auto selezione giorno settimana
  onRepeatTypeChange() {
    this.repeatUntil = null;
    this.repeatWeekDays = [];

    if (this.repeatType === 'biweekly') {
      this.repeatInterval = 2;
      this.autoWeekdayFromDate();
    } else if (this.repeatType === 'weekly') {
      this.repeatInterval = 1;
      this.autoWeekdayFromDate();
    }
  }
  autoWeekdayFromDate() {
    if (!this.theDate) return;

    const dayIndex = new Date(this.theDate).getDay();
    const weekdayValues = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
    this.repeatWeekDays = [weekdayValues[dayIndex]];
  }

  // Funzione per resettare i campi
  resetForm() {
    this.eventName = '';
    this.eventTime = null;
    this.eventEndTime = null;
    this.eventEndDate = null;
    this.theDate = null;
    this.repeatWeekly = false;
    this.eventLocation = '';
    this.visible = false;
    this.eventColor = '#99ff63';
    this.repeatType = '';
    this.repeatUntil = null;
    this.repeatInterval = 1;
    this.repeatWeekDays = [];
    this.selectedEvent = null;
    this.isTask = false;
    this.taskStatus = 'da_fare';
  }
  // reset campi per non rilevanti per attività
  onIsTaskChange() {
    if (this.isTask) {
      this.eventTime = null;
      this.eventEndTime = null;
      this.eventLocation = '';
      this.repeatType = '';
      this.repeatUntil = null;
      this.repeatWeekDays = [];
    }
  }

  // link a maps
  generateLink(place: string) {
    return `https://www.google.com/maps/search/?api=1&query=${place.replace(
      ' ',
      '+'
    )}`;
  }
}
