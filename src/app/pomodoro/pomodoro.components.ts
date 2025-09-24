import { Component, OnInit, HostListener, effect } from '@angular/core';
import { ProgressBarModule } from 'primeng/progressbar';
import { ButtonModule } from 'primeng/button';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ThemeService } from '../service/theme.service';
import { AvatarModule } from 'primeng/avatar';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Knob } from 'primeng/knob';
import { ButtonGroupModule } from 'primeng/buttongroup';
import { SelectButtonModule } from 'primeng/selectbutton';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TableModule } from 'primeng/table';
import { DividerModule } from 'primeng/divider';
import { DialogModule } from 'primeng/dialog';
import {
  Task,
  Pomodoro,
  TaskDTO,
  StudySessionDTO,
  StudySession,
  StudyPlan,
  StudyStep,
  dayInfo,
} from '../../types/pomodoro';
import { SessionService } from '../service/session.service';
import { ApiService } from '../service/api.service';
import { ToastModule } from 'primeng/toast';
import { TimeMachineService } from '../service/time-machine.service';
import { RadioButtonModule } from 'primeng/radiobutton';
import { MessageModule } from 'primeng/message';
import { IftaLabelModule } from 'primeng/iftalabel';
import { DatePickerModule } from 'primeng/datepicker';
import { NotificationService } from '../service/notification.service';

@Component({
  selector: 'app-timer',
  imports: [
    ProgressBarModule,
    ButtonModule,
    CardModule,
    TranslatePipe,
    FormsModule,
    AvatarModule,
    ReactiveFormsModule,
    ButtonGroupModule,
    SelectButtonModule,
    Knob,
    CommonModule,
    InputTextModule,
    InputNumberModule,
    TableModule,
    DividerModule,
    DialogModule,
    ToastModule,
    RadioButtonModule,
    MessageModule,
    IftaLabelModule,
    DatePickerModule,
  ],
  templateUrl: './pomodoro.components.html',
  styleUrl: './pomodoro.components.css',
  providers: [MessageService, ApiService],
})
export class PomodoroComponent implements OnInit {
  //variabili per il timer
  standardTime: number = 60; // 25 minuti
  interval?: number;
  isRunning: boolean = false;
  startStop: string = 'START';

  knobTIME: number = 25 * 60; // Inizializza con 25 minuti
  pause: boolean = false;

  tasks: Task[] = [];
  newTaskName: string = '';
  completedTasks: number = 0;

  //variabili per le impostazioni del timer
  pomodoro: Pomodoro = {
    pomodoroNumber: 1,
    pomodoroType: 'pomodoro',
    pomodoroDuration: 25 * 60,
    shortBreakDuration: 5 * 60,
    longBreakDuration: 15 * 60,
    longBreakInterval: 4,
    id: '1',
  } as Pomodoro;

  //variabili visualizzazione finestra di dialogo
  pomodoroVisuale: number = this.pomodoro.pomodoroDuration / 60;
  shortBreakVisuale: number = this.pomodoro.shortBreakDuration / 60;
  longBreakVisuale: number = this.pomodoro.longBreakDuration / 60;

  visible: boolean = false; //variabile per la visibilità della finestra di dialogo

  formGroup = new FormGroup({
    timer: new FormControl(this.pomodoro.pomodoroDuration), // Inizializza con 25 minuti
  });

  screenWidth: number = window.innerWidth;

  pomodoroHistory: StudySession[] = [];

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.screenWidth = (event.target as Window).innerWidth;
  }

  constructor(
    private readonly messageService: MessageService,
    private readonly translateService: TranslateService,
    private readonly apiService: ApiService,
    protected readonly sessionService: SessionService,
    protected readonly timeMachine: TimeMachineService,
    private readonly notificationService: NotificationService
  ) {
    this.remaningTime = this.pomodoro.pomodoroDuration;
    effect(() => {
      const date = timeMachine.today();
      this.loadPlan(date);
    });
  }

  ngOnInit() {
    this.formGroup.patchValue({
      timer: this.pomodoro.pomodoroDuration,
    });

    this.loadPlan(null);
    this.loadTasks();
    this.loadPomodoro();
    this.loadSessions();
  }

  dayIndex: number = 0;

  loadPlan(ifDate: any) {
    this.apiService
      .getStudyPlans(
        this.sessionService.getSession()!.user.username!,
        this.sessionService.getSession()!.token!
      )
      .subscribe({
        next: (response) => {
          this.fullPlans = response as StudyPlan[];
          let today = new Date();
          if (ifDate) {
            today = ifDate;
          } else {
            today = this.timeMachine.today() as Date;
          }

          if (!today) return;
          today.setHours(0, 0, 0, 0);

          const normalizeDate = (d: Date): number => {
            const date = new Date(d);
            date.setHours(0, 0, 0, 0);
            return date.getTime();
          };

          const matchingPlan = this.fullPlans.find((plan) =>
            plan.days.some((d) => normalizeDate(d.day) === today.getTime())
          );

          if (matchingPlan) {
            const todayIndex = matchingPlan.days.findIndex(
              (d) => normalizeDate(d.day) === today.getTime()
            );
            if (
              matchingPlan.days[todayIndex].step >= matchingPlan.plan.length
            ) {
              this.studyCicle = false;
              this.dayIndex = 0;
            } else {
              this.dayIndex = todayIndex !== -1 ? todayIndex : 0;
              this.studyCicle = true;
              this.plan = matchingPlan;
              this.steps = matchingPlan.plan;
            }
          } else {
            this.studyCicle = false;
            this.dayIndex = 0;
          }
        },
        error: (err) => console.error('Errore nel caricamento piani:', err),
      });
  }

  loadTasks() {
    this.apiService
      .getTasks(
        this.sessionService.getSession()!.user.username!,
        this.sessionService.getSession()!.token!
      )
      .subscribe({
        next: (response) => {
          let i = 0;
          this.tasks.push(
            ...(response as TaskDTO[]).map((it) => ({
              id: i++,
              _id: it._id,
              name: it.taskName,
              completed: it.taskCompleted,
            }))
          );
        },
      });
  }

  loadPomodoro() {
    this.apiService
      .getPomodoro(
        this.sessionService.getSession()!.user.username!,
        this.pomodoro.id,
        this.sessionService.getSession()!.token!
      )
      .subscribe({
        next: (response) => {
          let aggiunta = response as Pomodoro;
          if (
            aggiunta != null &&
            aggiunta.pomodoroNumber != null &&
            aggiunta.pomodoroType != null
          ) {
            this.pomodoro = response as Pomodoro;
            this.pomodoroVisuale = this.pomodoro.pomodoroDuration / 60;
            this.shortBreakVisuale = this.pomodoro.shortBreakDuration / 60;
            this.longBreakVisuale = this.pomodoro.longBreakDuration / 60;
            this.updateKnobTime();
          } else {
            this.pomodoro = {
              pomodoroNumber: 1,
              pomodoroType: 'pomodoro',
              pomodoroDuration: 25 * 60,
              shortBreakDuration: 5 * 60,
              longBreakDuration: 15 * 60,
              longBreakInterval: 4,
              id: '1',
            } as Pomodoro;
          }
        },
      });
  }

  loadSessions() {
    this.apiService
      .getStudySessions(
        this.sessionService.getSession()!.user.username!,
        this.sessionService.getSession()!.token!
      )
      .subscribe({
        next: (response) => {
          this.pomodoroHistory = (
            response as {
              id: number;
              pomodoroNumber: number;
              taskCompleted: number;
              date: string;
              _id?: string;
            }[]
          ).map((it) => ({
            id: it.id,
            pomodoroNumber: it.pomodoroNumber,
            taskCompleted: it.taskCompleted,
            date: it.date,
            _id: it._id,
          }));
        },
      });
  }

  showNotification(type: string) {
    try {
      if (!this.messageService) {
        console.error('MessageService is not available');
        return;
      }

      const keys =
        type === 'pomodoro'
          ? ['pomodoro.pomodoroFinished', 'pomodoro.pomodoroDesc']
          : ['pomodoro.breakFinished', 'pomodoro.breakDesc'];

      this.translateService.get(keys).subscribe((translations) => {
        this.notificationService.showNotification(
          translations[keys[0]],
          () => {
            window.focus();
          },
          {
            body: translations[keys[1]],
          }
        );

        this.messageService.add({
          severity: type === 'pomodoro' ? 'success' : 'info',
          summary: translations[keys[0]],
          detail: translations[keys[1]],
          life: 3000,
        });
      });
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }

  chiamataPomodoro() {
    this.apiService
      .putPomodoro(
        this.sessionService.getSession()!.user.username!,
        this.pomodoro,
        this.sessionService.getSession()!.token!
      )
      .subscribe({
        next: (response) => {
          console.log(response);
        },
        error: (error) => {
          console.log(error);
        },
      });
  }

  showDialog() {
    //funzione per mostrare la finestra per le impostazioni del timer
    this.visible = true;
  }

  saveSettings() {
    if (this.studyCicle) {
      this.visible = false;
      this.startTimer();
      return;
    }
    this.pomodoro.pomodoroDuration = (this.pomodoroVisuale ?? 0) * 60;
    this.pomodoro.shortBreakDuration = (this.shortBreakVisuale ?? 0) * 60;
    this.pomodoro.longBreakDuration = (this.longBreakVisuale ?? 0) * 60;
    this.pomodoro.longBreakInterval = this.pomodoro.longBreakInterval ?? 0;
    this.visible = false;

    // Aggiorna il FormGroup con i nuovi valori
    this.formGroup.patchValue({
      timer: this.pomodoro.pomodoroDuration,
    });
    this.setUpTimer();
  }

  set remaningTime(value: number) {
    this.formGroup.get('timer')?.setValue(value);
  }

  get remaningTime() {
    return this.formGroup.get('timer')!.value as number;
  }

  clickButton() {
    if (this.isRunning) {
      this.stopTimer();
      this.startStop = 'START';
    } else {
      this.startTimer();
      this.startStop = 'STOP';
    }
  }
  skipTimer() {
    this.stopTimer();
    this.pauses();
    this.updateKnobTime();
  }

  setUpTimer() {
    if (this.studyCicle) {
      this.visible = false;
      this.startTimer();
      return;
    }
    this.remaningTime = this.pomodoro.pomodoroDuration;
    this.pomodoro.pomodoroType = 'pomodoro';

    this.stopTimer();
    this.startStop = 'START';
    this.pause = false;

    this.updateKnobTime();
    this.chiamataPomodoro();
  }

  chiamataPlan() {
    if (!this.plan._id) {
      console.warn('Plan non ha _id, verrà creato un nuovo piano');
    }

    this.apiService
      .putStudyPlans(
        this.sessionService.getSession()!.user.username!,
        this.plan,
        this.sessionService.getSession()!.token!
      )
      .subscribe({
        next: (response) => {
          const toUpdate = response as StudyPlan;
          // Aggiorna il piano locale con l'_id restituito dal backend se non esiste
          if (!this.plan._id && toUpdate && toUpdate._id) {
            this.plan._id = toUpdate._id;
          }
          console.log('Piano aggiornato correttamente', response);
        },
        error: (error) => console.log(error),
      });
  }

  pauses() {
    if (this.studyCicle && this.plan) {
      this.remaningTime =
        this.plan.plan[this.plan.days[this.dayIndex].step].duration * 60;
      this.pomodoro.pomodoroType =
        this.plan.plan[this.plan.days[this.dayIndex].step].type;
      this.plan.days[this.dayIndex].step++;
      this.chiamataPlan();
      this.showNotification(this.pomodoro.pomodoroType);

      if (this.plan.days[this.dayIndex].step >= this.plan.plan.length) {
        console.log('entro!');
        this.studyCicle = false;
        this.plan = {
          settings: this.pomodoro,
          plan: [],
          totalTime: 0,
          days: [],
        };
        const key = ['pomodoro.finishedCycle', 'pomodoro.cycleDesc'];

        this.translateService.get(key).subscribe((translations) => {
          this.messageService.add({
            severity: 'success',
            summary: translations[key[0]],
            detail: translations[key[1]],
            life: 3000,
          });
        });
      }
    } else if (!this.pause) {
      if (this.pomodoro.pomodoroNumber % this.pomodoro.longBreakInterval == 0) {
        this.remaningTime = this.pomodoro.longBreakDuration;
        this.knobTIME = this.pomodoro.longBreakDuration;
        this.pomodoro.pomodoroType = 'longBreak';
        this.showNotification('pomodoro');
      } else {
        this.remaningTime = this.pomodoro.shortBreakDuration;
        this.knobTIME = this.pomodoro.shortBreakDuration;
        this.pomodoro.pomodoroType = 'shortBreak';
        this.showNotification('pomodoro');
      }
      this.pomodoro.pomodoroNumber++;
    } else {
      this.remaningTime = this.pomodoro.pomodoroDuration;
      this.knobTIME = this.pomodoro.pomodoroDuration;
      this.pomodoro.pomodoroType = 'pomodoro';
      this.showNotification('break');
    }
    this.startStop = 'START';
    this.pomodoro.pomodoroNumber++;
    this.pause = !this.pause;
    this.updateKnobTime();
    this.chiamataPomodoro();
  }

  startTimer() {
    if (this.isRunning) return;
    this.isRunning = true;

    this.interval = window.setInterval(() => {
      this.remaningTime--;
      if (this.remaningTime <= 0) {
        this.pauses();
        this.stopTimer();
      }
    }, 1000);
  }

  stopTimer() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = undefined;
    }

    this.isRunning = false;
  }

  resetTimer() {
    this.stopTimer();
    if (this.studyCicle) {
      this.visible = false;
      this.startTimer();
      return;
    }
    this.pomodoro.pomodoroDuration = 25 * 60;
    this.pomodoro.shortBreakDuration = 5 * 60;
    this.pomodoro.longBreakDuration = 15 * 60;
    this.pomodoro.longBreakInterval = 4;

    //aggiorno la visualizzazione
    this.pomodoroVisuale = this.pomodoro.pomodoroDuration / 60;
    this.shortBreakVisuale = this.pomodoro.shortBreakDuration / 60;
    this.longBreakVisuale = this.pomodoro.longBreakDuration / 60;
    this.visible = false;
    this.updateKnobTime();
    this.setUpTimer();
    this.chiamataPomodoro();
  }

  updateKnobTime() {
    if (this.studyCicle && this.plan) {
      const currentStep = this.plan.plan[this.plan.days[this.dayIndex].step];
      this.pomodoro.pomodoroType = currentStep.type;
      this.knobTIME = currentStep.duration * 60;
      this.formGroup.get('timer')?.setValue(currentStep.duration * 60);
      return;
    }
    if (this.pomodoro.pomodoroType == 'pomodoro') {
      this.knobTIME = this.pomodoro.pomodoroDuration;
      this.formGroup.get('timer')?.setValue(this.pomodoro.pomodoroDuration);
    } else if (this.pomodoro.pomodoroType == 'shortBreak') {
      this.knobTIME = this.pomodoro.shortBreakDuration;
      this.formGroup.get('timer')?.setValue(this.pomodoro.shortBreakDuration);
    } else if (this.pomodoro.pomodoroType == 'longBreak') {
      this.knobTIME = this.pomodoro.longBreakDuration;
      this.formGroup.get('timer')?.setValue(this.pomodoro.longBreakDuration);
    }
  }

  get formattedTimer(): string {
    let minutes = Math.floor(this.remaningTime / 60);
    let seconds = this.remaningTime % 60;
    return `${minutes < 10 ? '0' : ''}${minutes}:${
      seconds < 10 ? '0' : ''
    }${seconds}`;
  }

  addTask() {
    if (this.newTaskName == '') {
      return;
    }
    if (this.newTaskName.trim()) {
      this.tasks.push({
        id: this.tasks.length + 1,
        name: this.newTaskName,
        completed: false,
      });
      this.newTaskName = '';
    }
    this.apiService
      .pushTask(
        this.sessionService.getSession()!.user.username!,
        [this.tasks[this.tasks.length - 1]],
        this.sessionService.getSession()!.token!
      )
      .subscribe({
        next: (response) => {
          console.log(response);
          var i = 0;
          this.tasks = (response as TaskDTO[]).map((it) => ({
            id: i++,
            _id: it._id,
            name: it.taskName,
            completed: it.taskCompleted,
          }));
        },
        error: (error) => {
          console.log(error);
        },
      });
  }

  removeTask(index: number) {
    const task = this.tasks[index];
    this.tasks.splice(index, 1);
    this.apiService
      .deleteTask(
        this.sessionService.getSession()!.user.username!,
        this.sessionService.getSession()!.token!,
        task!._id!
      )
      .subscribe({
        next: (response) => {
          console.log(response);
        },
        error: (error) => {
          console.log(error);
        },
      });
  }

  completeTask(index: number) {
    this.tasks[index].completed = true;
    this.completedTasks++;
    this.apiService
      .putTask(
        this.sessionService.getSession()!.user.username!,
        [this.tasks[index]],
        this.sessionService.getSession()!.token!
      )
      .subscribe({
        next: (response) => {
          console.log(response);
        },
        error: (error) => {
          console.log(error);
        },
      });
  }

  onTaskNameEdit(taskid: any, $event: any) {
    const task = this.tasks.find((task) => task.id === taskid);
    if (!task) {
      return;
    }
    this.apiService
      .putTask(
        this.sessionService.getSession()!.user.username!,
        [task],
        this.sessionService.getSession()!.token!
      )
      .subscribe({
        next: (response) => {
          console.log(response);
        },
        error: (error) => {
          console.log(error);
        },
      });
  }

  endSession() {
    if (this.pomodoro.pomodoroNumber == 0) {
      return;
    }
    const now = this.timeMachine.today();
    const forHours = new Date();
    if (!now) return;

    const dateCompleted =
      now.toLocaleDateString() +
      ' ' +
      forHours.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    this.pomodoroHistory.push({
      id: this.pomodoroHistory.length + 1,
      pomodoroNumber: this.pomodoro.pomodoroNumber,
      taskCompleted: this.completedTasks,
      date: dateCompleted,
    });
    this.pomodoro.pomodoroNumber = 1;
    this.completedTasks = 0;
    this.setUpTimer();
    this.apiService
      .putStudySession(
        this.sessionService.getSession()!.user.username!,
        [this.pomodoroHistory[this.pomodoroHistory.length - 1]],
        this.sessionService.getSession()!.token!
      )
      .subscribe({
        next: (response) => {
          console.log(response);
          this.pomodoroHistory = (response as StudySessionDTO[]).map((it) => ({
            id: this.pomodoroHistory.length + 1,
            _id: it._id,
            pomodoroNumber: it.pomodoroNumber,
            taskCompleted: it.taskCompleted,
            date: it.date,
          }));
        },
        error: (error) => {
          console.log(error);
        },
      });
    console.log(this.pomodoroHistory[0]._id);
  }

  removeSession(index: number) {
    const sessionToDelete = this.pomodoroHistory[index];
    this.pomodoroHistory.splice(index, 1);

    this.apiService
      .deleteStudySession(
        this.sessionService.getSession()!.user.username!,
        this.sessionService.getSession()!.token!,
        sessionToDelete._id!
      )
      .subscribe({
        next: (response) => {
          console.log(response);
        },
        error: (error) => {
          console.log(error);
          this.pomodoroHistory.splice(index, 0, sessionToDelete);
        },
      });
  }
  //PARTE DEI CICLI!
  visibleCicle: boolean = false;
  ripeti!: string;
  days: string[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  selectedDays: string[] = [];
  ciclesInput!: number;
  steps: StudyStep[] = [];
  plan: StudyPlan = {
    settings: this.pomodoro,
    plan: [],
    totalTime: 0,
    days: [],
  };
  currentStepIndex: number = 0;
  studyCicle: boolean = false;
  endDate: Date | null = null;
  fullPlans: StudyPlan[] = [];

  toggleDay(day: string) {
    const i = this.selectedDays.indexOf(day);
    if (i > -1) {
      // Deseleziona
      this.selectedDays.splice(i, 1);
    } else {
      // Seleziona
      this.selectedDays.push(day);
    }
  }

  showCicles() {
    this.visibleCicle = true;
  }

  saveCicles() {
    console.log('Selected days:', this.selectedDays);
    this.studyCicle = true;
    this.generateStudyPlan(this.ciclesInput);
    this.visibleCicle = false;
    this.selectedDays = [];
    this.ripeti = '';
  }

  generateStudyPlan(hours: number) {
    if (hours == 0 || hours == null) hours = 1;
    const totaltimeMinutes = hours * 60; // ore in minuti
    const pomodoroDurationMin = this.pomodoro.pomodoroDuration / 60;
    const shortBreakDurationMin = this.pomodoro.shortBreakDuration / 60;
    const longBreakDurationMin = this.pomodoro.longBreakDuration / 60;

    const pomNumber = Math.floor(totaltimeMinutes / pomodoroDurationMin);
    const timeleft = totaltimeMinutes % pomodoroDurationMin;
    this.steps = [];

    let totalPlannedMinutes = 0;

    for (let i = 0; i < pomNumber; i++) {
      this.steps.push({
        step: i + 1,
        type: 'pomodoro',
        duration: pomodoroDurationMin,
      });
      totalPlannedMinutes += pomodoroDurationMin;

      if (
        (i + 1) % this.pomodoro.longBreakInterval === 0 &&
        i + 1 !== pomNumber
      ) {
        this.steps.push({
          step: i + 1,
          type: 'longBreak',
          duration: longBreakDurationMin,
        });
        totalPlannedMinutes += longBreakDurationMin;
      } else if (i + 1 !== pomNumber) {
        this.steps.push({
          step: i + 1,
          type: 'shortBreak',
          duration: shortBreakDurationMin,
        });
        totalPlannedMinutes += shortBreakDurationMin;
      }
    }

    if (timeleft > 0) {
      this.steps.push({
        step: pomNumber + 1,
        type: 'pomodoro',
        duration: timeleft,
      });
      totalPlannedMinutes += timeleft;
    }

    const toAdd: StudyPlan = {
      settings: this.pomodoro,
      plan: this.steps,
      totalTime: totalPlannedMinutes,
      days: (() => {
        const days: dayInfo[] = [];

        // Giorni già esistenti in tutti i piani salvati
        const allExistingDays = this.fullPlans.flatMap((p) =>
          p.days.map((d) => new Date(d.day).toLocaleDateString('it-IT'))
        );

        const dayMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        let startDate = this.timeMachine.today();
        if (!startDate) startDate = new Date();
        startDate.setHours(0, 0, 0, 0);

        const end = this.endDate ? new Date(this.endDate) : startDate;
        end.setHours(0, 0, 0, 0);

        // Se non ci sono giorni selezionati, aggiungi oggi
        if (this.selectedDays.length === 0) {
          const todayStr = startDate.toLocaleDateString('it-IT');
          if (!allExistingDays.includes(todayStr)) {
            days.push({ day: new Date(startDate), step: 0 });
          }
        } else {
          let current = new Date(startDate);
          while (current <= end) {
            const dayName = dayMap[current.getDay()];
            if (this.selectedDays.includes(dayName)) {
              const onlyDate = new Date(current);
              onlyDate.setHours(0, 0, 0, 0);

              const dateStr = onlyDate.toLocaleDateString('it-IT');
              if (!allExistingDays.includes(dateStr)) {
                days.push({ day: onlyDate, step: 0 });
              }
            }
            current.setDate(current.getDate() + 1);
          }
        }

        return days;
      })(),
    };

    if (toAdd.days.length === 0) {
      this.steps = [];

      const key = ['pomodoro.infoCycle', 'pomodoro.infoCycleDesc'];
      this.translateService.get(key).subscribe((translations) => {
        this.messageService.add({
          severity: 'success',
          summary: translations[key[0]],
          detail: translations[key[1]],
          life: 3000,
        });
      });
      this.studyCicle = false;
      return;
    }

    this.plan = toAdd;
    this.fullPlans.push(this.plan);

    // Salvataggio sul backend
    this.apiService
      .putStudyPlans(
        this.sessionService.getSession()!.user.username!,
        this.plan,
        this.sessionService.getSession()!.token!
      )
      .subscribe({
        next: (response) => {
          const toGetID = response as StudyPlan;
          if (response && toGetID._id) {
            this.plan._id = toGetID._id;
          }
          console.log(response);
        },
        error: (error) => console.log(error),
      });
    console.log(this.plan._id);
  }
  visibleCycleSettings: boolean = false;
  openCycleSettings() {
    this.visibleCycleSettings = true;
    this.visibleCicle = false;
  }

  get allDays() {
    const today = this.timeMachine.today();
    if (!today) return [];

    // Imposta l'orario a mezzanotte per confronto solo su giorno/mese/anno
    today.setHours(0, 0, 0, 0);

    return this.fullPlans.flatMap((plan) =>
      plan.days
        .filter((dayInfo) => {
          const day = new Date(dayInfo.day);
          day.setHours(0, 0, 0, 0);
          return day.getTime() >= today.getTime();
        })
        .map((dayInfo) => ({
          day: dayInfo.day,
          totalTime: plan.totalTime,
          planId: plan._id,
        }))
    );
  }

  removeCycle(index: number) {
    const dayToRemove = this.allDays[index];
    console.log('prova');
    if (!dayToRemove) return;

    const { day, planId } = dayToRemove;

    // Trova il piano corrispondente
    const planIndex = this.fullPlans.findIndex((p) => p._id === planId);
    if (planIndex === -1) return;

    const plan = this.fullPlans[planIndex];

    // Rimuovi il giorno da quel piano
    plan.days = plan.days.filter(
      (d) =>
        new Date(d.day).toLocaleDateString('it-IT') !==
        new Date(day).toLocaleDateString('it-IT')
    );

    if (plan.days.length === 0) {
      this.apiService
        .deleteStudyPlan(
          this.sessionService.getSession()!.user.username!,
          plan._id!,
          this.sessionService.getSession()!.token!
        )
        .subscribe({
          next: () => {
            this.fullPlans.splice(planIndex, 1); // rimuovi tutto il piano localmente
            console.log(`Piano ${plan._id} eliminato`);
          },
          error: (error) => console.log(error),
        });
    } else {
      this.apiService
        .putStudyPlans(
          this.sessionService.getSession()!.user.username!,
          plan,
          this.sessionService.getSession()!.token!
        )
        .subscribe({
          next: (updated) => {
            console.log(`Piano ${plan._id} aggiornato`, updated);
          },
          error: (error) => console.log(error),
        });
    }
  }
}
