import { Component } from '@angular/core';
import { SessionService } from '../service/session.service';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

  constructor(protected readonly sessionService: SessionService) { }

}
