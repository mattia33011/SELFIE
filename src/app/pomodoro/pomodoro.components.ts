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
        Knob
    ],
    templateUrl: './pomodoro.components.html',
    styleUrl: './pomodoro.components.css',
    providers: [MessageService],
})
export class PomodoroComponent{

    formGroup = new FormGroup({
        timer: new FormControl(0, )
    })
    standardTime: number = 1500 // 25 minuti, tempo in secondi
    //numero standard e remaning time separati per permettere personalizzazione del timer
    interval?: number;
    isRunning: boolean = false;

    startStop: string = "START"; // valore iniziale
    formattedTimer: string = "25:00";

    stateOptions: any[] =[{label: "Pomodoro", value:"pomodoro"},{ label: 'Short Break', value: 'shortBreak' },{ label: 'Long Break', value: 'longBreak' }]
    value: string = 'off';

    constructor(
        private readonly messageService: MessageService,
        private readonly translateService: TranslateService,
        private readonly themeService: ThemeService
    ) {
        this.remaningTime=this.standardTime
        this.selectedLang = this.languages.find(
            (it) => it.lang == this.translateService.currentLang
          );
          this.selectedTheme = themeService.isDarkMode() ? 'dark' : 'light' 
    }

    selectedLang?: { lang: string; flag: string };
    languages = [
      { lang: 'it', flag: '🇮🇹' },
      { lang: 'en', flag: '🇬🇧' },
    ];
    selectedTheme: 'dark' | 'light'

    changeLang(lang: string) {
        localStorage.setItem('lang', lang);
        this.translateService.use(lang);
    }
    
    setTheme(event: { value: string }) {
        this.themeService.setDarkMode(event.value == 'dark');
    }

    clickButton(){
        if(this.isRunning){
            this.stopTimer()
            this.startStop='START'
        }else{
            this.startTimer()
            this.startStop='STOP'
        }
    }

    startTimer(){   //faccio partire il timer
        if(this.isRunning){ 
            return
        }
        this.isRunning=true;
        this.interval=window.setInterval(() => {
            this.remaningTime--;
            this.getTime()

            if(this.remaningTime<=0){
                this.stopTimer();
                this.messageService.add({
                //MESSAGGIO X SERVER
                //TO DO
            });
            }
    }, 1000)

    }

    set remaningTime(value: number){
        this.formGroup.get("timer")?.setValue(value);
    }
    get remaningTime(){
        return this.formGroup.get("timer")!.value as number;
    }

    stopTimer(){    //stoppo il timer
        if(this.interval){
            clearInterval(this.interval);
            this.interval=undefined;
        }
        this.isRunning=false;
    }

    resetTimer(){
        this.stopTimer()
        this.remaningTime=this.standardTime //resettiamo al default
    }

    setCustomTime(seconds: number){
        this.remaningTime=seconds;
    }

    getTime(){
        let minutes=Math.floor(this.remaningTime/60);
        let seconds=this.remaningTime%60
        // Formattazione del timer in MM:SS
        const formattedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
        const formattedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;
        this.formattedTimer = `${formattedMinutes}:${formattedSeconds}`;
    }
}
