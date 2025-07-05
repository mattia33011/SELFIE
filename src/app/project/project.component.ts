import { Component } from '@angular/core';
import { Project, Task, TaskStatus } from '../../types/project';
import { DataViewModule } from 'primeng/dataview';
import { ButtonModule } from 'primeng/button';
import { TranslatePipe } from '@ngx-translate/core';
import { DataViewComponent } from './data-view/data-view.component';
import { ApiService } from '../service/api.service';
import { SessionService } from '../service/session.service';
import { Router } from '@angular/router';
import { DialogModule } from 'primeng/dialog';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';
import { TextareaModule } from 'primeng/textarea';
import { minArrayLengthValidator } from './details/details.component';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputGroupModule } from 'primeng/inputgroup';
import { ListboxModule } from 'primeng/listbox';
import { Session } from '../../types/session';

@Component({
  selector: 'app-project',
  imports: [
    DataViewComponent,
    ButtonModule,
    DialogModule,
    TranslatePipe,
    ReactiveFormsModule,
    InputTextModule,
    DatePickerModule,
    TextareaModule,
    InputGroupAddonModule,
    InputGroupModule,
    ListboxModule,
    ButtonModule,
  ],
  templateUrl: './project.component.html',
  styleUrl: './project.component.css',
})
export class ProjectComponent {
  session: Session;
  projects: Project[] = [];
  isProjectDialogVisible = false;
  projectFormGroup = new FormGroup({
    members: new FormControl<string[]>([]),
    task: new FormControl<Task[]>([]),
    name: new FormControl<string>('', [
      Validators.required,
      Validators.minLength(2),
    ]),
    note: new FormControl<string>(''),
    range: new FormControl(
      [],
      [Validators.required, minArrayLengthValidator(2)]
    ),
  });
  
  today = new Date();
  datePlusOneDay(date: Date) {
    return new Date(date.getTime() + 24 * 60 * 60 * 1000);
  }

  constructor(
    private apiService: ApiService,
    private sessionService: SessionService,
    router: Router
  ) {
    //@ts-ignore
    this.session = sessionService.getSession();
    if (!this.session) {
      router.navigate(['/login']);
      return;
    }
    this.fetchAllProject();
  }

  fetchAllProject() {
    this.apiService
      .getAllProject(this.session.user.username, this.session.token)
      .subscribe({
        next: (it) => {
          this.projects = it;
        },
        error: (err) => {
          if (err?.status == 404) return;

          window.alert(
            "C'è stato un errore durante il caricamento dei progetti"
          );
        },
      });
  }

  userList: string[] = [];
  loading = false;
  searchNewMember(v: string) {
    if (v.length == 0) this.userList = [];
    else
      this.apiService
        .autoSuggestUsers(v, this.session.user.username, this.session.token)
        .subscribe({
          next: (users) => {
            this.userList = users;
          },
        });
  }
  saveProject() {
    console.log(this.projectFormGroup.value);
    if (this.projectFormGroup.invalid) return;
    const value = this.projectFormGroup.value;
    const project: Omit<Project, 'id' | 'author'> = {
      members: value.members!,
      tasks: value.task!,
      name: value.name!,
      note: value.note!,
      start: value.range![0],
      expire: value.range![1],
    };
    this.loading = true;
    this.apiService
      .saveProject(project, this.session.user.username, this.session.token)
      .subscribe({
        next: (it) => {
          this.fetchAllProject();
          this.loading = false;
          this.isProjectDialogVisible = false;
        },
      });
  }
}
