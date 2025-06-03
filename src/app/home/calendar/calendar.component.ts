import { Component, ViewChild } from '@angular/core';
import { FullCalendarModule } from '@fullcalendar/angular';
import { FullCalendarComponent } from '@fullcalendar/angular';
import { CalendarOptions, } from '@fullcalendar/core';
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
import { DropdownModule } from 'primeng/dropdown';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ColorPickerModule } from 'primeng/colorpicker';
import { InputTextModule } from 'primeng/inputtext';
import { IftaLabelModule } from 'primeng/iftalabel'; 
import { CheckboxModule} from 'primeng/checkbox'; // Importa il modulo Checkbox
//import { RouterOutlet } from '@angular/router';

// COMANDO npm install @fullcalendar/rrule rrule


// manca ripeti tutti i primi lunedì del mese (?)
// attività (distinguo tra attività e evento faccio un evento a cui dò solo una scadenza? e che va a finire nella lista)
// traduzione in ing SOLO per il calendario (mesi, mese settimana anno, abbreviazioni della settimana nel calendario ecc) (eventi apposto)


@Component({
  selector: 'app-calendar',
  standalone: true, //standalone
  imports: [FullCalendarModule, PanelModule, FormsModule, CommonModule, DialogModule, ButtonModule, DatePickerModule , TranslatePipe, DropdownModule , FloatLabelModule, ColorPickerModule, InputTextModule, IftaLabelModule, CheckboxModule], //standalone
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.css'
})
export class CalendarComponent {
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
  weekDays = [  //così che rrule lo accetti
    { label: 'Lunedì', value: 'MO' },
    { label: 'Martedì', value: 'TU' },
    { label: 'Mercoledì', value: 'WE' },
    { label: 'Giovedì', value: 'TH' },
    { label: 'Venerdì', value: 'FR' },
    { label: 'Sabato', value: 'SA' },
    { label: 'Domenica', value: 'SU' },
  ];
  taskStatuses :any[] = []
  repeatOptions:any[] = [];
  constructor(private translate: TranslateService) {}
  ngOnInit() {
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
      this.translate.get([
      'taskStatus.da_fare',
      'taskStatus.in_corso',
      'taskStatus.completata'
    ]).subscribe(translations => {
      this.taskStatuses = [
        { label: translations['taskStatus.da_fare'], value: 'da_fare' },
        { label: translations['taskStatus.in_corso'], value: 'in_corso' },
        { label: translations['taskStatus.completata'], value: 'completata' }
      ];
    });
  });

  }

  toggleWeekday(event: any) {
    const day = event.target.value;
    if (event.target.checked) {
      if (!this.repeatWeekDays.includes(day)) {
        this.repeatWeekDays.push(day);
      }
    } else {
      this.repeatWeekDays = this.repeatWeekDays.filter(d => d !== day);
    }
  }
  selectedEvent: any = null;
  
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
 };

  openPopup(arg: any) {
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

  const calendarApi = this.calendarComponent.getApi();

  // Calcolo startDateTime con o senza orario
  let startDateTime: Date;
  if (!this.eventTime || this.isTask) {
    // Se è attività o non c'è orario => data solo con ore 0
    startDateTime = new Date(
      this.theDate.getFullYear(),
      this.theDate.getMonth(),
      this.theDate.getDate(),
      0, 0, 0, 0
    );
  } else {
    startDateTime = new Date(
      this.theDate.getFullYear(),
      this.theDate.getMonth(),
      this.theDate.getDate(),
      this.eventTime.getHours(),
      this.eventTime.getMinutes(),
      0, 0
    );
  }

  let newEvent: any = {
    title: this.eventName,
    color: this.eventColor,
    extendedProps: { 
      luogo: this.eventLocation,
      tipo: this.isTask ? 'attività' : 'evento',
      stato: this.taskStatus 
    },
    allDay: this.isTask || !this.eventTime  // allDay se attività o senza orario
  };

  if (!this.isTask && this.repeatType && this.repeatType !== 'none') {
    // Se NON è attività e c'è ripetizione
    const freqMap: any = {
      daily: 'DAILY',
      weekly: 'WEEKLY',
      biweekly: 'WEEKLY',
      monthly: 'MONTHLY',
      yearly: 'YEARLY'
    };

    newEvent.rrule = {
      freq: freqMap[this.repeatType],
      dtstart: startDateTime,
      interval: this.repeatInterval || 1,
      until: this.repeatUntil || undefined,
      byweekday: this.repeatWeekDays.length ? this.repeatWeekDays : undefined
    };

    if (this.eventTime && this.eventEndTime) {
      newEvent.duration = this.getDuration(this.eventTime, this.eventEndTime);
    }
  } else {
    // Eventi singoli o attività (senza rrule)
    newEvent.start = startDateTime;

    if (!this.isTask && this.eventEndTime) {
      // Se evento (non attività) con orario di fine
      const endDateTime = new Date(
        this.theDate.getFullYear(),
        this.theDate.getMonth(),
        this.theDate.getDate(),
        this.eventEndTime.getHours(),
        this.eventEndTime.getMinutes(),
        0, 0
      );
      newEvent.end = endDateTime;
    } else if (!this.isTask && this.eventEndDate) {
      // Se evento (non attività) con data di fine
      newEvent.end = new Date(
        this.eventEndDate.getFullYear(),
        this.eventEndDate.getMonth(),
        this.eventEndDate.getDate(),
        0, 0, 0, 0
      );
    }
  }

  calendarApi.addEvent(newEvent);
  this.resetForm();
}

  handleEventClick(clickInfo: any) {
    const event = clickInfo.event;
    this.selectedEvent = event;

    this.eventName = event.title || '';
    this.eventLocation = event.extendedProps?.luogo || '';
    this.eventColor = event.color || '#99ff63';

    const start = event.start;
    const end = event.end;

    this.theDate = start ? new Date(start) : null;
    this.eventTime = start ? new Date(start) : null;
    
    if (event.allDay && end) {
      const adjustedEnd = new Date(end);
      adjustedEnd.setDate(adjustedEnd.getDate() - 1); // correzione per allDay end
      this.eventEndDate = adjustedEnd;
    } else {
      this.eventEndDate = end ? new Date(end) : null;
    }

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
  this.selectedEvent.remove();

  if (!this.theDate) {
    alert("Inserisci una data valida");
    return;
  }

  // Se è attività, sempre allDay e start senza ora
  const isAllDay = this.isTask || !this.eventTime;

  const startDate = this.theDate;
  let endDate: Date | null = this.eventEndDate;

  if (isAllDay && endDate) {
    // Per eventi allDay la fine è esclusiva quindi aggiungiamo un giorno
    endDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate() + 1);
  }

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
      newEvent.start = new Date(
        startDate.getFullYear(),
        startDate.getMonth(),
        startDate.getDate(),
        this.eventTime.getHours(),
        this.eventTime.getMinutes(),
        0, 0
      );
    } else {
      newEvent.start = new Date(
        startDate.getFullYear(),
        startDate.getMonth(),
        startDate.getDate(),
        0, 0, 0, 0
      );
    }

    // end (solo per eventi normali)
    if (!this.isTask && endDate) {
      if (!isAllDay && this.eventEndTime) {
        newEvent.end = new Date(
          endDate.getFullYear(),
          endDate.getMonth(),
          endDate.getDate(),
          this.eventEndTime.getHours(),
          this.eventEndTime.getMinutes(),
          0, 0
        );
      } else {
        newEvent.end = new Date(
          endDate.getFullYear(),
          endDate.getMonth(),
          endDate.getDate(),
          0, 0, 0, 0
        );
      }
    }
  }

  calendarApi.addEvent(newEvent);
  this.resetForm();
}


deleteEvent() {
  if (this.selectedEvent) {
    if (confirm('Sei sicuro di voler eliminare questo evento?')) {
      this.selectedEvent.remove();
      this.resetForm();
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
    this.selectedEvent.eventname = '';
    this.isTask = false;
    this.taskStatus = 'da_fare';

  }
  onIsTaskChange() {
  if (this.isTask) {
    // Resetta i campi non rilevanti se è attività
    this.eventTime = null;
    this.eventEndTime = null;
    this.eventLocation = '';  // opzionale, se vuoi
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