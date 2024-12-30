import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NavbarComponent } from "./navbar/navbar.component";
import { FooterComponent } from "./footer/footer.component";
import { ThemeService } from './service/theme.service';
import { SessionService } from './service/session.service';
import {ToastModule} from 'primeng/toast'
import { MessageService } from 'primeng/api';
import { onMessageSubject } from './service/toast.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, FooterComponent, ToastModule],
  providers: [MessageService],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'selfie';

  constructor(private readonly translateService: TranslateService, protected readonly sessionService: SessionService, private readonly themeService: ThemeService, private readonly messageService: MessageService) { }

   ngOnInit(){
    onMessageSubject.subscribe(toast => this.messageService.add(toast))
    this.translateService.addLangs(['en'])
    this.themeService.initTheme()
   }


}
