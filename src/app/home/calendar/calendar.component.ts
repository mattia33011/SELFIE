import { Component } from '@angular/core';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, ButtonTextCompoundInput, CustomButtonInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import ListWeekPlugin from '@fullcalendar/list';
import TimeGridPlugin from '@fullcalendar/timegrid';
import { PanelModule } from 'primeng/panel';

@Component({
  selector: 'app-calendar',
  imports: [FullCalendarModule, PanelModule],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.css'
})
export class CalendarComponent {
  today = new Date()
  calendarOptions: CalendarOptions = {
    selectable: true,
    initialView: 'dayGridMonth',
    locale: ['it'],
    headerToolbar: {
      left: 'title',
      "right": 'prev,next'
    },
    plugins: [dayGridPlugin, ListWeekPlugin, TimeGridPlugin],
    events: [
      { title: 'event 1', date: '2025-04-01' },
      { title: 'event 2', start: '2025-01-25', end: '2025-01-31' },
      { title: 'event 4', start: '2025-01-25', end: '2025-01-31' },
      { title: 'event 3', start: '2025-01-25' }
    ],
    eventClick: (arg) => console.log(arg),
    dayCellClassNames: (arg: any) => {
      let classes: string[] = [];
      const {date, isDisabled, isFuture, isPast, isToday} = arg
      return classes;
    }
  };

  isHoliday(date: Date): boolean {
    // Logica per identificare giorni festivi
    // Implementa la tua logica personalizzata
    return false;
  }
  
}
