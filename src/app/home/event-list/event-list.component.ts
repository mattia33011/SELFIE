import { Component, Input } from '@angular/core';
import {
  CalendarEvent,
  Events,
  isEvent,
  Note,
  Notes,
} from '../../../types/events';
import { TranslatePipe } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { PanelModule } from 'primeng/panel';
import { LocalDatePipe, TimePipe } from '../../../utils/timeConverter';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-event-list',
  imports: [
    PanelModule,
    SkeletonModule,
    ButtonModule,
    TranslatePipe,
    TimePipe,
    LocalDatePipe,
  ],
  templateUrl: './event-list.component.html',
  styleUrl: './event-list.component.css',
})
export class EventListComponent {
  @Input() content!: Events | Notes;
  @Input() loading?: boolean;
  @Input() title!: string;
  @Input() emptyLabel: string = 'home.noEvents';
  @Input() dateFormat: 'time' | 'date' = 'time';
  get _content(): Content[] {
    return this.content?.map(this.castContent);
  }

  castContent(e: CalendarEvent | Note): Content {
    if (isEvent(e)) {
      return {
        title: e.title,
        color: e.color,
        date: new Date(e.end ?? e.start ?? new Date()),
        subtitle: e.extendedProps?.luogo ?? '',
      };
    } else {
      return {
        title: e.label,
        date: e.lastEdit,
        subtitle:
          e.content?.length > 30 ? e.label.slice(0, 30) + '...' : e.content,
      };
    }
  }
}

type Content = { title: string; color?: string; date: Date; subtitle: string };
