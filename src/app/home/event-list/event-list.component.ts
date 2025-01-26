import { Component, Input } from '@angular/core';
import { Event, Events, isEvent, Note, Notes } from '../../../types/events';
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
  @Input() content!: Events | Notes
  @Input() loading?: boolean
  @Input() title!: string
  @Input() emptyLabel: string = 'home.noEvents'
  @Input() dateFormat: "time" | "date" = 'time'
  protected _content:Content[] = []
  ngOnInit(){
    this._content = this.content.map(this.castContent)

  }
  castContent(e: Event | Note): Content{
    return {
      title: e.title,
      color: e.color,
      date: isEvent(e) ? e.expireDate : e.lastEdit,
      subtitle: isEvent(e) ? e.description : e.content
    }
  }


}

type Content = {title: string, color?: "success" | "info" | "warn" | "danger" | "help", date: Date, subtitle?: string}