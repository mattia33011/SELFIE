import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  constructor() {
    this.requestPermission();
  }

  requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      return Promise.reject('Questo browser non supporta le notifiche');
    }
    return Notification.requestPermission();
  }

  showNotification(title: string, options?: NotificationOptions): void {
    if (!('Notification' in window)) {
      console.warn('Notifiche non supportate');
      return;
    }

    if (Notification.permission === 'granted') {
      const notification = new Notification(title, { ...options, icon: 's-logo.png' });
      notification.onclick = () => window.focus()
    }
     else {
      console.warn('Permesso per le notifiche non concesso');
    }
  }
}
