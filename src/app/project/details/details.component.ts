import {
  ChangeDetectorRef,
  Component,
  Signal,
  WritableSignal,
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
    ToastModule,
    AddTaskComponent,
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
    router: Router,
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

    this.taskSignal = signal(this.project.tasks);
    this.tasks = this.taskSignal().map(convertTaskToGanttTask);
  }

  taskSignal!: WritableSignal<Task[]>;

  taskFormGroup = new FormGroup({
    id: new FormControl('', [Validators.required, Validators.minLength(1)]),
    name: new FormControl('', [Validators.required, Validators.minLength(1)]),
    input: new FormControl('', [Validators.required]),
    isMilestone: new FormControl(false, [Validators.required]),
    range: new FormControl(
      [],
      [Validators.required, minArrayLengthValidator(2)]
    ),
    linkedTask: new FormControl<string[]>([]),
    authors: new FormControl<string[]>([], Validators.required),
  });
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
  set addTaskDialog(v: boolean){
    if(!v)
      this.taskFormGroup.reset()

    this._addTaskDialog = v;
  }
  get addTaskDialog(){
    return this._addTaskDialog
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
    this.initViewOptions();
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
      {
        name: this.translateService.instant('addTask'),
        value: 'addTask',
      },
    ];
  }

  getProfilePicture(user: string) {
    return this.profileImages.find((it) => it.userID == user)?.imageUrl;
  }
  openTaskDialog(task: Task) {
    this.taskFormGroup.get('linkedTask')?.setValue([task.id])
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

  handleTaskEmitters(
    task: Task,
    action: 'delete' | 'add' | 'status' | 'input' | 'output'
  ) {
    switch (action) {
      case 'add':
        break;
      case 'delete':
        break;
      case 'input':
        break;
      case 'output':
        break;
      case 'status':
        break;
    }
  }
  confirmLoading = false;
  async addTask() {
    //TODO call the api
    console.log(JSON.stringify(this.taskFormGroup.value));
    const task: Task = {
      id: this.taskFormGroup.value.id!,
      linkedTask: this.taskFormGroup.value.linkedTask!,
      name: this.taskFormGroup.value.name!,
      authors: this.taskFormGroup.value.authors!,
      input: this.taskFormGroup.value.input!,
      isMilestone: this.taskFormGroup.value.isMilestone!,
      start: this.taskFormGroup.value.range![0],
      expire: this.taskFormGroup.value.range![1],
      status: TaskStatus.Startable,
    };
    this.project.tasks.push(task);
    this.taskSignal.set(this.project.tasks);
    this.tasks = this.project.tasks.map(convertTaskToGanttTask);

    this.confirmLoading = true;
    this.messageService.add({
      severity: 'success',
      summary: this.translateService.instant('addedTask'),
      detail: `Task ${task.name} ${this.translateService.instant('added')}`,
      life: 3000,
    });
    await new Promise((resolve) => setTimeout(() => resolve(undefined), 1000));
    this.confirmLoading = false;
    this.viewMode = 'list';

    this.cd.detectChanges();
  }
  searchNewMember(v: string) {
    //TODO call the api
    this.userList = ['ciro', 'gamma', 'alessio'];
  }
  addMembers() {
    //TODO call the api
    this.closeDialog();
  }
  delete() {
    //TODO call the api
    this.closeDialog();
  }
  openDeleteMemberPopup(user: string, event: Event) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: this.translateService.instant('deleteMemberPopup'),
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
      },
    });
  }

  openDeleteTaskPopup(taskID: string, event: Event) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: this.translateService.instant('deleteMemberPopup'),
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
