import { AfterViewInit, Component, OnInit, ViewChild, effect } from '@angular/core';
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
import { CheckboxModule } from 'primeng/checkbox'; // Importa il modulo Checkbox
import {ChangeDetectorRef} from '@angular/core';
import {forkJoin, Observable} from 'rxjs';
import { TimeMachineService } from '../../service/time-machine.service';
import { ApiService } from '../../service/api.service';
import { SessionService } from '../../service/session.service';
import { StudyPlan } from '../../../types/pomodoro';
//import { RouterOutlet } from '@angular/router';

// COMANDO npm install @fullcalendar/rrule rrule


// manca ripeti tutti i primi lunedì del mese (?)
// traduzione in ing SOLO per il calendario (mesi, mese settimana anno, abbreviazioni della settimana nel calendario ecc) (eventi apposto)


@Component({
  selector: 'app-calendar',
  standalone: true, //standalone
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
  ], //standalone
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.css',
})
export class CalendarComponent implements OnInit, AfterViewInit{
  @ViewChild('fullcalendar') calendarComponent!: FullCalendarComponent; // Riferimento al calendario

  today = new Date()
  eventName: string = ''; // nome evento
  theDate: Date | null = null;
  eventEndDate: Date | null = null;
  repeatUntil: Date | null = null;
  eventTime: Date | null = null; // ora evento
  eventEndTime: Date | null = null; // ora fine evento
  eventColor: string = '#99ff63'; // colore evento
  eventLocation: string = ''; // luogo evento
  repeatWeekly: boolean = false;
  isTask: boolean = false;
  taskStatus: string = 'da_fare';
  visible: boolean = false;
  repeatType: string = ''; // 'none', 'daily', 'weekly', 'monthly', // 'custom'
  repeatInterval: number = 1; // ogni tot giorni/settimane/mesi
  // repeatCount: number = 1; // per "Ripeti per N volte"
  repeatWeekDays: string[] = []; // es: ['mo', 'we', 'fr']
  weekDays = [ 
    //così che rrule lo accetti
    { label: 'Lunedì', value: 'MO' },
    { label: 'Martedì', value: 'TU' },
    { label: 'Mercoledì', value: 'WE' },
    { label: 'Giovedì', value: 'TH' },
    { label: 'Venerdì', value: 'FR' },
    { label: 'Sabato', value: 'SA' },
    { label: 'Domenica', value: 'SU' },
  ];
    
  calendarOptions: CalendarOptions = {
    selectable: true,
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay prev,next' // posso anche aggiungere listWeek per vedere eventi tipo lista
    },
    buttonText: {
      dayGridMonth: window.innerWidth < 768 ? '📅' : 'Mese', //si può cambiare al posto dell'emoji!!!
      timeGridWeek: window.innerWidth < 768 ? '📆' : 'Settimana',
      timeGridDay: window.innerWidth < 768 ? '🕒' : 'Giorno',
    },
    dayMaxEvents: 2, //max eventi poi viene un popover
    contentHeight: window.innerWidth < 768 ? 400 : 700, // Altezza calendario (se piccola va a 350 se grande 700)
    locale: ['it'],
    plugins: [dayGridPlugin, ListWeekPlugin, TimeGridPlugin, interactionPlugin, rrulePlugin],
    dateClick: this.openPopup.bind(this), //bind this perché altrimenti "non tiene il this"
    events: [], // Inizialmente vuoto
    
    eventClick: this.handleEventClick.bind(this),

    dayCellDidMount: (info) => {
        const cellDate = info.date;
        
        // Normalizza la data (rimuove ore, minuti, secondi)
        const normalizeDate = (date: Date) => {
          return new Date(date.getFullYear(), date.getMonth(), date.getDate());
        };
        
        const normalizedCellDate = normalizeDate(cellDate);
        
        // Controlla se ci sono piani di studio per questa data
        const hasPlan = this.fullPlans && this.fullPlans.some(plan => 
          plan.days.some(planDay => {
            const planDate = new Date(planDay.day);
            const normalizedPlanDate = normalizeDate(planDate);
            return normalizedPlanDate.getTime() === normalizedCellDate.getTime();
          })
        );
        
        if (hasPlan) {
          const button = document.createElement('button');
          button.type = 'button';
          button.innerHTML = '<i class="pi pi-stopwatch"></i>';
          button.classList.add('study-session-button');
          button.title = 'Sessione di studio programmata';

          // Stile inline per posizionamento (puoi spostarlo in CSS)
          button.style.position = 'absolute';
          button.style.bottom = '4px';
          button.style.right = '4px';
          button.style.padding = '2px';
          button.style.fontSize = '1.2rem';

          info.el.style.position = 'relative'; // necessario per il posizionamento assoluto
          info.el.appendChild(button);
        }
      }
 };

 fullPlans: StudyPlan[]=[];

  hasStudyPlanOn(date: Date): boolean {
    if (!this.fullPlans) return false;
    const normalize = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    return this.fullPlans.some(plan =>
      plan.days.some(day => normalize(day.day) === normalize(date))
    );
  }


  loadPlan() {
    this.apiService
      .getStudyPlans(
        this.sessionService.getSession()!.user.username!,
        this.sessionService.getSession()!.token!
      )
      .subscribe({
        next: (response) => {
          this.fullPlans = response as StudyPlan[];

          this.updateStudyIcons();

        },
        error: (err) => {
          console.error("Errore nel caricamento piani:", err);
          
        }
      });
      
  }

  updateStudyIcons() {
  if (!this.calendarComponent || !this.fullPlans) return;

  const allCells = document.querySelectorAll('.fc-daygrid-day'); // tutte le celle giorno

  allCells.forEach((cell: any) => {
    const cellDateStr = cell.getAttribute('data-date');
    if (!cellDateStr) return;
    const cellDate = new Date(cellDateStr);

    const normalize = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const hasPlan = this.fullPlans.some(plan =>
      plan.days.some(day => normalize(new Date(day.day)) === normalize(cellDate))
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

      const dateString = `${date.getFullYear()}-${
        date.getMonth() + 1 <= 9
          ? `0${date.getMonth() + 1}`
          : date.getMonth() + 1
      }-${date.getDate() <= 9 ? `0${date.getDate()}` : date.getDate()}`;
      this.calendarComponent.getApi().gotoDate(dateString);
    });
  }
ngAfterViewInit() {
    
    // Forza un primo render
    setTimeout(() => {
      if (this.calendarComponent) {
        this.calendarComponent.getApi().render();
      }
    }, 100);
  }

  ngOnInit() {
  this.apiService.getEvents(
      this.sessionService.getSession()!.user.username!,
      this.sessionService.getSession()!.token!
    ).subscribe({
      next: (events) => {
        this.calendarOptions.events = events.map(event => ({
          ...event,
          start: event.start,
          end: event.end,
          id: event._id
        }));
      },
      error: (err) => {
        console.error('Errore nel caricamento eventi', err);
      }
    });
    this.translate.get([
      'event.none',
      'event.daily',
      'event.weekly',
      'event.biweekly',
      'event.monthly',
      'event.yearly'
    ]).subscribe(translations => {
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
      'taskStatus.completata'
    ])
          .subscribe((translations) => {
      this.taskStatuses = [
          { label: this.translate.instant('taskStatus.da_fare'), value: 'da_fare' },
          { label: this.translate.instant('taskStatus.in_corso'), value: 'in_corso' },
          { label: this.translate.instant('taskStatus.completata'), value: 'completata' }
      ];
    });
  });
  this.loadPlan();
  }


  toggleWeekday(event: any, value: string) {
  if (event.checked) {
    if (!this.repeatWeekDays.includes(value)) {
      this.repeatWeekDays.push(value);
    }
  } else {
    this.repeatWeekDays = this.repeatWeekDays.filter(d => d !== value);
  }
}
  selectedEvent: any = null;
 
  openPopup(arg: any) {
    this.resetForm();
    this.theDate = arg.date; // Salva la data selezionata
    this.visible = true; // Mostra il popup
    //this.isEditMode = false; 
  }

addEvent() {
  if (!this.eventName.trim()) {
    alert("Inserisci un nome per l'evento!");
    return;
  }
  if (!this.theDate) {
    alert("Seleziona una data per l'evento!");
    return;
  }

  // Calcolo startDateTime (solo data se allDay)
  const isAllDay = this.isTask || !this.eventTime;
  const startDateTime = new Date(this.theDate);

  // Base event
  const newEvent: any = {
    title: this.eventName,
    color: this.eventColor,
    extendedProps: {
      luogo: this.eventLocation,
      tipo: this.isTask ? 'attività' : 'evento',
      stato: this.taskStatus
    },
    allDay: isAllDay
  };

  // Mappa ripetizioni
  const freqMap: any = {
    daily: 'DAILY',
    weekly: 'WEEKLY',
    biweekly: 'WEEKLY',
    monthly: 'MONTHLY',
    yearly: 'YEARLY'
  };

  // Se evento NON è task e ha ripetizione valida
  if (!this.isTask && this.repeatType && freqMap[this.repeatType]) {
      newEvent.rrule = {
      freq: freqMap[this.repeatType],
      dtstart: startDateTime,
      interval: this.repeatType === 'biweekly' ? 2 : (this.repeatInterval || 1),
      until: this.repeatUntil || undefined,
      byweekday: this.repeatWeekDays.length ? this.repeatWeekDays : undefined
    };

    if (!isAllDay && this.eventTime && this.eventEndTime) {
      newEvent.duration = this.getDuration(this.eventTime, this.eventEndTime);
    }
  } else {
    // Eventi singoli o attività
    newEvent.start = startDateTime;

    if (!isAllDay) {
      if (this.eventTime) {
        newEvent.start = new Date(this.eventTime);
      }
      if (this.eventEndTime) {
        newEvent.end = new Date(this.eventEndTime);
      } else if (this.eventEndDate) {
        newEvent.end = new Date(this.eventEndDate);
      }
    }
  }

  console.log("Nuovo evento creato:", newEvent.rrule); // Debug

  const username = this.sessionService.getSession()!.user.username!;
  const token = this.sessionService.getSession()!.token!;

  this.apiService.createEvent(username, newEvent, token).subscribe({
    next: (savedEvent: any) => {
      const calendarApi = this.calendarComponent.getApi();
      calendarApi.addEvent({
        ...newEvent,
        id: savedEvent._id,
        start: newEvent.start,
        end: newEvent.end
      });
      this.resetForm();
    },
    error: (err) => {
      console.error("Errore durante il salvataggio dell'evento", err);
    }
  });
}

  handleEventClick(clickInfo: any) {
    const event = clickInfo.event;

    // Controlla se il click è avvenuto sul pulsante timer
    if (clickInfo.jsEvent.target.classList.contains('study-session-button') || 
        clickInfo.jsEvent.target.closest('.study-session-button')) {
      // Se è stato cliccato il timer, non fare nulla (già gestito dal timer stesso)
      return;
    }

    this.selectedEvent = event;

    this.eventName = event.title || '';
    this.eventLocation = event.extendedProps?.luogo || '';
    this.eventColor = event.color || '#99ff63';

    const start = event.start;
    const end = event.end;

    this.theDate = start ? new Date(start) : null;
    this.eventTime = start ? new Date(start) : null;
    
    this.eventEndDate = end ? new Date(end) : null; //cambiato post fusorario

    this.eventEndTime = end && !event.allDay ? new Date(end) : null;

    const plainEvent = event.toPlainObject();
    const rrule = plainEvent.rrule;

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
      YEARLY: 'yearly'
    };
    return freqMap[rrule.freq as 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'] || '';
  }

updateEvent() {
  if (!this.selectedEvent) return;

  const calendarApi = this.calendarComponent.getApi();
  const idd = this.selectedEvent.id;
  this.selectedEvent.remove();

  if (!this.theDate) {
    alert("Inserisci una data valida");
    return;
  }

  // Se è attività, sempre allDay e start senza ora
  const isAllDay = this.isTask || !this.eventTime;

  const startDate = this.theDate;
  let endDate: Date | null = this.eventEndDate;
//tolto post fusorario
  let newEvent: any = {
    title: this.eventName,
    color: this.eventColor,
    extendedProps: { 
      luogo: this.eventLocation,
      tipo: this.isTask ? 'attività' : 'evento',
      stato: this.taskStatus
    },
    allDay: isAllDay
  };

  if (!this.isTask && this.repeatType && this.repeatType !== 'none') {
    // Solo per eventi normali applichiamo rrule
    const freqMap: any = {
      daily: 'DAILY',
      weekly: 'WEEKLY',
      biweekly: 'WEEKLY',
      monthly: 'MONTHLY',
      yearly: 'YEARLY'
    };

    newEvent.rrule = {
      freq: freqMap[this.repeatType],
      dtstart: startDate,
      interval: this.repeatInterval || 1,
      until: this.repeatUntil || undefined,
      byweekday: this.repeatWeekDays.length ? this.repeatWeekDays : undefined
    };

    if (!isAllDay && this.eventTime && this.eventEndTime) {
      newEvent.duration = this.getDuration(this.eventTime, this.eventEndTime);
    } else if (!isAllDay) {
      newEvent.duration = '01:00';
    }
  } else {
    // start
    if (!isAllDay && this.eventTime) {
      newEvent.start = new Date(this.theDate);
    } else {
      newEvent.start = new Date(this.theDate);
    }

    // end (solo per eventi normali)
    if (!this.isTask && endDate) {
      if (!isAllDay && this.eventEndTime) {
        newEvent.end = new Date(this.theDate);
      } else {
        newEvent.end = new Date(this.theDate);
      }
    }
  }
this.apiService.updateEvent(
    this.sessionService.getSession()!.user.username!,
    idd,
    newEvent,
    this.sessionService.getSession()!.token!
  ).subscribe({
    next: (updatedEvent: any) => {
      calendarApi.addEvent({
        ...newEvent,
        id: updatedEvent._id
      });

      this.resetForm();
    },
    error: (err) => {
      console.error('Errore durante aggiornamento evento', err);
      alert('Errore durante aggiornamento evento');
    }
  });
}

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
        }
      });
    }
  }
}


getDuration(startTime: Date, endTime: Date): string {
  const diffMs = endTime.getTime() - startTime.getTime();
  if (diffMs <= 0) {
    return "00:00:00";
  }

  const diffSeconds = Math.floor(diffMs / 1000);
  const hours = Math.floor(diffSeconds / 3600);
  const minutes = Math.floor((diffSeconds % 3600) / 60);
  const seconds = diffSeconds % 60;

  const pad = (n: number) => String(n).padStart(2, "0");

  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}


  //riguarda
  onRepeatTypeChange() {
    this.repeatUntil = null;
    this.repeatWeekDays = [];
  
    if (this.repeatType === 'biweekly') {
      this.repeatInterval = 2;
      this.autoSelectWeekdayFromDate();
    } else if (this.repeatType === 'weekly') {
      this.repeatInterval = 1;
      this.autoSelectWeekdayFromDate();
    }
  }
  autoSelectWeekdayFromDate() {
    if (!this.theDate) return;
  
    const dayIndex = new Date(this.theDate).getDay(); // 0 = Domenica, 1 = Lunedì, ...
    const weekdayValues = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
    this.repeatWeekDays = [weekdayValues[dayIndex]];
  }

  // Funzione per resettare i campi
  resetForm() {
    this.eventName = '';
    this.eventTime = null; // Reset dell'ora evento
    this.eventEndTime = null; // Reset dell'ora fine evento
    this.eventEndDate = null;
    this.theDate = null; // Reset della data
    this.repeatWeekly = false;
    this.eventLocation = '';
    this.visible = false; // Chiude il popup
    this.eventColor = '#99ff63'; // Reset del colore evento 
    this.repeatType = ''; // Reset del tipo di ripetizione
    this.repeatUntil = null; // Reset della data di fine ripetizione
    this.repeatInterval = 1; // Reset dell'intervallo di ripetizione
    this.repeatWeekDays = []; // Reset dei giorni della settimana 
    this.selectedEvent = null; 
    //tolti selectedevent DA TOGLIERE COMMENTO SE VA TUTTO BENE
    this.isTask = false;
    this.taskStatus = 'da_fare';

  }
  onIsTaskChange() {
  if (this.isTask) {
    // Resetta i campi non rilevanti se è attività
    this.eventTime = null;
    this.eventEndTime = null;
    this.eventLocation = '';
    this.repeatType = '';
    this.repeatUntil = null;
    this.repeatWeekDays = [];
  }
}
};


/*
  isHoliday(date: Date): boolean {
    // Logica per compleanno
    return false;
  }

setDefaultTime(step: number = 15) {
  const now = new Date();
  const minutes = now.getMinutes();
  const roundedMinutes = Math.ceil(minutes / step) * step;
  now.setMinutes(roundedMinutes);
  now.setSeconds(0);
  this.time = now;
}
*/
