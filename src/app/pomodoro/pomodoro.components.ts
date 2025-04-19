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


interface Task {
    id: number;
    name: string;
    completed: boolean;
}

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
    providers: [MessageService],
})
export class PomodoroComponent implements OnInit {
    standardTime: number = 60; // 25 minuti
    interval?: number;
    isRunning: boolean = false;
    startStop: string = "START";

    stateOptions: any[] = [
        { label: "Pomodoro", value: "pomodoro" },
        { label: 'Short Break', value: 'shortBreak' },
        { label: 'Long Break', value: 'longBreak' }
    ];
    value: string = 'pomodoro';
    pomodoroTimes: number = 1;
    knobTIME: number = 25 * 60; // Inizializza con 25 minuti
    pause: boolean = false;

    tasks: Task[] = [];
    newTaskName: string = '';
    newTaskPomodoros: number = 1;

    //variabili per le impostazioni del timer
    pomodoro: number = 25 * 60;
    shortBreak: number = 5 * 60;
    longBreak: number = 15 * 60;
    longBreakInterval: number = 4;

    //variabili visualizzazione finestra di dialogo
    pomodoroVisuale: number = this.pomodoro / 60;
    shortBreakVisuale: number = this.shortBreak / 60;
    longBreakVisuale: number = this.longBreak / 60;

    visible: boolean = false; //variabile per la visibilità della finestra di dialogo

    formGroup = new FormGroup({
        timer: new FormControl(this.pomodoro) // Inizializza con 25 minuti
    });

    screenWidth: number = window.innerWidth;
    
    @HostListener('window:resize', ['$event'])
    onResize(event: Event): void {
        this.screenWidth = (event.target as Window).innerWidth;
    }

    constructor(
        private readonly messageService: MessageService,
        private readonly translateService: TranslateService,
        private readonly themeService: ThemeService
    ) {
        this.remaningTime = this.pomodoro;
    }

    ngOnInit() {
        this.formGroup.patchValue({
            timer: this.pomodoro
        });
    }

    showDialog() { //funzione per mostrare la finestra per le impostazioni del timer
        this.visible = true;
    }

    saveSettings() {
        this.pomodoro = (this.pomodoroVisuale ?? 0) * 60;
        this.shortBreak = (this.shortBreakVisuale ?? 0) * 60;
        this.longBreak = (this.longBreakVisuale ?? 0) * 60;
        this.longBreakInterval = this.longBreakInterval ?? 0;
        this.visible = false;

        // Aggiorna il FormGroup con i nuovi valori
        this.formGroup.patchValue({
            timer: this.pomodoro
        });

        this.updateKnobTime();
        this.setUpTimer();
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
        this.remaningTime = this.pomodoro;
        this.stopTimer();
        this.startStop = 'START';
        this.pause=false;
    }

    pauses(){
        if(!this.pause){
            if(this.pomodoroTimes % this.longBreakInterval == 0){
                this.remaningTime = this.longBreak;
                this.knobTIME = this.longBreak;
            } else {
                this.remaningTime = this.shortBreak;
                this.knobTIME = this.shortBreak;
            }
            this.pomodoroTimes++;
        }else{
            this.remaningTime = this.pomodoro;
            this.knobTIME = this.pomodoro;
        }
        this.startStop = 'START';
        this.pause=!this.pause;
        
    }

    startTimer() {
        if (this.isRunning) return;
        this.isRunning = true;

        this.interval = window.setInterval(() => {
            this.remaningTime--;
            if (this.remaningTime <= 0) {
                this.pauses();
                this.stopTimer();
                this.messageService.add({
                    // TODO: Aggiungere messaggio al server
                });
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
        this.pomodoro = 25 * 60;
        this.shortBreak = 5 * 60;
        this.longBreak = 15 * 60;
        this.longBreakInterval = 4;

        //aggiorno la visualizzazione
        this.pomodoroVisuale = this.pomodoro / 60;
        this.shortBreakVisuale = this.shortBreak / 60;
        this.longBreakVisuale = this.longBreak / 60;
        this.visible = false;
        this.updateKnobTime();
        this.setUpTimer();
    }

    updateKnobTime() {
        if (this.value === 'pomodoro') {
            this.knobTIME = this.pomodoro;
        } else if (this.value === 'shortBreak') {
            this.knobTIME = this.shortBreak;
        } else if (this.value === 'longBreak') {
            this.knobTIME = this.longBreak;
        }
    }

    setCustomTime(seconds: number) {
        this.remaningTime = seconds;
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
            this.newTaskPomodoros = 1;
        }
    }

    removeTask(index: number) {
        this.tasks.splice(index, 1);
    }

    completeTask(index: number) {
        this.tasks[index].completed = true;
    }
    
}