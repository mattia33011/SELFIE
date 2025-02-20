import { Component, OnInit } from '@angular/core';
import { ProgressBarModule } from 'primeng/progressbar';
import { ButtonModule } from 'primeng/button';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ThemeService } from '../service/theme.service';
import { AvatarModule } from 'primeng/avatar';
import { SplitterModule } from 'primeng/splitter';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Knob } from 'primeng/knob';
import { ButtonGroupModule } from 'primeng/buttongroup';
import { SelectButtonModule } from 'primeng/selectbutton';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TableModule } from 'primeng/table';


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
        //TranslatePipe,
        FormsModule,
        AvatarModule,
        SplitterModule,
        ReactiveFormsModule,
        ButtonGroupModule,
        SelectButtonModule,
        Knob,
        CommonModule,
        InputTextModule,
        InputNumberModule,
        TableModule
        
    ],
    templateUrl: './pomodoro.components.html',
    styleUrl: './pomodoro.components.css',
    providers: [MessageService],
})
export class PomodoroComponent {
    formGroup = new FormGroup({
        timer: new FormControl(60) // Inizializza con 25 minuti
    });

    standardTime: number = 60; // 25 minuti
    interval?: number;
    isRunning: boolean = false;
    startStop: string = "START";

    stateOptions: any[] = [
        { label: "Pomodoro", value: "pomodoro" },
        { label: 'Short Break', value: 'shortBreak' },
        { label: 'Long Break', value: 'longBreak' }
    ];
    //value: string = 'off';
    value: string = 'pomodoro';

    tasks: Task[] = [];
    newTaskName: string = '';
    newTaskPomodoros: number = 1;

    constructor(
        private readonly messageService: MessageService,
        private readonly translateService: TranslateService,
        private readonly themeService: ThemeService
    ) {
        this.remaningTime = this.standardTime;
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
            this.startStop = 'START';
        } else {
            this.startTimer();
            this.startStop = 'STOP';
        }
    }

    startTimer() {
        if (this.isRunning) return;
        this.isRunning = true;

        this.interval = window.setInterval(() => {
            this.remaningTime--;
            if (this.remaningTime <= 0) {
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
        this.remaningTime = this.standardTime; // Reset al valore di default
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
