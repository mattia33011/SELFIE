import { Injectable, Signal, WritableSignal, signal } from '@angular/core';
import { ApiService } from './api.service';
import { ReplaySubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TimeMachineService {
  private _today: WritableSignal<Date | undefined> = signal(undefined);
  readonly today = this._today.asReadonly();

  constructor(private apiService: ApiService) {
    this._setupTime();
  }

  private _setupTime() {
    this.apiService.getToday().subscribe((it) => {
      console.log('Setup time machine completed');
      this._today.update(() => new Date(it.today)) 
    });
  }

  setToday(date: Date, callback?: () => void) {
    this.apiService.setToday(date).subscribe({
      complete: () => {
        console.log('Time setted');
        this._today.update(() => date)
        if(callback)
          callback()
      },
    });
  }

  resetToday(callback?: () => void) {
    this.apiService.resetToday().subscribe({
      complete: () => {
        this._setupTime();
        if(callback)
          callback()
      },
    });
  }
}
