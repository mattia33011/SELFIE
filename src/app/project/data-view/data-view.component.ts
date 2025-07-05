import { Component, Input } from '@angular/core';
import {
  Project,
  Task,
  TaskStatus,
  taskStatusToString,
} from '../../../types/project';
import { DataViewModule } from 'primeng/dataview';
import { ButtonModule } from 'primeng/button';
import { TranslatePipe } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { routes } from '../../app.routes';

@Component({
  selector: 'app-data-view',
  imports: [DataViewModule, ButtonModule, TranslatePipe],
  templateUrl: './data-view.component.html',
  styleUrl: './data-view.component.css',
})
export class DataViewComponent {
  constructor(private router: Router) {}

  @Input()
  data!: Project[];

  calculateMilestoneCompleted(tasks: Task[]) {
    const total = tasks.filter((it) => it.isMilestone);
    const completed = total.filter((it) => it.status == TaskStatus.Done);
    if (total.length == 0) return 100;
    return (completed.length * 100) / total.length;
  }

  retrieveMemberFromProject(project: Project) {
    return project.members.reduce(
      (prev, curr) => `${prev}, ${curr}`,
      project.author
    );
  }

  getMainTasks(project: Project) {
    return project.tasks
      .filter((it) => it.isMilestone)
      .sort((a, b) => a.expire.getTime() - b.expire.getTime());
  }

  getStatus(taskStatus: TaskStatus) {
    return taskStatusToString(taskStatus);
  }

  goToDetails(project: Project) {
    this.router.navigate([`project/${project.name.replaceAll(' ', '-')}`], {
      state: { project: project },
    });
  }
}
