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
//import { RouterOutlet } from '@angular/router';
/*  QUINDI
  Checkbox se evento o attività (se è un evento posso mettere tutte opz, se è un'attività solo la data + ora di scadenza)
  se evento:
  - all day
  - nome evento
  vuoi aggiungere dati oltre ad All day e nome (tendina?)? ALLORA salta fuori opzioni per aggiungerle
  - giorno di fine
  - ora di inizio
  - ora di fine
  - colore evento
  - luogo evento
  tendina per ripetizione
  - ripeti ogni X giorni
  - ripeti TOT VOLTE
  - ripeti settimanalmente / bisettimanalmente / mensilmente / annualmente
  - fino a data di fine ripetizione
  - ripeti giorni personalizzati (esempio: ogni lunedì e giovedì)
*/

// manca ripeti N volte (non ha troppo senso), ripeti tutti i primi lunedì del mese (?)

// opzione per modificare/eliminare evento
//   magari segnare orario in alto a sx dell'evento
// attività (distinguo tra attività e evento faccio un evento a cui dò solo una scadenza? e che va a finire nella lista)
// VAnno piccoli gli eventi in mobile
// traduzione in ing


@Component({
  selector: 'app-calendar',
  standalone: true, //standalone
  imports: [FullCalendarModule, PanelModule, FormsModule, CommonModule, DialogModule, ButtonModule],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.css'
})
export class CalendarComponent {
  @ViewChild('fullcalendar') calendarComponent!: FullCalendarComponent; // Riferimento al calendario

  today = new Date()
  eventName: string = ''; // nome evento
  theDate: string = ''; // data evento
  eventEndDate: string = ''; // data fine evento
  eventTime: string = ''; // ora evento
  eventEndTime: string = ''; // ora fine evento
  eventColor: string = '#99ff63'; // colore evento
  eventLocation: string = ''; // luogo evento
  repeatWeekly: boolean = false;
  visible: boolean = false;
  repeatType: string = ''; // 'none', 'daily', 'weekly', 'monthly', // 'custom'
  repeatUntil: string = ''; // data fine ripetizione
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


  //isEditMode = false;
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
    contentHeight: window.innerWidth < 768 ? 350 : 700, // Altezza calendario (se piccola va a 350 se grande 700)
    locale: ['it'],
    plugins: [dayGridPlugin, ListWeekPlugin, TimeGridPlugin, interactionPlugin, rrulePlugin],
    dateClick: this.openPopup.bind(this), //bind this perché altrimenti "non tiene il this"
    events: [], // Inizialmente vuoto
    //eventClick: this.handleEventClick.bind(this),    
  };

  openPopup(arg: any) { //riguarda (dateClick passa un oggetto arg con la proprietà dateStr, che è la data in formato stringa.)
    this.theDate = arg.dateStr; // Salva la data selezionata
    this.visible = true; // Mostra il popup
    //this.isEditMode = false; 
  }

  addEvent() {
    if (!this.eventName.trim()) {
      alert("Inserisci un nome per l'evento!");
      return;
    }
  
    if (!this.theDate || isNaN(new Date(this.theDate).getTime())) {
      alert("Inserisci una data valida!");
      return;
    }
  
    const calendarApi = this.calendarComponent.getApi();
    const isAllDay = !this.eventTime;
    const startDateTime = this.theDate + (this.eventTime ? `T${this.eventTime}:00` : '');
  
    let newEvent: any = {
      title: this.eventName,
      color: this.eventColor,
      extendedProps: {
        luogo: this.eventLocation
      }
    };
  
    if (this.repeatType && this.repeatType !== 'none') {
      const freqMap: any = {
        daily: 'DAILY',
        weekly: 'WEEKLY',
        biweekly: 'WEEKLY', //weekly con intervallo
        monthly: 'MONTHLY',
        yearly: 'YEARLY',
        //custom: 'CUSTOM'
      };
  
      newEvent.rrule = {
        freq: freqMap[this.repeatType],
        dtstart: startDateTime,
        interval: this.repeatInterval || 1,
        until: this.repeatUntil ? new Date(this.repeatUntil).toISOString() : undefined,
        // count: this.repeatType === 'custom' ? this.repeatCount : undefined, // per "Ripeti per N volte"
        byweekday: this.repeatWeekDays.length ? this.repeatWeekDays : undefined
      };
  
      if (!isAllDay) {
        newEvent.duration = this.eventEndTime
          ? this.getDuration(this.eventTime, this.eventEndTime)
          : '01:00'; // fallback a 1 ora
      }
  
    } else {
      newEvent.start = startDateTime;
      newEvent.allDay = isAllDay;
  
      if (this.eventEndDate) {
        let end = '';
        if (isAllDay) {
          const endDate = new Date(this.eventEndDate);
          endDate.setDate(endDate.getDate() + 1);
          end = endDate.toISOString().split('T')[0];
        } else {
          end = this.eventEndDate + (this.eventEndTime ? `T${this.eventEndTime}:00` : '');
        }
        newEvent.end = end;
      }
    }
  
    calendarApi.addEvent(newEvent);
    this.resetForm();
  }
  getDuration(startTime: string, endTime: string): string {
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;
    const durationMinutes = endMinutes - startMinutes;
    const h = Math.floor(durationMinutes / 60);
    const m = durationMinutes % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  }
  //riguarda
  onRepeatTypeChange() {
    this.repeatUntil = '';
    // this.repeatCount = 1;
    this.repeatWeekDays = [];
  
    if (this.repeatType === 'biweekly') {
      this.repeatInterval = 2;
      this.autoSelectWeekdayFromDate();
    } else if (this.repeatType === 'weekly') {
      this.repeatInterval = 1;
      this.autoSelectWeekdayFromDate();
   /* } else if (this.repeatType === 'custom') {
      this.repeatCount = 1; */
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
    this.eventTime = '';
    this.eventEndTime = '';
    this.eventEndDate = '';
    this.theDate = '';
    this.repeatWeekly = false;
    this.eventLocation = '';
    this.visible = false; // Chiude il popup
    this.eventColor = '#99ff63'; // Reset del colore evento 
    this.repeatType = ''; // Reset del tipo di ripetizione
    this.repeatUntil = ''; // Reset della data di fine ripetizione
    this.repeatInterval = 1; // Reset dell'intervallo di ripetizione
    this.repeatWeekDays = []; // Reset dei giorni della settimana 
  }

};
/*
  isHoliday(date: Date): boolean {
    // Logica per compleanno
    return false;
  }
*/
