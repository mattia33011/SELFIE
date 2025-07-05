import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import Gantt from 'frappe-gantt';
import { GanttTask } from '../../types/project';
import { ButtonModule } from 'primeng/button';
import { SelectButtonModule } from 'primeng/selectbutton';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-gantt-chart',
  imports: [SelectButtonModule, FormsModule, CardModule],
  templateUrl: './gantt-chart.component.html',
  styleUrl: './gantt-chart.component.css',
  standalone: true,
})
export class GanttChartComponent {
  @Input() tasks: GanttTask[] = [];
  @Input() viewMode:
    | 'Quarter Day'
    | 'Half Day'
    | 'Day'
    | 'Week'
    | 'Month'
    | 'Year' = 'Week';
  @Input() columnWidth?: number = 80;
  @Input() barHeight?: number = 30;
  @Input() barCornerRadius?: number = 3;
  @Input() arrowCurve?: number = 5;
  @Input() padding?: number = 100;
  @Input() language: string = 'it';
  @Input() dateFormat: string = 'YYYY-MM-DD';
  @Input() alignButtons: "center" | "end" | "start" = "start"
  gantt!: Gantt;
  viewOptions: {label: string, value: string}[] = [
    { label: 'Quarter Day', value: 'Quarter Day' },
    { label: 'Half Day', value: 'Half Day' },
    { label: 'Day', value: 'Day' },
    { label: 'Week', value: 'Week' },
    //{ label: 'Month', value: 'Month' },
    //{ label: 'Year', value: 'Year' },
  ];

constructor(private translateService: TranslateService){
  translateService.onLangChange.subscribe(it => this.initViewOptionsLabel())
}

private initViewOptionsLabel(){
  this.viewOptions = [
    { label: this.translateService.instant('Quarter Day'), value: 'Quarter Day' },
    { label: this.translateService.instant('Half Day'), value: 'Half Day' },
    { label: this.translateService.instant('Day'), value: 'Day' },
    { label: this.translateService.instant('Week'), value: 'Week' },
    //{ label: 'Month', value: 'Month' },
    //{ label: 'Year', value: 'Year' },
  ];
}

  renderGantt() {
    this.gantt = new Gantt('#ganttContainer', this.tasks, {
      "today_button": false,
      column_width: this.columnWidth,
      bar_height: this.barHeight,
      bar_corner_radius: this.barCornerRadius,
      arrow_curve: this.arrowCurve,
      padding: this.padding,
      language: this.language,
      date_format: this.dateFormat,
      view_mode: this.viewMode,
      readonly: true,
      infinite_padding: false,
      lower_header_height: 50,
      upper_header_height: 50,
      on_click: (task: GanttTask) => {
        console.log('Task cliccata:', task);
      },
      on_date_change: (task: GanttTask, start: Date, end: Date) => {
        console.log('Data task modificata:', task, start, end);
      },
      on_progress_change: (task: GanttTask, progress: number) => {
        console.log('Progresso task modificato:', task, progress);
      },
    });
  }

  changeViewMode(){
    this.gantt.change_view_mode(this.viewMode)
  }

  ngAfterViewInit() {
    this.renderGantt();
  }
}
