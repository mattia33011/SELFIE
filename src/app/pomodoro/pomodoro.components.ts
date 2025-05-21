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
import {Task, Pomodoro} from '../../types/pomodoro';
import {SessionService} from '../service/session.service';
import {forkJoin, Observable} from 'rxjs';
import {ApiService} from '../service/api.service';
import {stringToDate} from '../../utils/timeConverter';


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
    startStop: string = "START";


    knobTIME: number = 25 * 60; // Inizializza con 25 minuti
    pause: boolean = false;

    tasks: Task[] = [];
    newTaskName: string = '';
    completedTasks: number = 0;



    //variabili per le impostazioni del timer
    pomodoro: Pomodoro={
        pomodoroNumber: 1,
        pomodoroType: 'pomodoro',
        pomodoroDuration: 25 * 60,
        shortBreak: 5 * 60,
        longBreak: 15 * 60,
        longBreakInterval: 4
    }
    

    //variabili visualizzazione finestra di dialogo
    pomodoroVisuale: number = this.pomodoro.pomodoroDuration / 60;
    shortBreakVisuale: number = this.pomodoro.shortBreak / 60;
    longBreakVisuale: number = this.pomodoro.longBreak / 60;

    visible: boolean = false; //variabile per la visibilità della finestra di dialogo

    formGroup = new FormGroup({
        timer: new FormControl(this.pomodoro.pomodoroDuration) // Inizializza con 25 minuti
    });

    screenWidth: number = window.innerWidth;

    pomodoroHistory: { 
        pomodoroCompleted: number; 
        completedTasks: number 
        dateCompleted: string;
    }[] = [];

    
    @HostListener('window:resize', ['$event'])
    onResize(event: Event): void {
        this.screenWidth = (event.target as Window).innerWidth;
    }

    constructor(
        private readonly messageService: MessageService,
        private readonly translateService: TranslateService,
        private readonly themeService: ThemeService,
         private readonly apiService: ApiService, 
         protected readonly sessionService: SessionService
    ) {
        this.remaningTime = this.pomodoro.pomodoroDuration;
    }

    ngOnInit() {
        this.formGroup.patchValue({
            timer: this.pomodoro.pomodoroDuration
        });

        forkJoin([
            
            this.apiService.getTasks(this.sessionService.getSession()!.user.username!, this.sessionService.getSession()!.token!),
            this.apiService.getPomodoro(this.sessionService.getSession()!.user.username!, this.sessionService.getSession()!.token!),
            this.apiService.getStudySessions(this.sessionService.getSession()!.user.username!, this.sessionService.getSession()!.token!)
            ]).subscribe({
            next: (response) => {
                if (response[0]) {
                    this.tasks.push(...(response[0] as any[]).map(it => ({
                        ...it,
                        
                    })));
                }else if (response[1]) {
                    this.pomodoro = response[1] as Pomodoro;
                    this.pomodoroVisuale = this.pomodoro.pomodoroDuration / 60;
                    this.shortBreakVisuale = this.pomodoro.shortBreak / 60;
                    this.longBreakVisuale = this.pomodoro.longBreak / 60;
                    this.formGroup.patchValue({
                        timer: this.pomodoro.pomodoroDuration
                    });
                    this.updateKnobTime();
                }else if (response[2]) {
                    this.pomodoroHistory = response[2] as {
                        pomodoroCompleted: number; 
                        completedTasks: number 
                        dateCompleted: string;
                    }[];
                }
            },
            error: (error) => {
                console.log(error)
            },
            })
    }

    chiamataPomodoro(){
        this.apiService.putPomodoro(this.sessionService.getSession()!.user.username!, this.pomodoro, this.sessionService.getSession()!.token!).subscribe({
            next: (response) => {
                console.log(response);
            },
            error: (error) => {
                console.log(error);
            },
        });
    }

    showDialog() { //funzione per mostrare la finestra per le impostazioni del timer
        this.visible = true;
    }

    saveSettings() {
        this.pomodoro.pomodoroDuration = (this.pomodoroVisuale ?? 0) * 60;
        this.pomodoro.shortBreak = (this.shortBreakVisuale ?? 0) * 60;
        this.pomodoro.longBreak = (this.longBreakVisuale ?? 0) * 60;
        this.pomodoro.longBreakInterval = this.pomodoro.longBreakInterval ?? 0;
        this.visible = false;

        // Aggiorna il FormGroup con i nuovi valori
        this.formGroup.patchValue({
            timer: this.pomodoro.pomodoroDuration
        });

        this.updateKnobTime();
        this.setUpTimer();
        this.chiamataPomodoro();

    }

    set remaningTime(value: number) {
        this.formGroup.get("timer")?.setValue(value);
    }

    get remaningTime() {
        return this.formGroup.get("timer")!.value as number;
    }

    clickButton() {
        if (this.isRunning) {
            this.stopTimer();
            this.startStop ='START';
        } else {
            this.startTimer();
            this.startStop = 'STOP';
        }
    }
    skipTimer(){
        this.pauses();
        this.stopTimer();
    }

    setUpTimer() {
        this.remaningTime = this.pomodoro.pomodoroDuration;
        this.stopTimer();
        this.startStop = 'START';
        this.pause=false;
        this.pomodoro.pomodoroType='pomodoro';
        this.updateKnobTime();
        this.chiamataPomodoro();
    }

    pauses(){
        if(!this.pause){
            if(this.pomodoro.pomodoroNumber % this.pomodoro.longBreakInterval == 0){
                this.remaningTime = this.pomodoro.longBreak;
                this.knobTIME = this.pomodoro.longBreak;
                this.pomodoro.pomodoroType='longBreak';
            } else {
                this.remaningTime = this.pomodoro.shortBreak;
                this.knobTIME = this.pomodoro.shortBreak;
                this.pomodoro.pomodoroType='shortBreak';
            }
            this.pomodoro.pomodoroNumber++;
        }else{
            this.remaningTime = this.pomodoro.pomodoroDuration;
            this.knobTIME = this.pomodoro.pomodoroDuration;
            this.pomodoro.pomodoroType='pomodoro';
        }
        this.startStop = 'START';
        this.pause=!this.pause;
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
        this.pomodoro.shortBreak = 5 * 60;
        this.pomodoro.longBreak = 15 * 60;
        this.pomodoro.longBreakInterval = 4;

        //aggiorno la visualizzazione
        this.pomodoroVisuale = this.pomodoro.pomodoroDuration / 60;
        this.shortBreakVisuale = this.pomodoro.shortBreak / 60;
        this.longBreakVisuale = this.pomodoro.longBreak / 60;
        this.visible = false;
        this.updateKnobTime();
        this.setUpTimer();
        this.chiamataPomodoro();
    }

    updateKnobTime() {
        if (this.pomodoro.pomodoroType === 'pomodoro') {
            this.knobTIME = this.pomodoro.pomodoroDuration;
        } else if (this.pomodoro.pomodoroType === 'shortBreak') {
            this.knobTIME = this.pomodoro.shortBreak;
        } else if (this.pomodoro.pomodoroType === 'longBreak') {
            this.knobTIME = this.pomodoro.longBreak;
        }
    }



    get formattedTimer(): string {
        let minutes = Math.floor(this.remaningTime / 60);
        let seconds = this.remaningTime % 60;
        return `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }

    addTask() {
        if (this.newTaskName.trim()) {
            this.tasks.push({
                id: this.tasks.length + 1,
                name: this.newTaskName,
                completed: false
            });
            this.newTaskName = '';
        }
        this.apiService.pushTask(this.sessionService.getSession()!.user.username!, this.tasks, this.sessionService.getSession()!.token!).subscribe({
            next: (response) => {
                console.log(response);
            },
            error: (error) => { 
                console.log(error);
            },
        });
    }

    removeTask(index: number) {
        this.tasks.splice(index, 1);
        this.apiService.deleteTask(this.sessionService.getSession()!.user.username!, this.sessionService.getSession()!.token!, index).subscribe({
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
        this.apiService.putTask(this.sessionService.getSession()!.user.username!, this.tasks, this.sessionService.getSession()!.token!).subscribe({
            next: (response) => {   
                console.log(response);
            },
            error: (error) => { 
                console.log(error);
            },
        });
    }

    endSession(){
        if (this.pomodoro.pomodoroNumber==0){
            return;
        }
        const now = new Date();
        const dateCompleted = now.toLocaleDateString() + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        this.pomodoroHistory.push({
            pomodoroCompleted: this.pomodoro.pomodoroNumber, 
            completedTasks: this.completedTasks,
            dateCompleted: dateCompleted
        });
        this.pomodoro.pomodoroNumber = 1;
        this.completedTasks = 0;
        this.setUpTimer();
        this.apiService.pushStudySessions(this.sessionService.getSession()!.user.username!, this.pomodoroHistory, this.sessionService.getSession()!.token!).subscribe({
            next: (response) => {
                console.log(response);
            },
            error: (error) => { 
                console.log(error);
            },
        });
    }

    removeSession(index: number){
        this.pomodoroHistory.splice(index, 1);
        this.apiService.deleteStudySession(this.sessionService.getSession()!.user.username!, this.pomodoroHistory, this.sessionService.getSession()!.token!, index).subscribe({
            next: (response) => {
                console.log(response);
            },
            error: (error) => { 
                console.log(error);
            },
        });
    }
}