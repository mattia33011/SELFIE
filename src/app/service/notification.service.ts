import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  constructor() {
    this.requestPermission();
  }

  private readonly defaultOptions: NotificationOptions = {
    icon: 's-logo.png',
  };
  requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      return Promise.reject('Questo browser non supporta le notifiche');
    }
    return Notification.requestPermission();
  }

  showNotification(title: string, callbackOnClick: () => void, options?: NotificationOptions): void {
    if (!('Notification' in window)) {
      console.warn('Notifiche non supportate');
      return;
    }
    if (Notification.permission !== 'granted') {
      console.warn('Permesso per le notifiche non concesso');
      return;
    }

    const notification = new Notification(title, {
      ...this.defaultOptions,
      ...options,
    });
    notification.onclick = callbackOnClick
  }
}
