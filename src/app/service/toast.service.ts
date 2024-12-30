import { ToastMessageOptions } from 'primeng/api';
import { ReplaySubject } from 'rxjs';

export const onMessageSubject = new ReplaySubject<ToastMessageOptions>()

