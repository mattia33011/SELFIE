import {
  ChangeDetectorRef,
  Component,
  Signal,
  WritableSignal,
  input,
  signal,
} from '@angular/core';
import { ActivatedRoute, Route, Router } from '@angular/router';
import {
  GanttTask,
  Project,
  Task,
  TaskStatus,
  convertTaskToGanttTask,
} from '../../../types/project';
import Gantt from 'frappe-gantt';
import { GanttChartComponent } from '../../gantt-chart/gantt-chart.component';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { CardModule } from 'primeng/card';
import { ApiService } from '../../service/api.service';
import {
  SessionService,
  profilePictureSubject,
} from '../../service/session.service';
import { AvatarModule } from 'primeng/avatar';
import { ProfileChipComponent } from '../../profile-chip/profile-chip.component';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ListboxModule } from 'primeng/listbox';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { SelectButtonModule } from 'primeng/selectbutton';
import { ListComponent } from './list/list.component';
import { TextareaModule } from 'primeng/textarea';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { DatePickerModule } from 'primeng/datepicker';
import { ToastModule } from 'primeng/toast';
import { AddTaskComponent } from '../add-task/add-task.component';
import { Observable, ReplaySubject } from 'rxjs';

@Component({
  selector: 'app-details',
  imports: [
    GanttChartComponent,
    CardModule,
    TranslatePipe,
    AvatarModule,
    ProfileChipComponent,
    ButtonModule,
    DialogModule,
    InputGroupModule,
    InputTextModule,
    AutoCompleteModule,
    InputGroupAddonModule,
    ListboxModule,
    FormsModule,
    ConfirmPopupModule,
    SelectButtonModule,
    ListComponent,
    ReactiveFormsModule,
    TextareaModule,
    ToggleButtonModule,
    DatePickerModule,
    ConfirmDialogModule,
    ToastModule,
    AddTaskComponent,
    FormsModule,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './details.component.html',
  styleUrl: './details.component.css',
})
export class DetailsComponent {
  //TODO ADD MEMBER - DELETE MEMBER POPUP
  //TODO ADD TASK - DELETE TASK POPUP
  constructor(
    activatedRoute: ActivatedRoute,
    private confirmationService: ConfirmationService,
    private router: Router,
    private translateService: TranslateService,
    private apiService: ApiService,
    private session: SessionService,
    private cd: ChangeDetectorRef,
    private messageService: MessageService
  ) {
    const project = router.getCurrentNavigation()?.extras.state?.['project'];
    if (project == undefined) {
      router.navigate(['project']);
      return;
    }

    this.lang = translateService.currentLang;
    this.project = project;
    translateService.onLangChange.subscribe((it) => {
      this.lang = it.lang;
      this.initViewOptions();
    });

    this.isAuthor = this.project.author == session.getSession()?.user.username
    this.initViewOptions();
    this.tasks = this.project.tasks.map(convertTaskToGanttTask);
    this.taskObservable.next(this.project.tasks);
    if (this.tasks.length == 0) this.viewMode = 'addTask';

  }
  isAuthor: boolean = false
  taskObservable = new ReplaySubject<Task[]>();
  taskFormGroup = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(1)]),
    input: new FormControl('', [Validators.required]),
    isMilestone: new FormControl(false),
    range: new FormControl(
      [],
      [Validators.required, minArrayLengthValidator(2)]
    ),
    linkedTask: new FormControl<string[]>([]),
    authors: new FormControl<string[]>([], Validators.required),
  });
  _isInputVisible = true;
  set isInputVisible(v: boolean) {
    if (!v) this.inputValue = undefined;

    this._isInputVisible = v;
  }
  get isInputVisible() {
    return this._isInputVisible;
  }

  inputValue?: { taskID: string; value: string };
  _isOutputVisible = true;
  outputValue?: { taskID: string; value: string };
  set isOutputVisible(v: boolean) {
    if (!v) this.outputValue = undefined;

    this._isOutputVisible = v;
  }
  get isOutputVisible() {
    return this._isOutputVisible;
  }
  today = new Date();
  _viewMode: 'list' | 'gantt' | 'addTask' = 'list';
  set viewMode(value: any) {
    if (value == '' || value == undefined) return;
    if (this._viewMode == 'addTask' && value != 'addTask')
      this.taskFormGroup.reset();
    this._viewMode = value;
  }
  get viewMode(): 'list' | 'gantt' | 'addTask' {
    return this._viewMode;
  }
  viewOptions: { name: string; value: string }[] = [];
  project!: Project;
  lang!: string;
  get members() {
    return [this.project.author, ...this.project.members];
  }
  _dialogStatus: DialogStatus = 'none';
  get dialogStatus() {
    return this._dialogStatus;
  }
  set dialogStatus(v: DialogStatus) {
    this._dialogStatus = v;

    if (v != 'addMember') this.addMemberVisible = false;
    else this.addMemberVisible = true;

    if (v != 'deleteMember') this.deleteMemberVisible = false;
    else this.deleteMemberVisible = true;

    if (v != 'addTask') this.addTaskDialog = false;
    else this.addTaskDialog = true;
  }

  _addTaskDialog = false;
  set addTaskDialog(v: boolean) {
    if (!v) this.taskFormGroup.reset();

    this._addTaskDialog = v;
  }
  get addTaskDialog() {
    return this._addTaskDialog;
  }
  _addMemberVisible = false;
  set addMemberVisible(v: boolean) {
    if (v == false) {
      this.userList = [];
      this.selectedMembers = [];
    }

    this._addMemberVisible = v;
  }
  get addMemberVisible() {
    return this._addMemberVisible;
  }

  deleteMemberVisible = false;
  profileImages: { userID: string; imageUrl?: string }[] = [];
  tasks: GanttTask[] = [];
  ngAfterViewInit() {
    const members = [this.project.author, ...this.project.members];
    const session = this.session.getSession()!;
    profilePictureSubject.subscribe((it) => {
      if (this.getProfilePicture(session.user.username)) return;

      this.profileImages.push({
        userID: session.user.username,
        imageUrl: it,
      });
    });
    members.forEach((user) => {
      if (this.getProfilePicture(user)) return;
      if (user == session.user.username || user == session.user.email) return;
      console.log('calling with user ', user);

      this.apiService
        .getOtherProfilePicture(user, this.session.getSession()!)
        .subscribe({
          next: (it) =>
            this.profileImages.push({
              userID: user,
              imageUrl: it,
            }),
        });
    });
  }

  initViewOptions() {
    this.viewOptions = [
      {
        name: this.translateService.instant('gantt'),
        value: 'gantt',
      },
      {
        name: this.translateService.instant('list'),
        value: 'list',
      },
    ];

    if(this.isAuthor)
      this.viewOptions.push(
        {
          name: this.translateService.instant('addTask'),
          value: 'addTask',
        })
  }

  getProfilePicture(user: string) {
    return this.profileImages.find((it) => it.userID == user)?.imageUrl;
  }
  openTaskDialog(task: Task) {
    this.taskFormGroup.get('linkedTask')?.setValue([task.id]);
    this.openDialog('addTask');
  }
  openDialog(dialogStatus: DialogStatus) {
    this.dialogStatus = dialogStatus;
  }
  closeDialog() {
    this.dialogStatus = 'none';
  }

  userList: string[] = [];
  selectedMembers: string[] = [];
  updatedTasks: Task[] = [];
  handleTaskEmitters(
    data: any,
    action: 'delete' | 'add' | 'status' | 'input' | 'output' | 'saveUpdated'
  ) {
    switch (action) {
      case 'add':
        this.addTask();
        break;
      case 'delete':
        this.openDeleteTaskPopup(data.task.id, data.clickEvent);
        break;
      case 'input':
        this.isInputVisible = true;
        this.inputValue = {
          taskID: data.id,
          value: data.input,
        };
        break;
      case 'output':
        this.isOutputVisible = true;
        this.outputValue = {
          taskID: data.id,
          value: data.output,
        };
        break;
      case 'saveUpdated':
        const task = this.updatedTasks.find((it) => it.id == data.id);
        this.updateTask(task!);

        break;
      case 'status':
        const index = this.updatedTasks.findIndex((it) => it.id == data.id);
        if (index == -1) this.updatedTasks.push(data);
        else this.updatedTasks[index] = data;

        console.log(this.updatedTasks);
        break;
    }
  }

  saveInput() {
    const task = this.project.tasks.find(
      (it) => this.inputValue!.taskID == it.id
    )!;
    if (task.input == this.inputValue?.value) {
      this.isInputVisible = false;
      return;
    }

    task.input = this.inputValue?.value;
    this.updateTask(task, () => (this.isInputVisible = false));
  }
  saveOutput() {
    const task = this.project.tasks.find(
      (it) => this.outputValue!.taskID == it.id
    )!;
    if (task.output == this.outputValue?.value) {
      this.isOutputVisible = false;
      return;
    }

    task.output = this.outputValue?.value;
    task.status = TaskStatus.Done;
    this.updateTask(task, () => (this.isOutputVisible = false));
  }
  updateTask(task: Task, callback?: () => void) {
    const index = this.project.tasks.findIndex((it) => it.id == task.id);
    this.project.tasks[index] = task;
    this.apiService
      .updateProject(
        this.project,
        this.session.getSession()!.user.username,
        this.session.getSession()!.token
      )
      .subscribe({
        next: (it) => {
          console.log(this.project);
          this.resetHistory(this.project);
          this.taskObservable.next(this.project.tasks);
          this.updatedTasks = [];
          if (callback) callback();
        },
      });
  }

  confirmLoading = false;
  async addTask() {
    console.log(JSON.stringify(this.taskFormGroup.value));
    const task: Task = {
      id: (this.tasks.length + 1).toString(),
      linkedTask: this.taskFormGroup.value.linkedTask!,
      name: this.taskFormGroup.value.name!,
      authors: this.taskFormGroup.value.authors!,
      input: this.taskFormGroup.value.input!,
      isMilestone: this.taskFormGroup.value.isMilestone!,
      start: this.taskFormGroup.value.range![0],
      expire: this.taskFormGroup.value.range![1],
      status: TaskStatus.Startable,
    };

    this.apiService
      .putTaskInProject(
        this.project.id,
        task,
        this.session.getSession()!.user.username,
        this.session.getSession()!.token
      )
      .subscribe({
        next: (it) => {
          this.project = it;
          this.confirmLoading = true;
          this.messageService.add({
            severity: 'success',
            summary: this.translateService.instant('addedTask'),
            detail: `Task ${task.name} ${this.translateService.instant(
              'added'
            )}`,
            life: 3000,
          });
          this.confirmLoading = false;
          this.viewMode = 'list';
          this.resetHistory(this.project);
          this.cd.detectChanges();
          this.closeDialog();
        },
      });
  }

  resetHistory(project: Project) {
    this.tasks = project.tasks.map(convertTaskToGanttTask);
    this.taskObservable.next(project.tasks);
    history.replaceState({ project: project }, '', window.location.href);
  }

  loading = false;
  searchNewMember(v: string) {
    if (v.length == 0) this.userList = [];
    else
      this.apiService
        .autoSuggestUsers(
          v,
          this.session.getSession()!.user.username,
          this.session.getSession()!.token
        )
        .subscribe({
          next: (users) => {
            this.userList = users.filter(
              (it) => !this.project.members.includes(it)
            );
          },
        });
  }

  addMembers() {
    if (this.selectedMembers.length == 0) return;
    this.selectedMembers.forEach((it) => this.project.members.push(it));
    this.apiService
      .updateProject(
        this.project,
        this.session.getSession()!.user.username,
        this.session.getSession()!.token
      )
      .subscribe({
        next: (it) => {
          this.resetHistory(this.project);
          this.closeDialog();
        },
      });
  }
  async delete(taskID: string) {
    this.project.tasks.splice(
      this.project.tasks.findIndex((it) => it.id == taskID),
      1
    );
    this.apiService
      .updateProject(
        this.project,
        this.session.getSession()!.user.username,
        this.session.getSession()!.token
      )
      .subscribe({
        next: () => {
          this.resetHistory(this.project);
          if (this.project.tasks.length == 0) this.viewMode = 'addTask';
          this.closeDialog();
        },
      });
  }
  openDeleteMemberPopup(user: string, event: Event) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: this.translateService.instant('deleteMemberPopup'),
      header: user,
      icon: 'pi pi-info-circle',
      rejectButtonProps: {
        label: this.translateService.instant('close'),
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: this.translateService.instant('deleteMemberBtn'),
        severity: 'danger',
      },
      accept: async () => {
        //TODO call the api
        this.project.members.splice(this.project.members.indexOf(user), 1);
        this.apiService
          .updateProject(
            this.project,
            this.session.getSession()!.user.username,
            this.session.getSession()!.token
          )
          .subscribe({
            next: (it) => {
              this.resetHistory(this.project);
            },
          });
      },
    });
  }

  openDeleteProjectDialog(event: Event){
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: this.translateService.instant('deleteProjectDialog'),
      header: this.translateService.instant('deleteProject'),
      icon: 'pi pi-exclamation-triangle',
      rejectButtonProps: {
        label: this.translateService.instant('close'),
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: this.translateService.instant('delete'),
        severity: 'danger',
      },
      accept: async () => {
        this.apiService.deleteProject(this.project.id, this.session.getSession()!.user.username, this.session.getSession()!.token).subscribe({
          next: () => {
            history.replaceState({ project: undefined }, '', window.location.href);
            this.router.navigate(['/project'])
          }
        })
      },
    });
  }

  openDeleteTaskPopup(taskID: string, event: Event) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: this.translateService.instant('deleteTaskPopup'),
      header: 'ID: ' + taskID,
      icon: 'pi pi-info-circle',
      rejectButtonProps: {
        label: this.translateService.instant('close'),
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: this.translateService.instant('deleteTaskBtn'),
        severity: 'danger',
      },
      accept: async () => {
        await this.delete(taskID);
      },
    });
  }
}

type DialogStatus = 'none' | 'addMember' | 'deleteMember' | 'addTask';

export function minArrayLengthValidator(min: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (control.value === null || control.value === undefined) {
      return null; // Non validare se il valore è null o undefined (potresti voler aggiungere un RequiredValidator in questo caso)
    }

    if (!Array.isArray(control.value)) {
      // Se il valore non è un array, potresti voler lanciare un errore o ignorare la validazione
      // Per semplicità, in questo esempio lo trattiamo come valido se non è un array
      // ma in un caso reale potresti voler un errore specifico.
      return { notAnArray: { value: control.value } };
    }
    const value = control.value.filter((it) => it != null);
    if (value.length < min) {
      return {
        minArrayLength: { requiredLength: min, actualLength: value.length },
      };
    }

    return null;
  };
}
