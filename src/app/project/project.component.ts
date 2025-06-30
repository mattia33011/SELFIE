import { Component } from '@angular/core';
import { Project, TaskStatus } from '../../types/project';
import { DataViewModule } from 'primeng/dataview';
import { ButtonModule } from 'primeng/button';
import { TranslatePipe } from '@ngx-translate/core';
import { DataViewComponent } from './data-view/data-view.component';
@Component({
  selector: 'app-project',
  imports: [DataViewComponent, ButtonModule, TranslatePipe],
  templateUrl: './project.component.html',
  styleUrl: './project.component.css',
})
export class ProjectComponent {
  fakeProject: Project = {
    author: 'mattwz',
    id: 'prova',
    members: ['sophia', 'luca', 'matsdasd'],
    note: 'Progetto di prova',
    name: 'Progetto Selfie',
    expire: new Date('06/27/2025'),
    start: new Date('06/06/2025'),
    tasks: [
      {
        authors: ['mattwz', 'sophia'],
        expire: new Date('07/30/2025'),
        start: new Date('06/06/2025'),
        id: 'Main',
        linkedTask: ["1","2"],
        input: '',
        status: TaskStatus.Startable,
        name: 'Selfie',
        isMilestone: true,
        output: undefined,
      },
      {
        authors: ['mattwz', 'sophia'],
        expire: new Date('06/29/2025'),
        start: new Date('06/06/2025'),
        id: '1',
        linkedTask: [],
        input: '',
        status: TaskStatus.Startable,
        name: 'FrontEnd',
        isMilestone: true,
        output: undefined,
      },
      {
        authors: ['sophia'],
        expire: new Date('06/29/2025'),
        start: new Date('06/07/2025'),
        id: '2',
        linkedTask: ["1"],
        input: '',
        status: TaskStatus.Startable,
        name: 'HomePage',
        isMilestone: false,
        output: undefined,
      },
      {
        authors: ['mattwz', 'luca'],
        expire: new Date('06/20/2025'),
        start: new Date('06/01/2025'),
        id: '3',
        linkedTask: [],
        input: '',
        status: TaskStatus.Startable,
        name: 'BackEnd',
        isMilestone: true,
        output: undefined,
      },
    ],
  };

  fakeProjects: Project[] = [
    this.fakeProject,
    this.fakeProject,
    this.fakeProject,
    this.fakeProject,
  ];
}
