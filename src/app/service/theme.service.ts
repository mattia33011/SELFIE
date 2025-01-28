import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  constructor() {}

  private readonly isSystemDarkMode = () => window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  listen = new ReplaySubject<'dark' | 'light'>(2)
  initTheme() {    
    const element = document.querySelector('html');
    if(localStorage.getItem('dark') == undefined && this.isSystemDarkMode()) element?.classList.add('selfie-dark')
    else if (localStorage.getItem('dark') == 'true') element?.classList.add('selfie-dark');
  }

  isDarkMode = () => {
    const element = document.querySelector('html');
    return element?.classList.contains('selfie-dark') ?? false;
  };

  setDarkMode(val: boolean){
    const element = document.querySelector('html')
    localStorage.setItem('dark', val ? 'true' : 'false');
    val ? element?.classList.add('selfie-dark') : element?.classList.remove('selfie-dark')
    this.listen.next(val ? 'dark' : 'light')
  }

  toggleDarkMode() {
    const element = document.querySelector('html');
    element?.classList.toggle('selfie-dark');
    localStorage.setItem('dark', this.isDarkMode() ? 'true' : 'false');
    this.listen.next(this.isDarkMode() ? 'dark' : 'light')
  }
}
