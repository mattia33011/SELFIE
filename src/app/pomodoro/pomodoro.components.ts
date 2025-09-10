import { Component, OnInit, HostListener } from '@angular/core';
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
import { timer } from 'rxjs';
import { Task, Pomodoro, TaskDTO, StudySessionDTO, StudySession } from '../../types/pomodoro';
import { SessionService } from '../service/session.service';
import { forkJoin, Observable } from 'rxjs';
import { ApiService } from '../service/api.service';
import { stringToDate } from '../../utils/timeConverter';
import { ToastModule } from 'primeng/toast';
import { TimeMachineService } from '../service/time-machine.service';


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
    ToastModule
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
    id: '1'
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
    private readonly themeService: ThemeService,
    private readonly apiService: ApiService,
    protected readonly sessionService: SessionService,
    protected readonly timeMachine: TimeMachineService
  ) {
    this.remaningTime = this.pomodoro.pomodoroDuration;
  }

  ngOnInit() {
    this.formGroup.patchValue({
      timer: this.pomodoro.pomodoroDuration,
    });

    this.loadTasks();
    this.loadPomodoro();
    this.loadSessions();
  }

  loadTasks(){
     this.apiService.getTasks(
        this.sessionService.getSession()!.user.username!,
        this.sessionService.getSession()!.token!
      ).subscribe({
      next: (response) => {
          let i = 0;
          this.tasks.push(
            ...(response as TaskDTO[]).map((it) => ({
              id: i++,
              _id: it._id,
              name: it.taskName,
              completed: it.taskCompleted,
            }))

          );}}
        )
      }

  loadPomodoro(){
     this.apiService.getPomodoro(
        this.sessionService.getSession()!.user.username!,
        this.pomodoro.id,
        this.sessionService.getSession()!.token!
      )
      .subscribe({
      next: (response) => {
        let aggiunta = response as Pomodoro;
          if(aggiunta != null && aggiunta.pomodoroNumber != null && aggiunta.pomodoroType!= null){
            this.pomodoro  = response as Pomodoro;
            this.updateKnobTime();
          }else{
            this.pomodoro = {
              pomodoroNumber: 1,
              pomodoroType: 'pomodoro',
              pomodoroDuration: 25 * 60,
              shortBreakDuration: 5 * 60,
              longBreakDuration: 15 * 60,
              longBreakInterval: 4,
              id: '1'
            } as Pomodoro
          };
        }}
        )
  }

  loadSessions(){
    this.apiService.getStudySessions(
        this.sessionService.getSession()!.user.username!,
        this.sessionService.getSession()!.token!
      ).subscribe({
      next: (response) => {
          this.pomodoroHistory = (response as {
            id: number;
            pomodoroNumber: number;
            taskCompleted: number;
            date: string;
            _id?: string;
          }[]).map(it => ({
            id: it.id,
            pomodoroNumber: it.pomodoroNumber,
            taskCompleted: it.taskCompleted,
            date: it.date,
            _id: it._id
          })
        )}})
  }

showNotification(type: string) {
  try {
    if (!this.messageService) {
      console.error('MessageService is not available');
      return;
    }

    const keys = type === "pomodoro"
      ? ['pomodoro.pomodoroFinished', 'pomodoro.pomodoroDesc']
      : ['pomodoro.breakFinished', 'pomodoro.breakDesc'];

    this.translateService.get(keys).subscribe(translations => {
      this.messageService.add({
        severity: type === "pomodoro" ? 'success' : 'info',
        summary: translations[keys[0]],
        detail: translations[keys[1]],
        life: 3000
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
    console.log(this.pomodoroVisuale)
  }

  saveSettings() {
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
    this.remaningTime = this.pomodoro.pomodoroDuration;
    this.stopTimer();
    this.startStop = 'START';
    this.pause = false;
    this.pomodoro.pomodoroType = "pomodoro";
    this.updateKnobTime();
    this.chiamataPomodoro();
  }

  pauses() {
    if (!this.pause) {
      if (this.pomodoro.pomodoroNumber % this.pomodoro.longBreakInterval == 0) {
        this.remaningTime = this.pomodoro.longBreakDuration;
        this.knobTIME = this.pomodoro.longBreakDuration;
        this.pomodoro.pomodoroType = "longBreak";
        this.showNotification("pomodoro");
      } else {
        this.remaningTime = this.pomodoro.shortBreakDuration;
        this.knobTIME = this.pomodoro.shortBreakDuration;
        this.pomodoro.pomodoroType = "shortBreak";
        this.showNotification("pomodoro");
      }
      this.pomodoro.pomodoroNumber++;
    } else {
      this.remaningTime = this.pomodoro.pomodoroDuration;
      this.knobTIME = this.pomodoro.pomodoroDuration;
      this.pomodoro.pomodoroType = "pomodoro";
      this.showNotification("break");
    }
    this.startStop = 'START';
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
    if(this.newTaskName == '') {
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
    if(!now)
      return;
    
      const dateCompleted =
      now.toLocaleDateString() +
      ' ' +
      now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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

  //to-do: programmare dei cicli di studio
  //input: quante ore devi studiare? (te lo fa in multipli di 5) e ti da un output con 2 diverse opzioni? cicli da 20-5-10 oppure da 30-10-15

}
