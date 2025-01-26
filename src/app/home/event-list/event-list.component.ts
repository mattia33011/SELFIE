import { Component, Input } from '@angular/core';
import { Events } from '../../../types/events';
import { TranslatePipe } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { PanelModule } from 'primeng/panel';
import { LocalDatePipe, TimePipe } from '../../../utils/timeConverter';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-event-list',
  imports: [PanelModule, SkeletonModule, ButtonModule, TranslatePipe, TimePipe, LocalDatePipe],
  templateUrl: './event-list.component.html',
  styleUrl: './event-list.component.css'
})
export class EventListComponent {
  @Input() events!: Events
  @Input() loading?: boolean
  @Input() title!: string
  @Input() emptyLabel: string = 'home.noEvents'
  @Input() dateFormat: "time" | "date" = 'time'

  convertTimeToString(date: Date){
    return date.toLocaleTimeString(undefined, {"timeStyle": "short"})
  }
}
