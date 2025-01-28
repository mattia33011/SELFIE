import { Component, OnInit } from '@angular/core';
import { ProgressBarModule } from 'primeng/progressbar';
import { ButtonModule } from 'primeng/button';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ThemeService } from '../service/theme.service';
import { Toolbar } from 'primeng/toolbar';
import { AvatarModule } from 'primeng/avatar';
import { SplitterModule } from 'primeng/splitter';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Knob } from 'primeng/knob';

@Component({
    selector: 'app-timer',
    imports: [
        ProgressBarModule,
        ButtonModule,
        CardModule,
        //TranslatePipe,
        FormsModule,
        Toolbar,
        AvatarModule,
        SplitterModule,
        ReactiveFormsModule,
        Knob
    ],
    templateUrl: './pomodoro.components.html',
    styleUrl: './pomodoro.components.css',
    providers: [MessageService],
})
export class PomodoroComponent{

    standardTime: number = 1200 // 25 minuti, tempo in secondi
    remaningTime: number = this.standardTime; 
    //numero standard e remaning time separati per permettere personalizzazione del timer
    interval?: number;
    isRunning: boolean = false;

    startStop: string = "START"; // valore iniziale


    constructor(
        private readonly messageService: MessageService,
        private readonly translateService: TranslateService,
        private readonly themeService: ThemeService
    ) {
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

            if(this.remaningTime<=0){
                this.stopTimer();
                this.messageService.add({
                //MESSAGGIO X SERVER
                //TO DO
            });
            }
    }, 1000)

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
}
